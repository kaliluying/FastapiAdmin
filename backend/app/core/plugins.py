"""Core AI module registration.

The backend currently has one AI module: ``module_ai``. Its ``plugin.toml``
is the single source for routes, models, startup hooks, permissions, and
dependency checks. There is deliberately no plugin discovery or reload
mechanism until the product has a second plugin.
"""

import importlib
import importlib.util
import inspect
import tomllib
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any

from fastapi import APIRouter

from app.core.base_model import MappedBase
from app.core.logger import logger

AI_MANIFEST_PATH = Path(__file__).resolve().parents[1] / "plugin" / "module_ai" / "plugin.toml"


@dataclass(frozen=True)
class AiPluginManifest:
    """Describe the core AI module without importing its implementation."""

    package: str
    name: str
    title: str
    route_prefix: str
    required_modules: tuple[str, ...]
    routers: tuple[str, ...]
    websocket_routers: tuple[str, ...]
    model_modules: tuple[str, ...]
    startup_hooks: tuple[str, ...]
    permissions: tuple[str, ...]


def _as_tuple(value: Any, field_name: str) -> tuple[str, ...]:
    """Validate one string-list field from the AI manifest.

    Args:
        value: Parsed TOML value.
        field_name: Field name used in diagnostics.

    Returns:
        A tuple of non-empty strings.

    Raises:
        ValueError: If the configured value is not a string list.
    """
    if value is None:
        return ()
    if not isinstance(value, list) or not all(isinstance(item, str) and item for item in value):
        raise ValueError(f"{AI_MANIFEST_PATH} 的 {field_name} 必须是非空字符串数组")
    return tuple(value)


@lru_cache(maxsize=1)
def get_ai_plugin_manifest() -> AiPluginManifest:
    """Load and validate the core AI module manifest.

    Returns:
        Parsed AI module metadata.

    Raises:
        ValueError: If required AI metadata is invalid.
    """
    with AI_MANIFEST_PATH.open("rb") as file:
        raw = tomllib.load(file)

    package = raw.get("package")
    name = raw.get("name")
    title = raw.get("title", name)
    route_prefix = raw.get("route_prefix")
    if package != "module_ai" or name != "ai":
        raise ValueError(f"{AI_MANIFEST_PATH} 必须声明 module_ai / ai")
    if not isinstance(title, str) or not title:
        raise ValueError(f"{AI_MANIFEST_PATH} 必须声明 title")
    if not isinstance(route_prefix, str) or not route_prefix.startswith("/"):
        raise ValueError(f"{AI_MANIFEST_PATH} 的 route_prefix 必须以 / 开头")

    return AiPluginManifest(
        package=package,
        name=name,
        title=title,
        route_prefix=route_prefix.rstrip("/"),
        required_modules=_as_tuple(raw.get("required_modules"), "required_modules"),
        routers=_as_tuple(raw.get("routers"), "routers"),
        websocket_routers=_as_tuple(raw.get("websocket_routers"), "websocket_routers"),
        model_modules=_as_tuple(raw.get("model_modules"), "model_modules"),
        startup_hooks=_as_tuple(raw.get("startup_hooks"), "startup_hooks"),
        permissions=_as_tuple(raw.get("permissions"), "permissions"),
    )


def _missing_dependencies(manifest: AiPluginManifest) -> tuple[str, ...]:
    """Return unavailable Python modules required by the AI module."""
    return tuple(module for module in manifest.required_modules if importlib.util.find_spec(module) is None)


def ensure_ai_dependencies() -> None:
    """Fail fast when a core AI dependency is unavailable.

    Raises:
        RuntimeError: If a required AI package or module directory is missing.
    """
    manifest = get_ai_plugin_manifest()
    if importlib.util.find_spec(f"app.plugin.{manifest.package}") is None:
        raise RuntimeError(f"{manifest.title} 模块目录不存在: app.plugin.{manifest.package}")

    missing = _missing_dependencies(manifest)
    if missing:
        raise RuntimeError(f"{manifest.title} 核心依赖缺失：{', '.join(missing)}。请执行 `uv sync` 后重启服务。")


def _resolve_entrypoint(manifest: AiPluginManifest, entrypoint: str) -> Any:
    """Import a manifest entry point from the AI module.

    Args:
        manifest: Validated AI metadata.
        entrypoint: ``module:attribute`` value from ``plugin.toml``.

    Returns:
        Exported AI module attribute.

    Raises:
        ValueError: If the entry point format is invalid.
    """
    module_path, separator, attribute = entrypoint.partition(":")
    if not separator or not module_path or not attribute:
        raise ValueError(f"AI 模块入口必须使用 module:attribute 形式: {entrypoint!r}")
    module = importlib.import_module(f"app.plugin.{manifest.package}.{module_path}")
    return getattr(module, attribute)


def get_ai_routers() -> tuple[APIRouter, ...]:
    """Load HTTP routers declared by the core AI manifest."""
    ensure_ai_dependencies()
    manifest = get_ai_plugin_manifest()
    container_router = APIRouter(prefix=manifest.route_prefix)
    for entrypoint in manifest.routers:
        router = _resolve_entrypoint(manifest, entrypoint)
        if not isinstance(router, APIRouter):
            raise TypeError(f"AI 模块路由入口不是 APIRouter: {entrypoint}")
        container_router.include_router(router)
    return (container_router,)


def get_ai_websocket_routers() -> tuple[APIRouter, ...]:
    """Load WebSocket routers declared by the core AI manifest."""
    ensure_ai_dependencies()
    manifest = get_ai_plugin_manifest()
    routers: list[APIRouter] = []
    for entrypoint in manifest.websocket_routers:
        router = _resolve_entrypoint(manifest, entrypoint)
        if not isinstance(router, APIRouter):
            raise TypeError(f"AI WebSocket 路由入口不是 APIRouter: {entrypoint}")
        routers.append(router)
    return tuple(routers)


def load_ai_models() -> list[type[MappedBase]]:
    """Load all ORM models declared by the core AI manifest.

    Returns:
        AI ORM models without duplicates.
    """
    ensure_ai_dependencies()
    manifest = get_ai_plugin_manifest()
    models: list[type[MappedBase]] = []
    for module_path in manifest.model_modules:
        module = importlib.import_module(f"app.plugin.{manifest.package}.{module_path}")
        for candidate in vars(module).values():
            is_model = isinstance(candidate, type) and issubclass(candidate, MappedBase) and candidate is not MappedBase and bool(getattr(candidate, "__tablename__", None))
            if is_model and candidate not in models:
                models.append(candidate)
    return models


async def initialize_ai_plugin() -> None:
    """Run startup hooks declared by the core AI manifest.

    Raises:
        Exception: Propagates AI initialization errors and stops application startup.
    """
    ensure_ai_dependencies()
    manifest = get_ai_plugin_manifest()
    for entrypoint in manifest.startup_hooks:
        hook = _resolve_entrypoint(manifest, entrypoint)
        result = hook()
        if inspect.isawaitable(result):
            await result
        logger.info("✅ {} 初始化完成", manifest.title)


def get_ai_permission_codes() -> frozenset[str]:
    """Return the permission codes declared by the AI manifest."""
    return frozenset(get_ai_plugin_manifest().permissions)


__all__ = [
    "ensure_ai_dependencies",
    "get_ai_permission_codes",
    "get_ai_plugin_manifest",
    "get_ai_routers",
    "get_ai_websocket_routers",
    "initialize_ai_plugin",
    "load_ai_models",
]
