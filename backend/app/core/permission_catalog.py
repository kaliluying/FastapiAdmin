"""集中维护用于 RBAC 审计的权限编码。

菜单种子控制界面可见性和角色授权，后端 ``AuthPermission`` 依赖执行实际权限校验。
将两端使用的权限编码统一收录，便于通过测试发现不一致。
"""

from app.core.modules import get_modules

CORE_PERMISSION_CODES: frozenset[str] = frozenset(
    {
        "module_common:file:download",
        "module_common:file:upload",
        "module_platform:menu:create",
        "module_platform:menu:delete",
        "module_platform:menu:detail",
        "module_platform:menu:patch",
        "module_platform:menu:query",
        "module_platform:menu:update",
        "module_system:log:delete",
        "module_system:log:query",
        "module_system:login_log:delete",
        "module_system:login_log:query",
        "module_system:role:create",
        "module_system:role:delete",
        "module_system:role:detail",
        "module_system:role:export",
        "module_system:role:patch",
        "module_system:role:permission",
        "module_system:role:query",
        "module_system:role:update",
        "module_system:user:create",
        "module_system:user:delete",
        "module_system:user:detail",
        "module_system:user:download",
        "module_system:user:export",
        "module_system:user:import",
        "module_system:user:patch",
        "module_system:user:query",
        "module_system:user:update",
    }
)

PERMISSION_CODES: frozenset[str] = CORE_PERMISSION_CODES | frozenset(code for module in get_modules() for code in module.permissions)
