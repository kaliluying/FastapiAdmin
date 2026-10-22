"""移除参数管理和字典管理模块。

Revision ID: 20260924_remove_params_and_dict
Revises:
"""

from alembic import op
from sqlalchemy import inspect

revision = "20260924_remove_params_and_dict"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """从已有部署中删除被移除模块的数据和菜单记录。"""
    bind = op.get_bind()
    tables = set(inspect(bind).get_table_names())
    if "platform_menu" in tables:
        if "sys_role_menus" in tables:
            op.execute(
                "DELETE FROM sys_role_menus WHERE menu_id IN "
                "(SELECT id FROM (SELECT id FROM platform_menu WHERE route_name IN ('Dict', 'Params')) AS removed_roots)"
            )
        op.execute(
            "DELETE FROM platform_menu WHERE parent_id IN "
            "(SELECT id FROM (SELECT id FROM platform_menu WHERE route_name IN ('Dict', 'Params')) AS removed_roots)"
        )
        op.execute("DELETE FROM platform_menu WHERE route_name IN ('Dict', 'Params')")
    for table in ("sys_dict_data", "sys_dict_type", "sys_param"):
        if table in tables:
            op.drop_table(table)


def downgrade() -> None:
    """回退迁移时不恢复已删除的数据表和种子记录。"""
    pass
