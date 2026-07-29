"""Manifest-driven optional plugin registry.

Each plugin owns a ``plugin.toml`` file below ``app/plugin``. The core backend
only understands the generic manifest fields and never imports an optional
plugin until it has been explicitly enabled and its declared dependencies are
available.
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

PLUGIN_DIR = Path(__file__).resolve().parents[1] / "plugin"


@dataclass(frozen=True)
class PluginManifest:
    """Describe one optional plugin without importing its implementation.

    Attributes:
        package: Plugin package directory below ``app.plugin``.
        name: Stable product-facing plugin name.
        optional: Whether the plugin defaults to disabled.
        enabled_env: Environment variable controlling activation.
        route_prefix: HTTP prefix applied to every declared router.
        required_modules: Importable dependency modules required at runtime.
        routers: Router entry points in ``module:attribute`` form.
        websocket_routers: WebSocket router entry points.
        model_modules: Modules that declare ORM models.
        startup_hooks: Async or sync initialization entry points.
        permissions: Permission codes owned by the plugin.
        seed_*: Menu and role-seed matchers used when a plugin is disabled.
    """

    package: str
    name: str
    title: str
    optional: bool
    enabled_env: str | None
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


def _as_tuple(value: Any, field_name: str, path: Path) -> tuple[str, ...]:
    """Validate a manifest string-list field.

    Args:
        value: Parsed TOML field value.
        field_name: Field name used in diagnostics.
        path: Manifest file path.

    Returns:
        A tuple of non-empty strings.

    Raises:
        ValueError: If the value is not an array of strings.
    """
    if value is None:
        return ()
    if not isinstance(value, list) or not all(isinstance(item, str) and item for item in value):
        raise ValueError(f"{path} 的 {field_name} 必须是非空字符串数组")
    return tuple(value)


def _load_manifest(path: Path) -> PluginManifest:
    """Parse one plugin manifest without importing its package.

    Args:
        path: Path to a ``plugin.toml`` file.

    Returns:
        A validated plugin manifest.

    Raises:
        ValueError: If required manifest metadata is invalid.
    """
    with path.open("rb") as file:
        raw = tomllib.load(file)

    package = raw.get("package", path.parent.name)
    name = raw.get("name")
    title = raw.get("title", name)
    if not all(isinstance(value, str) and value for value in (package, name, title)):
        raise ValueError(f"{path} 必须声明 package、name 和 title")
    if package != path.parent.name:
        raise ValueError(f"{path} 的 package 必须与目录名 {path.parent.name!r} 一致")
    route_prefix = raw.get("route_prefix", "")
    if not isinstance(route_prefix, str) or not route_prefix.startswith("/"):
        raise ValueError(f"{path} 的 route_prefix 必须以 / 开头")

    seed = raw.get("seed", {})
    if not isinstance(seed, dict):
        raise ValueError(f"{path} 的 seed 必须是 TOML 表")

    return PluginManifest(
        package=package,
        name=name,
        title=title,
        optional=bool(raw.get("optional", False)),
        enabled_env=raw.get("enabled_env"),
        route_prefix=route_prefix.rstrip("/"),
        required_modules=_as_tuple(raw.get("required_modules"), "required_modules", path),
        routers=_as_tuple(raw.get("routers"), "routers", path),
        websocket_routers=_as_tuple(raw.get("websocket_routers"), "websocket_routers", path),
        model_modules=_as_tuple(raw.get("model_modules"), "model_modules", path),
        startup_hooks=_as_tuple(raw.get("startup_hooks"), "startup_hooks", path),
        permissions=_as_tuple(raw.get("permissions"), "permissions", path),
        seed_route_names=_as_tuple(seed.get("route_names"), "seed.route_names", path),
        seed_route_paths=_as_tuple(seed.get("route_paths"), "seed.route_paths", path),
        seed_component_prefixes=_as_tuple(seed.get("component_prefixes"), "seed.component_prefixes", path),
        seed_permission_prefixes=_as_tuple(seed.get("permission_prefixes"), "seed.permission_prefixes", path),
    )


@lru_cache(maxsize=1)
def get_plugin_manifests() -> tuple[PluginManifest, ...]:
    """Return all plugin manifests in deterministic order.

    Returns:
        Parsed manifests sorted by package path.

    Raises:
        ValueError: If two manifests use the same package or name.
    """
    manifests = tuple(_load_manifest(path) for path in sorted(PLUGIN_DIR.glob("*/plugin.toml")))
    packages = [manifest.package for manifest in manifests]
    names = [manifest.name for manifest in manifests]
    if len(packages) != len(set(packages)) or len(names) != len(set(names)):
        raise ValueError("插件 package 与 name 必须唯一")
    return manifests


def get_plugin_manifest(identifier: str | PluginManifest) -> PluginManifest | None:
    """Resolve a manifest by package or stable name.

    Args:
        identifier: A manifest object, package directory, or plugin name.

    Returns:
        The matching manifest, or ``None`` when it is not installed.
    """
    if isinstance(identifier, PluginManifest):
        return identifier
    return next(
        (manifest for manifest in get_plugin_manifests() if identifier in {manifest.package, manifest.name}),
        None,
    )


def _environment_file() -> Path:
    """Return the same environment file selected by the core settings loader."""
    environment = os.getenv("ENVIRONMENT")
    return ENV_DIR / f".env.{environment}" if environment else ENV_DIR / ".env"


def _read_enabled_flag(environment_name: str, default: bool) -> bool:
    """Read a manifest-controlled boolean from the configured environment file.

    Args:
        environment_name: Environment variable declared by the manifest.
        default: Value used when the variable is absent.

    Returns:
        The parsed boolean flag.
    """

    class PluginEnableSettings(BaseSettings):
        model_config = SettingsConfigDict(env_file_encoding="utf-8", extra="ignore", case_sensitive=True)

        enabled: bool = Field(default=default, validation_alias=environment_name)

    return PluginEnableSettings(_env_file=_environment_file()).enabled


def _missing_dependencies(manifest: PluginManifest) -> tuple[str, ...]:
    """Find unavailable modules declared by a plugin manifest.

    Args:
        manifest: Manifest whose dependency contract is checked.

    Returns:
        Missing importable module names.
    """
    return tuple(module for module in manifest.required_modules if importlib.util.find_spec(module) is None)


def is_plugin_enabled(identifier: str | PluginManifest) -> bool:
    """Return whether an installed plugin is configured and available.

    Args:
        identifier: Plugin package, stable name, or manifest.

    Returns:
        ``True`` only when the activation flag, package, and dependencies are available.
    """
    manifest = get_plugin_manifest(identifier)
    if manifest is None:
        return False
    if manifest.enabled_env and not _read_enabled_flag(manifest.enabled_env, default=not manifest.optional):
        return False
    if importlib.util.find_spec(f"app.plugin.{manifest.package}") is None:
        return False

    missing = _missing_dependencies(manifest)
    if missing:
        install_hint = f"uv sync --extra {manifest.name}"
        logger.warning("{} 插件已跳过：缺少可选依赖 {}。请执行 `{}` 后重启服务。", manifest.title, ", ".join(missing), install_hint)
        return False
    return True


def get_enabled_plugins() -> tuple[PluginManifest, ...]:
    """Return manifests that are enabled in the current runtime."""
    return tuple(manifest for manifest in get_plugin_manifests() if is_plugin_enabled(manifest))


def _resolve_entrypoint(manifest: PluginManifest, entrypoint: str) -> Any:
    """Import a manifest entry point relative to its plugin package.

    Args:
        manifest: Plugin that owns the entry point.
        entrypoint: ``module:attribute`` value from the manifest.

    Returns:
        The exported attribute.

    Raises:
        ValueError: If the entry point lacks a module or attribute.
        AttributeError: If the declared attribute does not exist.
    """
    module_path, separator, attribute = entrypoint.partition(":")
    if not separator or not module_path or not attribute:
        raise ValueError(f"插件 {manifest.name} 的入口必须使用 module:attribute 形式: {entrypoint!r}")
    module = importlib.import_module(f"app.plugin.{manifest.package}.{module_path}")
    return getattr(module, attribute)


def get_plugin_routers() -> tuple[APIRouter, ...]:
    """Load HTTP routers explicitly declared by enabled plugin manifests.

    Returns:
        Router instances in manifest order.

    Raises:
        TypeError: If a manifest entry is not an ``APIRouter``.
    """
    routers: list[APIRouter] = []
    for manifest in get_enabled_plugins():
        container_router = APIRouter(prefix=manifest.route_prefix)
        for entrypoint in manifest.routers:
            router = _resolve_entrypoint(manifest, entrypoint)
            if not isinstance(router, APIRouter):
                raise TypeError(f"插件 {manifest.name} 的路由入口不是 APIRouter: {entrypoint}")
            container_router.include_router(router)
        routers.append(container_router)
    return tuple(routers)


def get_plugin_websocket_routers() -> tuple[APIRouter, ...]:
    """Load WebSocket routers explicitly declared by enabled manifests."""
    routers: list[APIRouter] = []
    for manifest in get_enabled_plugins():
        for entrypoint in manifest.websocket_routers:
            router = _resolve_entrypoint(manifest, entrypoint)
            if not isinstance(router, APIRouter):
                raise TypeError(f"插件 {manifest.name} 的 WebSocket 入口不是 APIRouter: {entrypoint}")
            routers.append(router)
    return tuple(routers)


def load_enabled_plugin_models() -> list[type[MappedBase]]:
    """Import enabled plugin model modules and return their mapped model classes.

    Returns:
        ORM models declared by enabled plugin manifests, without duplicates.
    """
    models: list[type[MappedBase]] = []
    for manifest in get_enabled_plugins():
        for module_path in manifest.model_modules:
            module = importlib.import_module(f"app.plugin.{manifest.package}.{module_path}")
            for candidate in vars(module).values():
                if isinstance(candidate, type) and issubclass(candidate, MappedBase) and candidate is not MappedBase and bool(getattr(candidate, "__tablename__", None)) and candidate not in models:
                    models.append(candidate)
    return models


async def initialize_enabled_plugins() -> None:
    """Run startup hooks explicitly declared by enabled plugin manifests.

    Raises:
        Exception: Propagates plugin initialization failures to fail application startup.
    """
    for manifest in get_enabled_plugins():
        for entrypoint in manifest.startup_hooks:
            hook = _resolve_entrypoint(manifest, entrypoint)
            result = hook()
            if inspect.isawaitable(result):
                await result
            logger.info("✅ {} 插件初始化完成", manifest.title)


def get_plugin_permission_codes() -> frozenset[str]:
    """Return permission codes declared by every installed plugin manifest."""
    return frozenset(permission for manifest in get_plugin_manifests() for permission in manifest.permissions)


def _matches_seed_entry(item: dict[str, Any], manifest: PluginManifest) -> bool:
    """Return whether a menu or role-seed entry belongs to a plugin."""
    permission = str(item.get("permission", ""))
    return (
        item.get("route_name") in manifest.seed_route_names
        or str(item.get("route_path", "")).strip("/") in manifest.seed_route_paths
        or str(item.get("component_path", "")).startswith(manifest.seed_component_prefixes)
        or permission.startswith(manifest.seed_permission_prefixes)
    )


def filter_disabled_plugin_seed_data(filename: str, data: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Remove seed records owned by plugins that are disabled.

    Args:
        filename: Seed table name without its ``.json`` extension.
        data: Parsed seed records.

    Returns:
        Seed records that can be installed in the current runtime profile.
    """
    disabled_plugins = tuple(manifest for manifest in get_plugin_manifests() if not is_plugin_enabled(manifest))
    if not disabled_plugins or filename not in {"platform_menu", "sys_role_menus"}:
        return data

    if filename == "sys_role_menus":
        return [item for item in data if not any(_matches_seed_entry(item, manifest) for manifest in disabled_plugins)]

    def filter_menu_items(items: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
        filtered: list[dict[str, Any]] = []
        for raw_item in items:
            if any(_matches_seed_entry(raw_item, manifest) for manifest in disabled_plugins):
                continue
            item = {key: value for key, value in raw_item.items() if key != "children"}
            children = filter_menu_items(raw_item.get("children", []))
            if children:
                item["children"] = children
            filtered.append(item)
        return filtered

    return filter_menu_items(data)


__all__ = [
    "filter_disabled_plugin_seed_data",
    "get_enabled_plugins",
    "get_plugin_manifests",
    "get_plugin_permission_codes",
    "get_plugin_routers",
    "get_plugin_websocket_routers",
    "initialize_enabled_plugins",
    "is_plugin_enabled",
    "load_enabled_plugin_models",
]
