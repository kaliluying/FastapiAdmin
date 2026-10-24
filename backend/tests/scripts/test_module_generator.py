import ast
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

from app.scripts import module_generator as generator

BACKEND = Path(__file__).resolve().parents[2]
OPTIONS = {"module": "business", "resource": "supplier", "title": "供应商", "module_title": "业务管理"}


@pytest.fixture
def project(tmp_path):
    for directory in ("app/config", "app/alembic"):
        shutil.copytree(BACKEND / directory, tmp_path / "backend" / directory, ignore=shutil.ignore_patterns("__pycache__"))
    return tmp_path


def snapshot(root):
    return {path.relative_to(root): path.read_bytes() for path in root.rglob("*") if path.is_file() and "__pycache__" not in path.parts}


def test_preview_and_apply_complete_production_module_without_demo_sources(project):
    before = snapshot(project)
    plan = generator.build_module_plan(project, **OPTIONS)
    assert snapshot(project) == before
    assert len(plan.files) == 12
    assert generator.preview_module(plan) == generator.preview_module(generator.build_module_plan(project, **OPTIONS))
    assert "+development_only" not in generator.preview_module(plan)
    assert "class BusinessSupplierModel(" in plan.files[Path("backend/app/api/v1/module_business/supplier/model.py")]
    api = plan.files[Path("backend/app/api/v1/module_business/__init__.py")]
    assert 'APIRouter(prefix="/business")' in api
    module = plan.files[Path("backend/app/api/v1/module_business/module.py")]
    assert "development_only" not in module and 'module_business:supplier:' in module
    seed = json.loads(plan.files[Path("backend/app/api/v1/module_business/data/platform_menu.json")])
    assert seed[0]["route_name"] == "Business"
    assert seed[0]["children"][0]["component_path"] == "module_business/supplier/index"
    assert seed[0]["title"] == "业务管理" and seed[0]["children"][0]["title"] == "供应商管理"
    migration = plan.files[Path(f"backend/app/alembic/versions/{plan.revision}_business_supplier.py")]
    assert f'down_revision = "{plan.head}"' in migration and len(plan.revision) <= 32
    assert all("__RESOURCE__" not in content and "module_demo" not in content for content in plan.files.values())
    generator.apply_module_plan(project, plan)
    assert all((project / path).read_text() == content for path, content in plan.files.items())
    assert (project / generator.REGISTRY).read_text().count("module_business.module:get_module") == 1
    after = snapshot(project)
    with pytest.raises(ValueError, match="已存在"):
        generator.build_module_plan(project, **OPTIONS)
    assert snapshot(project) == after


@pytest.mark.parametrize(("field", "value"), [
    ("module", "../outside"), ("module", "class"), ("resource", "AName"), ("resource", "a" * 21),
    ("module", "has__gap"), ("resource", ""), ("module", "home"), ("resource", "page_query"), ("resource", "module"),
    ("title", 'a";import os'), ("title", "<script>"), ("module_title", "a\nb"), ("title", " 名称 "), ("module_title", ""),
])
def test_invalid_input_does_not_write(project, field, value):
    before = snapshot(project)
    with pytest.raises(ValueError):
        generator.build_module_plan(project, **{**OPTIONS, field: value})
    assert snapshot(project) == before


def test_reserved_routes_match_menu_service_and_frontend():
    service = ast.parse((BACKEND / "app/api/v1/module_platform/menu/service.py").read_text())
    declaration = next(node for node in service.body if isinstance(node, ast.Assign) and any(
        isinstance(target, ast.Name) and target.id == "_RESERVED_ROOT_ROUTE_SEGMENTS" for target in node.targets
    ))
    assert generator.RESERVED_ROUTES == ast.literal_eval(declaration.value.args[0])
    frontend = (BACKEND.parent / "frontend/src/router/core/RouteRegistry.ts").read_text()
    declaration = re.search(r"const RESERVED_SHELL_SEGMENTS = new Set\(\[(.*?)\]\)", frontend, re.S)
    assert generator.RESERVED_ROUTES == set(re.findall(r'"([^"]+)"', declaration[1]))


@pytest.mark.parametrize("module", sorted(generator.RESERVED_ROUTES))
def test_reserved_route_does_not_write(project, module):
    before = snapshot(project)
    with pytest.raises(ValueError):
        generator.build_module_plan(project, **{**OPTIONS, "module": module})
    assert snapshot(project) == before


def test_user_resource_uses_namespaced_model(project):
    directory = project / "backend/app/api/v1/module_system/user"
    directory.mkdir(parents=True)
    shutil.copy2(BACKEND / "app/api/v1/module_system/user/model.py", directory / "model.py")
    plan = generator.build_module_plan(project, **{**OPTIONS, "resource": "user"})
    assert "class BusinessUserModel(" in plan.files[Path("backend/app/api/v1/module_business/user/model.py")]
    assert "from .model import BusinessUserModel" in plan.files[Path("backend/app/api/v1/module_business/user/service.py")]
    with pytest.raises(ValueError, match="表名已被"):
        generator.build_module_plan(project, **{**OPTIONS, "module": "sys_user", "resource": "roles"})


