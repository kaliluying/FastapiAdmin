"""分类范例的注册信息；正式业务复制此文件并使用独立名称。"""

from pathlib import Path

from app.core.modules import ModuleSpec


def get_module() -> ModuleSpec:
    return ModuleSpec(
        name="demo",
        routers=("app.api.v1.module_demo:demo_router",),
        model_modules=("app.api.v1.module_demo.category.model",),
        permissions=frozenset(f"module_demo:category:{action}" for action in ("create", "delete", "detail", "query", "update")),
        seed_dir=Path(__file__).parent / "data",
        development_only=True,
        menu_roots=("Demo", "DemoCategory"),
        permission_prefixes=("module_demo:",),
    )
