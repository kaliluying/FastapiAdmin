"""Optional AI module registration.

The backend currently has one optional module: ``module_ai``. Its
``plugin.toml`` is the single source for routes, models, startup hooks,
permissions, seed ownership, and dependency checks. There is deliberately no
plugin discovery or reload mechanism until the product has a second plugin.
"""

import importlib
import importlib.util
import inspect
import os
import tomllib
from collections.abc import Iterable
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any

from fastapi import APIRouter
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.config.path_conf import ENV_DIR
from app.core.base_model import MappedBase
from app.core.logger import logger

AI_MANIFEST_PATH = Path(__file__).resolve().parents[1] / "plugin" / "module_ai" / "plugin.toml"


@dataclass(frozen=True)
class AiPluginManifest:
    """Describe the optional AI module without importing its implementation."""

    package: str
    name: str
    title: str
    optional: bool
    enabled_env: str
    route_prefix: str
    required_modules: tuple[str, ...]
    routers: tuple[str, ...]
    websocket_routers: tuple[str, ...]
    model_modules: tuple[str, ...]
    startup_hooks: tuple[str, ...]
    permissions: tuple[str, ...]
    seed_route_names: tuple[str, ...]
    seed_route_paths: tuple[str, ...]
    seed_component_prefixes: tuple[str, ...]
    seed_permission_prefixes: tuple[str, ...]


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
    """Load and validate the single AI module manifest.

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
    enabled_env = raw.get("enabled_env")
    route_prefix = raw.get("route_prefix")
    if package != "module_ai" or name != "ai":
        raise ValueError(f"{AI_MANIFEST_PATH} 必须声明 module_ai / ai")
    if not isinstance(title, str) or not title:
        raise ValueError(f"{AI_MANIFEST_PATH} 必须声明 title")
    if not isinstance(enabled_env, str) or not enabled_env:
        raise ValueError(f"{AI_MANIFEST_PATH} 必须声明 enabled_env")
    if not isinstance(route_prefix, str) or not route_prefix.startswith("/"):
        raise ValueError(f"{AI_MANIFEST_PATH} 的 route_prefix 必须以 / 开头")

    seed = raw.get("seed", {})
    if not isinstance(seed, dict):
        raise ValueError(f"{AI_MANIFEST_PATH} 的 seed 必须是 TOML 表")

    return AiPluginManifest(
        package=package,
        name=name,
        title=title,
        optional=bool(raw.get("optional", True)),
        enabled_env=enabled_env,
        route_prefix=route_prefix.rstrip("/"),
        required_modules=_as_tuple(raw.get("required_modules"), "required_modules"),
        routers=_as_tuple(raw.get("routers"), "routers"),
        websocket_routers=_as_tuple(raw.get("websocket_routers"), "websocket_routers"),
        model_modules=_as_tuple(raw.get("model_modules"), "model_modules"),
        startup_hooks=_as_tuple(raw.get("startup_hooks"), "startup_hooks"),
        permissions=_as_tuple(raw.get("permissions"), "permissions"),
        seed_route_names=_as_tuple(seed.get("route_names"), "seed.route_names"),
        seed_route_paths=_as_tuple(seed.get("route_paths"), "seed.route_paths"),
        seed_component_prefixes=_as_tuple(seed.get("component_prefixes"), "seed.component_prefixes"),
        seed_permission_prefixes=_as_tuple(seed.get("permission_prefixes"), "seed.permission_prefixes"),
    )


def _environment_file() -> Path:
    """Return the environment file selected by the core settings loader."""
    environment = os.getenv("ENVIRONMENT")
    return ENV_DIR / f".env.{environment}" if environment else ENV_DIR / ".env"


def _read_ai_enabled(manifest: AiPluginManifest) -> bool:
    """Read the AI activation switch from the active environment.

    Args:
        manifest: Validated AI metadata defining the environment variable.

    Returns:
        Whether the AI module is configured as enabled.
    """

    class AiEnableSettings(BaseSettings):
        model_config = SettingsConfigDict(env_file_encoding="utf-8", extra="ignore", case_sensitive=True)

        enabled: bool = Field(default=not manifest.optional, validation_alias=manifest.enabled_env)

    return AiEnableSettings(_env_file=_environment_file()).enabled


def _missing_dependencies(manifest: AiPluginManifest) -> tuple[str, ...]:
    """Return unavailable Python modules required by the AI module.

    Args:
        manifest: Validated AI metadata.

    Returns:
        Missing importable package names.
    """
    return tuple(module for module in manifest.required_modules if importlib.util.find_spec(module) is None)


def is_ai_plugin_enabled() -> bool:
    """Return whether the AI module is enabled and its optional packages exist.

    Returns:
        ``True`` only when AI_ENABLE is enabled and all declared packages are installed.
    """
    manifest = get_ai_plugin_manifest()
    if not _read_ai_enabled(manifest):
        return False
    if importlib.util.find_spec(f"app.plugin.{manifest.package}") is None:
        return False

    missing = _missing_dependencies(manifest)
    if missing:
        logger.warning(
            "{} 模块已跳过：缺少可选依赖 {}。请执行 `uv sync --extra {}` 后重启服务。",
            manifest.title,
            ", ".join(missing),
            manifest.name,
        )
        return False
    return True


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
    """Load HTTP routers declared by the enabled AI manifest.

    Returns:
        The container router for AI routes, or an empty tuple when AI is disabled.

    Raises:
        TypeError: If a declared entry is not an APIRouter.
    """
    if not is_ai_plugin_enabled():
        return ()

    manifest = get_ai_plugin_manifest()
    container_router = APIRouter(prefix=manifest.route_prefix)
    for entrypoint in manifest.routers:
        router = _resolve_entrypoint(manifest, entrypoint)
        if not isinstance(router, APIRouter):
            raise TypeError(f"AI 模块路由入口不是 APIRouter: {entrypoint}")
        container_router.include_router(router)
    return (container_router,)


def get_ai_websocket_routers() -> tuple[APIRouter, ...]:
    """Load WebSocket routers declared by the enabled AI manifest.

    Returns:
        AI WebSocket routers, or an empty tuple when AI is disabled.
    """
    if not is_ai_plugin_enabled():
        return ()

    manifest = get_ai_plugin_manifest()
    routers: list[APIRouter] = []
    for entrypoint in manifest.websocket_routers:
        router = _resolve_entrypoint(manifest, entrypoint)
        if not isinstance(router, APIRouter):
            raise TypeError(f"AI 模块 WebSocket 入口不是 APIRouter: {entrypoint}")
        routers.append(router)
    return tuple(routers)


def load_ai_models() -> list[type[MappedBase]]:
    """Load ORM models declared by the enabled AI manifest.

    Returns:
        AI ORM models without duplicates, or an empty list when AI is disabled.
    """
    if not is_ai_plugin_enabled():
        return []

    manifest = get_ai_plugin_manifest()
    models: list[type[MappedBase]] = []
    for module_path in manifest.model_modules:
        module = importlib.import_module(f"app.plugin.{manifest.package}.{module_path}")
        for candidate in vars(module).values():
            is_model = (
                isinstance(candidate, type)
                and issubclass(candidate, MappedBase)
                and candidate is not MappedBase
                and bool(getattr(candidate, "__tablename__", None))
            )
            if is_model and candidate not in models:
                models.append(candidate)
    return models


async def initialize_ai_plugin() -> None:
    """Run startup hooks declared by the enabled AI manifest.

    Raises:
        Exception: Propagates AI initialization errors and stops application startup.
    """
    if not is_ai_plugin_enabled():
        return

    manifest = get_ai_plugin_manifest()
    for entrypoint in manifest.startup_hooks:
        hook = _resolve_entrypoint(manifest, entrypoint)
        result = hook()
        if inspect.isawaitable(result):
            await result
        logger.info("✅ {} 初始化完成", manifest.title)


def get_ai_permission_codes() -> frozenset[str]:
    """Return the permission codes declared by the AI manifest.

    Returns:
        AI permission codes whether or not the optional module is enabled.
    """
    return frozenset(get_ai_plugin_manifest().permissions)


def _matches_ai_seed_entry(item: dict[str, Any], manifest: AiPluginManifest) -> bool:
    """Return whether a menu or role seed entry is owned by the AI module."""
    permission = str(item.get("permission", ""))
    return (
        item.get("route_name") in manifest.seed_route_names
        or str(item.get("route_path", "")).strip("/") in manifest.seed_route_paths
        or str(item.get("component_path", "")).startswith(manifest.seed_component_prefixes)
        or permission.startswith(manifest.seed_permission_prefixes)
    )


def filter_ai_seed_data(filename: str, data: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Exclude AI-owned seed records when the optional AI module is disabled.

    Args:
        filename: Seed table name without the ``.json`` extension.
        data: Parsed seed records.

    Returns:
        Seed records appropriate for the active runtime profile.
    """
    if is_ai_plugin_enabled() or filename not in {"platform_menu", "sys_role_menus"}:
        return data

    manifest = get_ai_plugin_manifest()
    if filename == "sys_role_menus":
        return [item for item in data if not _matches_ai_seed_entry(item, manifest)]

    def filter_menu_items(items: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
        filtered: list[dict[str, Any]] = []
        for raw_item in items:
            if _matches_ai_seed_entry(raw_item, manifest):
                continue
            item = {key: value for key, value in raw_item.items() if key != "children"}
            children = filter_menu_items(raw_item.get("children", []))
            if children:
                item["children"] = children
            filtered.append(item)
        return filtered

    return filter_menu_items(data)


__all__ = [
    "filter_ai_seed_data",
    "get_ai_permission_codes",
    "get_ai_plugin_manifest",
    "get_ai_routers",
    "get_ai_websocket_routers",
    "initialize_ai_plugin",
    "is_ai_plugin_enabled",
    "load_ai_models",
]
