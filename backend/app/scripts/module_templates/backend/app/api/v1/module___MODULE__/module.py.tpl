"""业务模块的显式注册信息。"""

from pathlib import Path

from app.core.modules import ModuleSpec


def get_module() -> ModuleSpec:
    return ModuleSpec(
        name="__MODULE__",
        routers=("app.api.v1.module___MODULE__:__MODULE___router",),
        model_modules=("app.api.v1.module___MODULE__.__RESOURCE__.model",),
        permissions=frozenset(f"module___MODULE__:__RESOURCE__:{action}" for action in ("create", "delete", "detail", "query", "update")),
        seed_dir=Path(__file__).parent / "data",
        menu_roots=("__MODULE_CLASS__", "__MODULE_CLASS____RESOURCE_CLASS__"),
        permission_prefixes=("module___MODULE__:",),
    )