@pytest.mark.parametrize("location", [
    "backend/app/api/v1/module_business", "backend/app/plugin/module_business",
    "frontend/src/views/module_business", "frontend/src/api/module_business",
    "backend/tests/test_business_supplier.py",
])
def test_existing_destinations_are_not_overwritten(project, location):
    path = project / location
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("user content")
    before = snapshot(project)
    with pytest.raises(ValueError, match="已存在"):
        generator.build_module_plan(project, **OPTIONS)
    assert snapshot(project) == before


@pytest.mark.parametrize("broken", [False, True])
def test_symlink_destinations_are_rejected(project, tmp_path, broken):
    outside = tmp_path / "outside"
    if not broken:
        outside.mkdir()
    frontend = project / "frontend"
    frontend.symlink_to(outside, target_is_directory=True)
    with pytest.raises(ValueError, match="符号链接"):
        generator.build_module_plan(project, **OPTIONS)
    assert not outside.exists() if broken else list(outside.iterdir()) == []


def test_existing_registration_is_rejected(project):
    registry = project / generator.REGISTRY
    registry.write_text('INSTALLED_MODULES = ("app.api.v1.module_business.module:get_module",)\n')
    with pytest.raises(ValueError, match="已注册"):
        generator.build_module_plan(project, **OPTIONS)


@pytest.mark.parametrize("source", [
    'INSTALLED_MODULES = ()\n',
    'INSTALLED_MODULES = ("existing",)\n',
    'INSTALLED_MODULES = ("existing")\n',  # A string is not a tuple.
    'INSTALLED_MODULES = (\n    "existing"  # 保留注释\n)\n',
    'INSTALLED_MODULES = (\n    "existing", # 保留注释\n)\n',
    'INSTALLED_MODULES = (\n    "existing", "second" # 保留注释\n)\n',
])
def test_registry_preserves_existing_entries_and_comments(source):
    if '"existing"' in source and '"second"' not in source and "," not in source:
        with pytest.raises(ValueError):
            generator._register(source, "new")
        return
    result = generator._register(source, "new")
    namespace = {}
    exec(compile(ast.parse(result), "<registry>", "exec"), namespace)
    assert namespace["INSTALLED_MODULES"] == (() if '()' in source else ("existing", "second") if '"second"' in source else ("existing",)) + ("new",)
    if "# 保留注释" in source:
        assert "# 保留注释" in result


@pytest.mark.parametrize("source", [
    "INSTALLED_MODULES = get_modules()\n",
    'INSTALLED_MODULES = ("a",)\nINSTALLED_MODULES = ("b",)\n',
    'INSTALLED_MODULES = (get_module(),)\n',
    'INSTALLED_MODULES: tuple[str, ...] = ("a",)\n',
])
def test_dynamic_or_unsupported_registry_is_rejected(source):
    with pytest.raises(ValueError):
        generator._register(source, "new")


@pytest.mark.parametrize("kind", ["table", "annotated_table", "bom_table", "model_class", "route_name", "route_path"])
def test_table_and_menu_collisions_are_rejected(project, kind):
    directory = project / "backend/app/api/v1/module_other"
    directory.mkdir(parents=True)
    if kind == "table":
        (directory / "model.py").write_text('__tablename__ = "business_supplier"\n')
    elif kind == "annotated_table":
        (directory / "model.py").write_text('class Existing:\n    __tablename__: str = "business_supplier"\n')
    elif kind == "bom_table":
        (directory / "model.py").write_text('__tablename__: str = "business_supplier"\n', encoding="utf-8-sig")
    elif kind == "model_class":
        (directory / "model.py").write_text('class BusinessSupplierModel:\n    pass\n')
    else:
        (directory / "data").mkdir()
        (directory / "data/platform_menu.json").write_text(json.dumps([{kind: "BusinessSupplier" if kind == "route_name" else "/business"}]))
    before = snapshot(project)
    with pytest.raises(ValueError, match="使用|冲突"):
        generator.build_module_plan(project, **OPTIONS)
    assert snapshot(project) == before


def add_revision(project, *, parent):
    path = project / "backend/app/alembic/versions/concurrent.py"
    path.write_text(f'revision = "concurrent"\ndown_revision = {parent!r}\n')


def test_multiple_migration_heads_are_rejected(project):
    add_revision(project, parent=None)
    before = snapshot(project)
    with pytest.raises(ValueError, match="head"):
        generator.build_module_plan(project, **OPTIONS)
    assert snapshot(project) == before


def test_missing_migration_parent_is_rejected(project):
    add_revision(project, parent="missing_revision")
    with pytest.warns(UserWarning, match="missing_revision"), pytest.raises(ValueError, match="迁移链无效"):
        generator.build_module_plan(project, **OPTIONS)


