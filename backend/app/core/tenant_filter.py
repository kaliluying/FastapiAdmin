"""多租户 ORM 查询过滤器

通过 SQLAlchemy 的 ``do_orm_execute`` 事件，在 ORM 层自动注入租户过滤条件。

核心逻辑：
- SELECT: 如果实体映射的表有 ``tenant_id`` 列且当前用户不是超级管理员，
  自动追加 ``WHERE tenant_id = current_tenant_id``。
- INSERT: 如果表有 ``tenant_id`` 列，自动设置值为 ``current_tenant_id``。
- UPDATE/DELETE: 如果表有 ``tenant_id`` 列且非超管，
  自动追加 ``WHERE tenant_id = current_tenant_id``。
- 超管（``is_super_admin=True``）时跳过所有 tenant_id 过滤。
"""

from __future__ import annotations

import logging

from sqlalchemy import event, inspect
from sqlalchemy.orm import Mapper, Session
from sqlalchemy.sql import Delete, Insert, Select, Update

from app.core.tenant import get_current_tenant_id, get_is_super_admin

logger = logging.getLogger(__name__)

# 系统表名集合（不对这些表进行租户过滤，避免死循环）
_SYSTEM_TABLE_NAMES: frozenset[str] = frozenset({"sys_tenant"})


def _has_tenant_column(mapper_or_entity) -> bool:
    """检查映射类或实体是否有 ``tenant_id`` 列。

    参数:
        mapper_or_entity: SQLAlchemy Mapper 对象或映射类。

    返回:
        bool: 是否包含 tenant_id 列。
    """
    try:
        mapper = inspect(mapper_or_entity)
        if isinstance(mapper, Mapper):
            return "tenant_id" in mapper.columns
        return False
    except Exception:
        return False


def _is_system_table(table) -> bool:
    """判断是否为系统表（不应被租户过滤）。

    参数:
        table: SQLAlchemy Table 对象。

    返回:
        bool: 是否为系统表。
    """
    return table.name in _SYSTEM_TABLE_NAMES


def _collect_tenant_mappers(execute_state) -> set[Mapper]:
    """从 ORM 执行状态中收集所有包含 tenant_id 列的 Mapper。

    参数:
        execute_state: SQLAlchemy ORMExecuteState 对象。

    返回:
        set[Mapper]: 需要租户过滤的 Mapper 集合。
    """
    tenant_mappers: set[Mapper] = set()

    # 检查绑定的 Mapper（单实体查询）
    if execute_state.bind_mapper and _has_tenant_column(execute_state.bind_mapper):
        mapper = inspect(execute_state.bind_mapper)
        if not _is_system_table(mapper.mapped_table):
            tenant_mappers.add(mapper)

    # 检查语句中所有实体（多实体查询 / join）
    stmt = execute_state.statement
    if hasattr(stmt, "column_descriptions"):
        for desc in stmt.column_descriptions:
            entity = desc.get("entity")
            if entity is not None and _has_tenant_column(entity):
                mapper = inspect(entity)
                if not _is_system_table(mapper.mapped_table):
                    tenant_mappers.add(mapper)

    return tenant_mappers


def _apply_tenant_to_select(execute_state, tenant_id: int) -> None:
    """为 SELECT 语句添加租户过滤条件。

    对每个包含 tenant_id 列的映射表，追加 ``WHERE tenant_id = ?``。

    参数:
        execute_state: ORMExecuteState 对象。
        tenant_id: 当前租户 ID。
    """
    tenant_mappers = _collect_tenant_mappers(execute_state)
    if not tenant_mappers:
        return

    stmt = execute_state.statement
    for mapper in tenant_mappers:
        table = mapper.mapped_table
        stmt = stmt.where(table.c.tenant_id == tenant_id)

    execute_state.statement = stmt


def _apply_tenant_to_insert(execute_state, tenant_id: int) -> None:
    """为 INSERT 语句设置 tenant_id 值。

    如果插入语句未显式指定 tenant_id，则自动设置为当前租户 ID。

    参数:
        execute_state: ORMExecuteState 对象。
        tenant_id: 当前租户 ID。
    """
    stmt: Insert = execute_state.statement

    if not hasattr(stmt, "table"):
        return

    table = stmt.table
    if not _has_tenant_column(table) or _is_system_table(table):
        return

    # 检查是否已经显式设置了 tenant_id
    compiled_params = stmt.compile(bind=execute_state.session.bind)
    for params in compiled_params.construct_params():
        if "tenant_id" in params:
            return  # 已显式设置，不覆盖

    # 自动注入 tenant_id
    stmt = stmt.values(tenant_id=tenant_id)
    execute_state.statement = stmt


def _apply_tenant_to_update(execute_state, tenant_id: int) -> None:
    """为 UPDATE 语句添加租户过滤条件。

    参数:
        execute_state: ORMExecuteState 对象。
        tenant_id: 当前租户 ID。
    """
    stmt: Update = execute_state.statement

    if not hasattr(stmt, "table"):
        return

    table = stmt.table
    if not _has_tenant_column(table) or _is_system_table(table):
        return

    stmt = stmt.where(table.c.tenant_id == tenant_id)
    execute_state.statement = stmt


def _apply_tenant_to_delete(execute_state, tenant_id: int) -> None:
    """为 DELETE 语句添加租户过滤条件。

    参数:
        execute_state: ORMExecuteState 对象。
        tenant_id: 当前租户 ID。
    """
    stmt: Delete = execute_state.statement

    if not hasattr(stmt, "table"):
        return

    table = stmt.table
    if not _has_tenant_column(table) or _is_system_table(table):
        return

    stmt = stmt.where(table.c.tenant_id == tenant_id)
    execute_state.statement = stmt


@event.listens_for(Session, "do_orm_execute")
def tenant_orm_filter(execute_state) -> None:
    """SQLAlchemy ``do_orm_execute`` 事件处理器。

    在每次 ORM 执行前自动注入租户过滤条件。
    通过 ContextVar 获取当前请求的租户上下文，
    超级管理员或未设置租户上下文时跳过过滤。

    参数:
        execute_state: ORMExecuteState 对象。
    """
    # 跳过列加载和关系加载（内部操作）
    if execute_state.is_column_load or execute_state.is_relationship_load:
        return

    # 获取当前租户上下文
    tenant_id = get_current_tenant_id()
    is_super_admin = get_is_super_admin()

    # 超级管理员不过滤；未设置租户上下文时不过滤
    if is_super_admin or tenant_id is None:
        return

    stmt = execute_state.statement

    try:
        if isinstance(stmt, Select):
            _apply_tenant_to_select(execute_state, tenant_id)
        elif isinstance(stmt, Insert):
            _apply_tenant_to_insert(execute_state, tenant_id)
        elif isinstance(stmt, Update):
            _apply_tenant_to_update(execute_state, tenant_id)
        elif isinstance(stmt, Delete):
            _apply_tenant_to_delete(execute_state, tenant_id)
    except Exception:
        # 过滤异常时记录日志但不中断业务逻辑
        logger.exception(
            "租户 ORM 过滤异常: statement_type=%s, tenant_id=%s",
            type(stmt).__name__,
            tenant_id,
        )
