"""Generate a standalone CRUD module without loading settings or connecting to services."""

import ast
import difflib
import fcntl
import hashlib
import io
import json
import keyword
import os
import re
import stat
import tempfile
import tokenize
from dataclasses import dataclass
from pathlib import Path

from alembic.script import ScriptDirectory
from alembic.script.revision import RevisionError
from alembic.util import CommandError

TEMPLATES = Path(__file__).with_name("module_templates")
REGISTRY = Path("backend/app/config/modules.py")
RESERVED_ROUTES = {"auth", "changelog", "home", "login", "outside", "profile", "redirect", "401", "403", "404", "500"}


@dataclass(frozen=True)
class ModulePlan:
    files: dict[Path, str]
    registry_before: str
    registry_after: str
    module: str
    head: str
    revision: str


def _pascal(value: str) -> str:
    return "".join(part.capitalize() for part in value.split("_"))


def _validate_name(value: str) -> None:
    if not re.fullmatch(r"[a-z][a-z0-9]*(?:_[a-z0-9]+)*", value) or len(value) > 20 or keyword.iskeyword(value):
        raise ValueError("模块名和资源名须为 1–20 位小写 snake_case 标识符，不能使用 Python 关键字")


def _validate_title(value: str) -> None:
    # Labels are embedded in Python, Vue, JSON and template literals.
    if not value.strip() or len(value) > 40 or value != value.strip() or any(not (char.isalnum() or char in " _-·（）()") for char in value):
        raise ValueError("显示名称须为 1–40 位文字、数字、空格或 _-·（）()，不能包含代码或标记")


def _check_path(root: Path, relative: Path, *, new: bool = False) -> None:
    path = root / relative
    for ancestor in (path, *path.parents):
        if ancestor == root:
            break
        if ancestor.is_symlink():
            raise ValueError(f"拒绝通过符号链接写入: {ancestor.relative_to(root)}")
        if ancestor != path and ancestor.exists() and not ancestor.is_dir():
            raise ValueError(f"父路径不是目录: {ancestor.relative_to(root)}")
    if new and path.exists():
        raise ValueError(f"目标已存在，不覆盖: {relative}")


def _head(root: Path) -> str:
    try:
        heads = ScriptDirectory(str(root / "backend/app/alembic")).get_heads()
    except (CommandError, RevisionError, KeyError) as error:
        raise ValueError(f"迁移链无效: {error}") from error
    if len(heads) != 1:
        raise ValueError("迁移必须有且只有一个 head；请先检查并合并迁移分支")
    return heads[0]


def _register(source: str, entry: str) -> str:
    tree = ast.parse(source)
    assignments = [
        node for node in tree.body
        if isinstance(node, ast.Assign) and any(isinstance(target, ast.Name) and target.id == "INSTALLED_MODULES" for target in node.targets)
    ]
    if len(assignments) != 1 or not isinstance(assignments[0].value, ast.Tuple):
        raise ValueError("INSTALLED_MODULES 必须是单次赋值的字面量元组；请手动整理后重试")
    value = assignments[0].value
    if any(not isinstance(item, ast.Constant) or not isinstance(item.value, str) for item in value.elts):
        raise ValueError("INSTALLED_MODULES 仅支持字符串入口，不执行动态配置")
    if entry in [item.value for item in value.elts]:
        raise ValueError(f"模块入口已注册: {entry}")
    lines = source.splitlines(keepends=True)

    def end_offset(node: ast.AST) -> int:
        return sum(map(len, lines[:node.end_lineno - 1])) + len(lines[node.end_lineno - 1].encode()[:node.end_col_offset].decode())

    end = end_offset(value) - 1
    line_start = source.rfind("\n", 0, end) + 1
    insertion = line_start if not source[line_start:end].strip() else end
    prefix = source[:insertion]
    tokens = [
        token for token in tokenize.generate_tokens(io.StringIO(ast.get_source_segment(source, value)).readline)
        if token.type not in {tokenize.COMMENT, tokenize.NL, tokenize.NEWLINE, tokenize.ENDMARKER}
    ]
    if value.elts and tokens[-2].string != ",":
        last = end_offset(value.elts[-1])
        prefix = source[:last] + "," + source[last:insertion]
    if not prefix.endswith("\n"):
        prefix += "\n"
    result = prefix + f'    "{entry}",\n' + source[insertion:]
    ast.parse(result)
    return result