@pytest.mark.parametrize("kind", ["registry", "head", "destination"])
def test_stale_plan_does_not_write(project, kind):
    plan = generator.build_module_plan(project, **OPTIONS)
    if kind == "registry":
        registry = project / generator.REGISTRY
        registry.write_text(registry.read_text() + "# 用户新增的注释\n")
    elif kind == "head":
        add_revision(project, parent=plan.head)
    else:
        path = project / next(iter(plan.files))
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text("user content")
    before = snapshot(project)
    with pytest.raises(ValueError):
        generator.apply_module_plan(project, plan)
    assert snapshot(project) == before


@pytest.mark.parametrize("failure", ["write", "replace", "registry_changed", "head_changed"])
def test_failed_generation_rolls_back_only_new_files(project, monkeypatch, failure):
    plan = generator.build_module_plan(project, **OPTIONS)
    before = snapshot(project)
    original_open = Path.open
    original_replace = generator.os.replace
    writes = 0

    def open_file(path, mode="r", *args, **kwargs):
        nonlocal writes
        if mode == "x":
            writes += 1
            if failure == "write" and writes == 4:
                raise OSError("synthetic write failure")
        return original_open(path, mode, *args, **kwargs)

    def replace(source, destination):
        if failure == "replace":
            raise OSError("synthetic replace failure")
        return original_replace(source, destination)

    original_head = generator._head
    reads = 0

    def read_head(root):
        nonlocal reads
        reads += 1
        if reads == 2 and failure == "registry_changed":
            registry = project / generator.REGISTRY
            registry.write_text(before[generator.REGISTRY].decode() + "# 用户修改\n")
            raise ValueError("synthetic concurrent edit")
        if reads == 2 and failure == "head_changed":
            add_revision(project, parent=plan.head)
        return original_head(root)

    monkeypatch.setattr(Path, "open", open_file)
    monkeypatch.setattr(generator.os, "replace", replace)
    monkeypatch.setattr(generator, "_head", read_head)
    with pytest.raises((ValueError, OSError)):
        generator.apply_module_plan(project, plan)
    after = snapshot(project)
    if failure == "registry_changed":
        assert after.pop(generator.REGISTRY) == before.pop(generator.REGISTRY) + "# 用户修改\n".encode()
    elif failure == "head_changed":
        after.pop(Path("backend/app/alembic/versions/concurrent.py"))
    assert after == before
    assert not (project / "frontend").exists()


def test_cli_default_is_read_only_without_settings_or_services(project):
    shutil.copy2(BACKEND / "main.py", project / "backend/main.py")
    scripts = project / "backend/app/scripts"
    scripts.mkdir()
    shutil.copy2(BACKEND / "app/scripts/module_generator.py", scripts / "module_generator.py")
    shutil.copytree(generator.TEMPLATES, scripts / "module_templates")
    common = project / "backend/app/common"
    common.mkdir()
    shutil.copy2(BACKEND / "app/common/enums.py", common / "enums.py")
    (project / "backend/app/config/setting.py").write_text('raise AssertionError("must not load settings")\n')
    before = snapshot(project)
    command = [sys.executable, "main.py", "generate-module", "--module", "business", "--resource", "supplier", "--title", "供应商"]
    reserved_command = ["module" if argument == "supplier" else argument for argument in command]
    for flags in ([], ["--apply"]):
        result = subprocess.run(reserved_command + flags, cwd=project / "backend", capture_output=True, text=True)
        assert result.returncode == 1 and "模块注册入口" in result.stderr
        assert snapshot(project) == before
    result = subprocess.run(command, cwd=project / "backend", capture_output=True, text=True)
    assert result.returncode == 0, result.stderr
    assert "仅预览，未写入" in result.stdout and "--apply" in result.stdout
    assert snapshot(project) == before
    result = subprocess.run(command + ["--apply"], cwd=project / "backend", capture_output=True, text=True)
    assert result.returncode == 0, result.stderr
    assert "已生成: 12 个新文件" in result.stdout
    result = subprocess.run(command + ["--apply"], cwd=project / "backend", capture_output=True, text=True)
    assert result.returncode == 1 and "不覆盖" in result.stderr


@pytest.mark.parametrize("resource", ["user", "field", "value", "data", "self", "select", "observed", "async_db_session"])
def test_generated_module_handles_resource_names_that_match_python_locals(project, resource):
    shutil.copytree(BACKEND / "app", project / "backend/app", dirs_exist_ok=True, ignore=shutil.ignore_patterns("__pycache__"))
    for filename in ("main.py", "alembic.ini", "banner.txt"):
        shutil.copy2(BACKEND / filename, project / "backend" / filename)
    plan = generator.build_module_plan(project, **{**OPTIONS, "resource": resource})
    generator.apply_module_plan(project, plan)
    shutil.copy2(BACKEND / "tests/conftest.py", project / "backend/tests/conftest.py")
    result = subprocess.run(
        [sys.executable, "-m", "pytest", f"tests/test_business_{resource}.py", "-q",
         "-o", "asyncio_mode=auto", "-o", "asyncio_default_fixture_loop_scope=function"],
        cwd=project / "backend", capture_output=True, text=True,
    )
    assert result.returncode == 0, result.stdout + result.stderr
    assert "23 passed" in result.stdout
