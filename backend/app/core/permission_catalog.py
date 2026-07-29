"""Central permission-code catalog for RBAC audits.

Menu seed data controls UI visibility and role grants, while backend
``AuthPermission`` dependencies enforce the real security boundary. Keep every
permission code used by either side in this catalog so drift is testable.
"""

from app.core.plugins import get_ai_permission_codes

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
        "module_system:dict_data:create",
        "module_system:dict_data:delete",
        "module_system:dict_data:detail",
        "module_system:dict_data:export",
        "module_system:dict_data:patch",
        "module_system:dict_data:query",
        "module_system:dict_data:update",
        "module_system:dict_type:create",
        "module_system:dict_type:delete",
        "module_system:dict_type:detail",
        "module_system:dict_type:export",
        "module_system:dict_type:patch",
        "module_system:dict_type:query",
        "module_system:dict_type:update",
        "module_system:log:delete",
        "module_system:log:query",
        "module_system:login_log:delete",
        "module_system:login_log:query",
        "module_system:param:create",
        "module_system:param:delete",
        "module_system:param:detail",
        "module_system:param:export",
        "module_system:param:patch",
        "module_system:param:query",
        "module_system:param:update",
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

PERMISSION_CODES: frozenset[str] = CORE_PERMISSION_CODES | get_ai_permission_codes()