def build_module_plan(root: Path, *, module: str, resource: str, title: str, module_title: str | None = None) -> ModulePlan:
    root = root.resolve()
    _validate_name(module)
    _validate_name(resource)
    module_title = title if module_title is None else module_title
    _validate_title(title)
    _validate_title(module_title)
    if module in RESERVED_ROUTES:
        raise ValueError("模块名与前端基础路由冲突")
    if resource == "module":
        raise ValueError("资源名 module 与模块注册入口冲突")
    if _pascal(resource) in {"BaseType", "PageQuery", "ApiResponse", "PageResult", "FormInstance", "FormRules", "ElMessage", "ElMessageBox", "FaAsyncState"}:
        raise ValueError("资源名与前端公共类型或组件冲突")
    for parent in ("backend/app/api/v1", "backend/app/plugin", "frontend/src/api", "frontend/src/views"):
        _check_path(root, Path(parent) / f"module_{module}", new=True)
    _check_path(root, REGISTRY)
    source = (root / REGISTRY).read_bytes().decode("utf-8")
    registered = _register(source, f"app.api.v1.module_{module}.module:get_module")
    table = f"{module}_{resource}"
    model_class = f"{_pascal(module)}{_pascal(resource)}Model"
    for model in (root / "backend/app").rglob("model.py"):
        for node in ast.walk(ast.parse(model.read_text(encoding="utf-8-sig"), filename=str(model))):
            if isinstance(node, ast.ClassDef) and node.name == model_class:
                raise ValueError(f"模型类名已被使用: {model_class}")
            if isinstance(node, (ast.Assign, ast.AnnAssign)):
                targets = node.targets if isinstance(node, ast.Assign) else [node.target]
                if any(isinstance(target, ast.Name) and target.id == "__tablename__" for target in targets):
                    if isinstance(node.value, ast.Constant) and node.value.value == table:
                        raise ValueError(f"表名已被现有模型使用: {table}")
    route_names = {_pascal(module), _pascal(module) + _pascal(resource)}
    for seed in (root / "backend/app").rglob("data/platform_menu.json"):
        pending = json.loads(seed.read_text(encoding="utf-8"))
        while pending:
            node = pending.pop()
            if node.get("route_name") in route_names or node.get("route_path") == f"/{module}":
                raise ValueError(f"菜单路由冲突: {seed.relative_to(root)}")
            pending.extend(node.get("children", []))
    head = _head(root)
    revision = "gen_" + hashlib.sha256(f"{head}:{module}:{resource}".encode()).hexdigest()[:24]
    migration = f"{revision}_{table}.py"
    replacements = {
        "__MODULE__": module,
        "__MODULE_CLASS__": _pascal(module),
        "__RESOURCE__": resource,
        "__RESOURCE_CLASS__": _pascal(resource),
        "__MODEL_CLASS__": model_class,
        "__TITLE__": title,
        "__MODULE_TITLE__": module_title,
        "__REVISION__": revision,
        "__DOWN_REVISION__": head,
        "__MIGRATION_FILE__": migration,
    }
    token_pattern = re.compile("|".join(map(re.escape, replacements)))

    def render(text: str) -> str:
        return token_pattern.sub(lambda match: replacements[match[0]], text)

    files = {}
    for template in sorted(TEMPLATES.rglob("*.tpl")):
        path = Path(render(template.relative_to(TEMPLATES).as_posix()[:-4]))
        _check_path(root, path, new=True)
        content = render(template.read_text(encoding="utf-8"))
        if path.suffix == ".py":
            compile(content, str(path), "exec")
        elif path.suffix == ".json":
            json.loads(content)
        files[path] = content
    if not files:
        raise ValueError("模块模板缺失")
    return ModulePlan(files, source, registered, module, head, revision)


def preview_module(plan: ModulePlan) -> str:
    changes = {**plan.files, REGISTRY: plan.registry_after}
    return "".join(
        "".join(difflib.unified_diff(
            (plan.registry_before if path == REGISTRY else "").splitlines(keepends=True),
            content.splitlines(keepends=True),
            fromfile=str(path) if path == REGISTRY else "/dev/null",
            tofile=str(path),
        ))
        for path, content in changes.items()
    )


def apply_module_plan(root: Path, plan: ModulePlan) -> None:
    """Publish the registration last; roll back only files created by this invocation."""
    root = root.resolve()
    _check_path(root, REGISTRY)
    created_files: list[Path] = []
    created_dirs: list[Path] = []
    staged_registry: Path | None = None
    with (root / REGISTRY).open("rb") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        if (root / REGISTRY).read_bytes().decode("utf-8") != plan.registry_before:
            raise ValueError("模块清单已变化，请重新预览后重试")
        for parent in ("backend/app/api/v1", "backend/app/plugin", "frontend/src/api", "frontend/src/views"):
            _check_path(root, Path(parent) / f"module_{plan.module}", new=True)
        for path in plan.files:
            _check_path(root, path, new=True)
        if _head(root) != plan.head:
            raise ValueError("迁移 head 已变化，请重新预览后重试")
        try:
            for relative, content in plan.files.items():
                path = root / relative
                missing = []
                directory = path.parent
                while not directory.exists():
                    missing.append(directory)
                    directory = directory.parent
                for directory in reversed(missing):
                    directory.mkdir()
                    created_dirs.append(directory)
                with path.open("x", encoding="utf-8", newline="\n") as output:
                    created_files.append(path)
                    output.write(content)
            with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=(root / REGISTRY).parent, delete=False) as output:
                staged_registry = Path(output.name)
                output.write(plan.registry_after)
                output.flush()
                os.fsync(output.fileno())
            os.chmod(staged_registry, stat.S_IMODE((root / REGISTRY).stat().st_mode))
            if (root / REGISTRY).read_bytes().decode("utf-8") != plan.registry_before or _head(root) != plan.revision:
                raise ValueError("模块清单或迁移链在生成过程中被修改，已取消注册")
            os.replace(staged_registry, root / REGISTRY)
        except BaseException:
            for path in reversed(created_files):
                path.unlink()
            for path in reversed(created_dirs):
                try:
                    path.rmdir()
                except OSError:
                    pass
            raise
        finally:
            if staged_registry is not None:
                staged_registry.unlink(missing_ok=True)
