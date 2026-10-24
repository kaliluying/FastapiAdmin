"""在隔离副本、SQLite 和独立 Redis 中验收业务增改与真实裁剪。"""

import argparse
import json
import os
import shutil
import signal
import socket
import sqlite3
import subprocess
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def free_port() -> int:
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def run(args: list[str], cwd: Path, log: Path, env=None) -> None:
    with log.open("a") as output:
        subprocess.run(args, cwd=cwd, env=env, stdout=output, stderr=output, check=True)


def prepare_copy(stage: Path) -> tuple[Path, Path]:
    backend, frontend = stage / "backend", stage / "frontend"
    backend.mkdir()
    shutil.copytree(ROOT / "backend/app", backend / "app", ignore=shutil.ignore_patterns("__pycache__"))
    for filename in ("main.py", "alembic.ini", "banner.txt"):
        shutil.copy2(ROOT / "backend" / filename, backend / filename)
    frontend.mkdir()
    for name in ("src", "public", "build"):
        shutil.copytree(ROOT / "frontend" / name, frontend / name)
    for path in (ROOT / "frontend").iterdir():
        if path.is_file() and (path.name in {"package.json", "vite.config.ts", "index.html"} or path.name.startswith("tsconfig")):
            shutil.copy2(path, frontend / path.name)
    (frontend / "node_modules").symlink_to(ROOT / "frontend/node_modules", target_is_directory=True)
    vite = frontend / "vite.config.ts"
    vite.write_text(vite.read_text().replace("return defineConfig({", 'return defineConfig({\n    cacheDir: ".vite-cache",'))

    run(
        [str(ROOT / "backend/.venv/bin/python"), "main.py", "generate-module", "--module", "business",
         "--resource", "supplier", "--title", "供应商", "--module-title", "业务管理", "--apply"],
        backend, stage / "generator.log",
    )
    # 先验证原始产物，再按实际业务改字段。
    shutil.copy2(ROOT / "backend/tests/conftest.py", backend / "tests/conftest.py")
    run(
        [str(ROOT / "backend/.venv/bin/python"), "-m", "pytest", "tests/test_business_supplier.py", "-q",
         "-o", "asyncio_mode=auto", "-o", "asyncio_default_fixture_loop_scope=function"],
        backend, stage / "generated-tests.log",
    )
    business = backend / "app/api/v1/module_business"
    view = frontend / "src/views/module_business/supplier"
    api = frontend / "src/api/module_business"

    # 真实修改：新增联系邮箱字段，并将名称上限从 64 改为 32。
    model = business / "supplier/model.py"
    model.write_text(
        model.read_text().replace("String(64)", "String(32)").replace("    order: Mapped", "    contact_email: Mapped[str | None] = mapped_column(String(254), nullable=True)\n    order: Mapped")
    )
    schema = business / "supplier/schema.py"
    schema.write_text(
        schema.read_text()
        .replace("ConfigDict, Field", "ConfigDict, EmailStr, Field")
        .replace("max_length=64", "max_length=32")
        .replace("    order: int", "    contact_email: EmailStr | None = None\n    order: int")
    )
    api_file = api / "supplier.ts"
    api_file.write_text(api_file.read_text().replace("  name: string;", "  name: string;\n  contact_email: string | null;"))
    page = view / "index.vue"
    source = page.read_text().replace('maxlength="64"', 'maxlength="32"')
    source = source.replace('<ElTableColumn prop="order"', '<ElTableColumn prop="contact_email" label="联系邮箱" min-width="180" />\n        <ElTableColumn prop="order"')
    source = source.replace(
        '<ElFormItem label="显示排序"', '<ElFormItem label="联系邮箱" prop="contact_email"><ElInput v-model="form.contact_email" /></ElFormItem>\n        <ElFormItem label="显示排序"'
    )
    source = source.replace('{ name: "", order:', '{ name: "", contact_email: null, order:')
    source = source.replace("    name: row.name,", "    name: row.name,\n    contact_email: row.contact_email,")
    source = source.replace("const rules: FormRules = {", 'const rules: FormRules = {\n  contact_email: [{ type: "email", message: "请输入有效邮箱地址", trigger: "blur" }],')
    source = source.replace("const data = { ...form, name:", "const data = { ...form, contact_email: form.contact_email?.trim() || null, name:")
    page.write_text(source)
    return backend, frontend


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--interactive", action="store_true", help="验收后保留隔离服务供界面走查，Ctrl-C 清理本轮服务")
    args = parser.parse_args()
    artifacts = Path(tempfile.mkdtemp(prefix="fastcore-skeleton-"))
    backend, frontend = prepare_copy(artifacts)
    python = ROOT / "backend/.venv/bin/python"
    redis_port, backend_port, frontend_port = free_port(), free_port(), free_port()
    environment = {
        **os.environ,
        "ENVIRONMENT": "dev",
        "DATABASE_TYPE": "sqlite",
        "DATABASE_NAME": str(artifacts / "database"),
        "SECRET_KEY": "skeleton-fixture-only-not-a-real-key-2026",
        "SERVER_HOST": "127.0.0.1",
        "SERVER_PORT": str(backend_port),
        "REDIS_HOST": "127.0.0.1",
        "REDIS_PORT": str(redis_port),
        "REDIS_PASSWORD": "",
        "REDIS_DB": "0",
        "ANONYMIZED_TELEMETRY": "False",
        "OPENAI_API_KEY": "",
        "ANTHROPIC_API_KEY": "",
        "BROWSER": "none",
    }
    (frontend / ".env").write_text(
        f"VITE_APP_TITLE=FastCore 骨架验收\nVITE_VERSION=fixture\nVITE_BASE_URL=/\nVITE_APP_BASE_API=/api/v1\nVITE_API_BASE_URL=http://127.0.0.1:{backend_port}\nVITE_PORT={frontend_port}\n"
    )
    server = backend / "fixture_server.py"
    # SQLite 只用于隔离测试；与 ux_e2e_server 一样，仅切换运行时模块策略。
    server.write_text(
        "import uvicorn\n"
        "from app.config.setting import settings\n"
        "from app.common.enums import EnvironmentEnum\n"
        "import app.init_app as init\n"
        "from main import create_app\n"
        "original_bootstrap = init.bootstrap_database\n"
        "async def fixture_bootstrap(redis, environment=None, *, migrate_only=False):\n"
        "    await original_bootstrap(redis, EnvironmentEnum.DEV, migrate_only=migrate_only)\n"
        "init.bootstrap_database = fixture_bootstrap\n"
        "settings.ENVIRONMENT = EnvironmentEnum.PROD\n"
        "settings.CAPTCHA_ENABLE = False\n"
        'uvicorn.run(create_app(), host="127.0.0.1", port=settings.SERVER_PORT, log_config=None)\n'
    )
    # 只在副本重置种子为公开的测试身份；不读取真实数据库或环境文件。
    hashed = subprocess.check_output([str(python), "-c", "from app.utils.hash_bcrpy_util import PwdUtil; print(PwdUtil.hash_password('admin123'))"], cwd=backend, env=environment, text=True).strip()
    seed = backend / "app/scripts/data/sys_user.json"
    users = json.loads(seed.read_text())
    for index, user in enumerate(users):
        user.update(username="admin" if index == 0 else f"fixture_user_{index}", name="隔离验收用户", password=hashed, email=None, mobile=None, avatar=None, is_superuser=index == 0)
    seed.write_text(json.dumps(users))
    processes = []
    streams = []

    def start(command: list[str], cwd: Path, name: str):
        stream = (artifacts / f"{name}.log").open("a")
        streams.append(stream)
        process = subprocess.Popen(command, cwd=cwd, env=environment, stdout=stream, stderr=stream, start_new_session=True)
        processes.append(process)
        return process

    def stop(process) -> None:
        if process.poll() is None:
            os.killpg(process.pid, signal.SIGTERM)
            try:
                process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                os.killpg(process.pid, signal.SIGKILL)
                process.wait()

    def wait_ready(url: str, process) -> None:
        deadline = time.monotonic() + 90
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        last_error = ""
        while time.monotonic() < deadline:
            if process.poll() is not None:
                raise RuntimeError(f"服务提前退出，请查看 {artifacts}")
            try:
                with opener.open(url, timeout=2) as response:
                    if response.status == 200:
                        return
            except (OSError, urllib.error.HTTPError) as exc:
                last_error = f"{type(exc).__name__}: {getattr(exc, 'code', '')}"
                time.sleep(0.2)
        raise TimeoutError(f"服务启动超时 ({url}, {last_error})，请查看 {artifacts}")

    try:
        redis = shutil.which("redis-server")
        if not redis:
            raise RuntimeError("需要本地 redis-server；不会复用已有 Redis")
        start([redis, "--bind", "127.0.0.1", "--port", str(redis_port), "--save", "", "--appendonly", "no"], artifacts, "redis")
        backend_process = start([str(python), str(server)], backend, "backend")
        wait_ready(f"http://127.0.0.1:{backend_port}/common/health/live", backend_process)
        front_process = start(["node", str(ROOT / "frontend/node_modules/vite/bin/vite.js"), "--host", "127.0.0.1", "--port", str(frontend_port), "--strictPort"], frontend, "frontend")
        wait_ready(f"http://127.0.0.1:{frontend_port}/@vite/client", front_process)
        browser_script = ROOT / "frontend/tests/skeleton-e2e.cjs"
        browser_args = ["node", str(browser_script), str(frontend_port), str(backend_port), str(artifacts)]
        run([*browser_args, "business"], frontend, artifacts / "browser.log", environment)
        stop(backend_process)
        backend_process = start([str(python), str(server)], backend, "backend")
        wait_ready(f"http://127.0.0.1:{backend_port}/common/health/live", backend_process)
        run([*browser_args, "restart"], frontend, artifacts / "browser.log", environment)
        stop(backend_process)
        stop(front_process)

        registry = backend / "app/config/modules.py"
        registry.write_text('INSTALLED_MODULES = ("app.api.v1.module_business.module:get_module",)\n')
        for path in (backend / "app/plugin/module_ai", backend / "app/api/v1/module_demo", backend / "app/api/v1/module_dashboard"):
            shutil.rmtree(path)
        for module in ("module_ai", "module_demo"):
            shutil.rmtree(frontend / "src/api" / module)
            shutil.rmtree(frontend / "src/views" / module)
        # 兼容旧仓库里分散的模块测试；源码引用不会被静默忽略。
        for path in (frontend / "src/__tests__").glob("*.ts"):
            if "module_ai" in path.read_text():
                path.unlink()
        core_python = artifacts / "core-env/bin/python"
        run(["uv", "venv", "--python", str(python), str(artifacts / "core-env")], backend, artifacts / "core-install.log")
        run(["uv", "pip", "sync", "--python", str(core_python), str(ROOT / "backend/requirements-core.txt")], backend, artifacts / "core-install.log")
        run(
            [
                str(core_python),
                "-c",
                "import importlib.util; assert all(importlib.util.find_spec(name) is None for name in ('chromadb', 'fastembed', 'langchain_core', 'openai', 'docx', 'whoosh', 'pypdf'))",
            ],
            backend,
            artifacts / "core-install.log",
        )
        for prefix, root in (("module_ai:", "AI"), ("module_demo:", "Demo")):
            run([str(core_python), "-m", "app.scripts.prune_menus", "--env", "dev", "--permission-prefix", prefix, "--route-name", root, "--apply"], backend, artifacts / "cleanup.log", environment)
        with sqlite3.connect(artifacts / "database.db") as database:
            assert "ai_knowledge_document" in {row[0] for row in database.execute("SELECT name FROM sqlite_master WHERE type='table'")}
            assert database.execute("SELECT contact_email FROM business_supplier WHERE name='骨架验收供应商-修改'").fetchone() == ("updated@example.com",)
            assert database.execute("SELECT is_superuser FROM sys_user WHERE username='business_user'").fetchone() == (0,)
        run(
            [
                str(core_python),
                "-c",
                "from sqlalchemy import create_engine; from alembic.autogenerate import compare_metadata; from alembic.migration import MigrationContext; from app.scripts.initialize import InitializeData; from app.core.base_model import MappedBase; from app.core.modules import include_owned_schema_object; from app.core.database import _get_schema_indexes; InitializeData.get_prepare_init_models(); _get_schema_indexes(); engine=create_engine('sqlite:///' + __import__('os').environ['DATABASE_NAME'] + '.db'); connection=engine.connect(); changes=compare_metadata(MigrationContext.configure(connection, opts={'include_object': include_owned_schema_object}), MappedBase.metadata); assert not any(change[0] in ('remove_table', 'remove_index') for change in changes); connection.close(); engine.dispose()",
            ],
            backend,
            artifacts / "schema-preservation.log",
            environment,
        )
        backend_process = start([str(core_python), str(server)], backend, "backend-core")
        wait_ready(f"http://127.0.0.1:{backend_port}/common/health/live", backend_process)
        front_process = start(["node", str(ROOT / "frontend/node_modules/vite/bin/vite.js"), "--host", "127.0.0.1", "--port", str(frontend_port), "--strictPort"], frontend, "frontend-core")
        wait_ready(f"http://127.0.0.1:{frontend_port}/@vite/client", front_process)
        run([*browser_args, "pruned"], frontend, artifacts / "browser.log", environment)
        stop(front_process)
        run(["node", str(ROOT / "frontend/node_modules/vue-tsc/bin/vue-tsc.js"), "--noEmit"], frontend, artifacts / "core-build.log", environment)
        run(["node", str(ROOT / "frontend/node_modules/vite/bin/vite.js"), "build"], frontend, artifacts / "core-build.log", environment)
        stop(backend_process)
        environment["DATABASE_NAME"] = str(artifacts / "fresh-core")
        fresh_process = start([str(core_python), str(server)], backend, "backend-fresh-core")
        wait_ready(f"http://127.0.0.1:{backend_port}/common/health/live", fresh_process)
        with sqlite3.connect(artifacts / "fresh-core.db") as database:
            tables = {row[0] for row in database.execute("SELECT name FROM sqlite_master WHERE type='table'")}
            assert "business_supplier" in tables
            assert not any(table.startswith(("ai_", "demo_")) for table in tables)
        stop(fresh_process)
        environment["DATABASE_NAME"] = str(artifacts / "database")
        (artifacts / "report.json").write_text(
            json.dumps(
                {
                    "passed": True,
                    "database": "isolated SQLite",
                    "redis": "isolated real Redis",
                    "module_policy": "prod runtime with dev SQLite fixture; not production configuration acceptance",
                    "module_creation": "main.py generate-module --apply",
                    "generated_regression_tests": "generated-tests.log",
                    "ai_dependencies_installed_in_pruned_runtime": False,
                    "existing_business_data_preserved": True,
                    "fresh_database_omits_removed_tables": True,
                    "migration_generation_preserves_unowned_tables": True,
                    "scenarios": [
                        "generate business module with CLI",
                        "add and validate email field",
                        "permissions",
                        "restart persistence",
                        "remove demo/dashboard/AI source",
                        "explicit menu cleanup",
                        "pruned browser navigation",
                        "pruned typecheck and build",
                        "fresh database excludes removed modules",
                    ],
                },
                indent=2,
            )
        )
        print(json.dumps({"passed": True, "artifacts": str(artifacts), "frontend": f"http://127.0.0.1:{frontend_port}", "backend": f"http://127.0.0.1:{backend_port}"}), flush=True)
        if args.interactive:
            backend_process = start([str(core_python), str(server)], backend, "backend-core-walkthrough")
            wait_ready(f"http://127.0.0.1:{backend_port}/common/health/live", backend_process)
            start(["node", str(ROOT / "frontend/node_modules/vite/bin/vite.js"), "--host", "127.0.0.1", "--port", str(frontend_port), "--strictPort"], frontend, "frontend-walkthrough")
            while True:
                time.sleep(1)
    finally:
        for process in reversed(processes):
            stop(process)
        for stream in streams:
            stream.close()


if __name__ == "__main__":
    main()
