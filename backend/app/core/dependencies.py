import json
from collections.abc import AsyncGenerator
from dataclasses import replace
from typing import Any

from fastapi import Depends, Query, Request, WebSocket
from redis.asyncio.client import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.common.enums import RedisInitKeyConfig
from app.config.setting import settings
from app.core.base_schema import AuthSchema
from app.core.database import async_db_session
from app.core.exceptions import CustomException
from app.core.logger import logger
from app.core.redis_crud import RedisCURD
from app.core.request_context import RequestContext
from app.core.security import OAuth2Schema, decode_access_token

WS_TICKET_PREFIX = "auth:ws_ticket:"
PERMISSION_CACHE_PREFIX = "auth:permissions:"
PERMISSION_CACHE_VERSION_KEY = "auth:permissions:version"
PERMISSION_CACHE_TTL = 300


def _write_request_transaction(method: str) -> bool:
    return method.upper() in {"POST", "PUT", "PATCH", "DELETE"}


async def _db_getter(write: bool) -> AsyncGenerator[AsyncSession, None]:
    async with async_db_session() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        else:
            if write:
                await session.commit()
            else:
                await session.rollback()


async def db_getter(request: Request) -> AsyncGenerator[AsyncSession, None]:
    """按 HTTP 方法提交写请求、回滚读请求，释放无用读事务。"""
    async for session in _db_getter(_write_request_transaction(request.method)):
        yield session


async def ws_db_getter(websocket: WebSocket) -> AsyncGenerator[AsyncSession, None]:
    """WebSocket 认证使用只读会话，避免依赖 HTTP Request 类型。"""
    async for session in _db_getter(False):
        yield session


async def redis_getter(request: Request) -> Redis:
    """获取Redis连接

    参数:
    - request (Request): 请求对象

    返回:
    - Redis: Redis连接
    """
    return request.app.state.redis


async def _decode_token_info(token: str, redis: Redis) -> tuple[dict, str]:
    """解码 JWT token 返回 (user_info, session_id)

    JWT sub 现为纯 session_id，完整会话信息从 Redis 读取。

    参数:
        token: JWT token 字符串
        redis: Redis 连接

    返回:
        (user_info, session_id): 用户信息字典和会话 ID
    """
    payload = decode_access_token(token)
    if not payload or not hasattr(payload, "is_refresh") or payload.is_refresh:
        raise CustomException(msg="非法凭证", code=10401, status_code=401)

    session_id = payload.sub
    raw = await RedisCURD(redis).get(
        f"{RedisInitKeyConfig.USER_SESSION.key}:{session_id}"
    )
    if not raw:
        raise CustomException(msg="认证已失效", code=10401, status_code=401)

    user_info = json.loads(raw)
    if not session_id:
        raise CustomException(msg="认证已失效", code=10401, status_code=401)

    return user_info, session_id


async def _check_token_online(redis: Redis, session_id: str) -> None:
    """检查 token 是否在线（Redis 中存在对应 session）

    参数:
        redis: Redis 连接
        session_id: 会话 ID
    """
    online_ok = await RedisCURD(redis).exists(
        key=f"{RedisInitKeyConfig.ACCESS_TOKEN.key}:{session_id}"
    )
    if not online_ok:
        raise CustomException(msg="认证已失效", code=10401, status_code=401)


async def _try_sliding_refresh(redis: Redis, session_id: str) -> None:
    """滑动过期续期（仅在 token 剩余不足一半时触发）

    参数:
        redis: Redis 连接
        session_id: 会话 ID
    """
    if not settings.TOKEN_SLIDING_EXPIRE:
        return

    ttl = await RedisCURD(redis).ttl(
        key=f"{RedisInitKeyConfig.ACCESS_TOKEN.key}:{session_id}"
    )
    if ttl > 0 and ttl < settings.ACCESS_TOKEN_EXPIRE_MINUTES // 2:
        await RedisCURD(redis).expire(
            key=f"{RedisInitKeyConfig.ACCESS_TOKEN.key}:{session_id}",
            expire=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        )
        await RedisCURD(redis).expire(
            key=f"{RedisInitKeyConfig.REFRESH_TOKEN.key}:{session_id}",
            expire=settings.REFRESH_TOKEN_EXPIRE_MINUTES,
        )


def _build_permission_map(user: Any) -> dict[str, int]:
    permissions: dict[str, int] = {}
    for role in getattr(user, "roles", []) or []:
        if getattr(role, "status", None) != 0:
            continue
        for menu in getattr(role, "menus", []) or []:
            permission = getattr(menu, "permission", None)
            if getattr(menu, "status", None) == 0 and permission:
                permissions[permission] = menu.id
    return permissions


async def _load_permission_map(redis: Redis, user: Any) -> dict[str, int]:
    """Load permission IDs from Redis, rebuilding after a global version bump."""
    try:
        version = await RedisCURD(redis).get(PERMISSION_CACHE_VERSION_KEY) or "0"
        raw = await RedisCURD(redis).get(f"{PERMISSION_CACHE_PREFIX}{version}:{user.id}")
        if raw:
            if isinstance(raw, bytes):
                raw = raw.decode("utf-8")
            parsed = json.loads(raw) if isinstance(raw, str) else raw
            if isinstance(parsed, dict):
                return {str(key): int(value) for key, value in parsed.items()}
        permissions = _build_permission_map(user)
        await RedisCURD(redis).set(f"{PERMISSION_CACHE_PREFIX}{version}:{user.id}", permissions, expire=PERMISSION_CACHE_TTL)
        return permissions
    except Exception as exc:
        logger.debug("权限缓存不可用，回退到用户关系: {}", exc)
        return _build_permission_map(user)


async def invalidate_permission_cache(redis: Redis | None) -> None:
    """Invalidate all derived permission maps after RBAC writes."""
    if redis is None:
        return
    try:
        await redis.incr(PERMISSION_CACHE_VERSION_KEY)
    except Exception as exc:
        logger.debug("权限缓存失效失败: {}", exc)

async def _load_user_from_db(db: AsyncSession, username: str):
    """从数据库加载用户（含角色、菜单等关联的全量预加载）

    使用原始查询以绕过 CRUDBase 的权限过滤，确保用户认证阶段不受数据权限影响。
    所有关系链均 eager-loaded，调用方可在会话关闭后安全访问对象属性。

    参数:
        db: 数据库会话
        username: 用户名

    返回:
        UserModel: 已全量加载的用户 ORM 对象
    """
    from app.api.v1.module_system.role.model import RoleModel
    from app.api.v1.module_system.user.model import UserModel

    stmt = (
        select(UserModel)
        .options(
            selectinload(UserModel.roles).selectinload(RoleModel.menus),
            selectinload(UserModel.created_by),
        )
        .where(UserModel.username == username, UserModel.is_deleted == False)  # noqa: E712
    )
    result = await db.execute(stmt)
    user = result.scalars().first()
    if not user:
        raise CustomException(msg="用户不存在", code=10401, status_code=401)
    if user.status == 1:
        raise CustomException(msg="用户已被停用", code=10401, status_code=401)

    # 过滤不可用的角色和职位（在会话内完成，确保关联数据已加载）
    if hasattr(user, "roles"):
        user.roles = [role for role in user.roles if role and role.status == 0]

    return user

async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(db_getter),
    redis: Redis = Depends(redis_getter),
    token: str = Depends(OAuth2Schema),
) -> AuthSchema:
    """获取当前用户

    用户查询使用独立的只读数据库会话（不参与请求事务，查询完成后立即释放快照），
    返回的 auth.db 指向请求级事务会话供后续写操作使用。

    参数:
    - request (Request): 请求对象
    - db (AsyncSession): 请求级事务会话
    - redis (Redis): Redis连接
    - token (str): 访问令牌

    返回:
    - AuthSchema: 认证信息模型
    """
    if not token:
        raise CustomException(msg="认证已失效", code=10401, status_code=401)

    # 处理Bearer token
    if token.startswith("Bearer"):
        token = token.split(" ")[1]

    # 优先使用请求上下文缓存的会话信息（避免重复 Redis 读取）
    ctx = getattr(request.state, "ctx", None)
    cached_user_info = ctx.jwt_user_info if ctx else None

    if cached_user_info:
        user_info = cached_user_info
    else:
        # 降级路径：自行从 Redis 读取会话信息
        user_info, _ = await _decode_token_info(token, redis)

    session_id = user_info.get("session_id")
    if not session_id:
        raise CustomException(msg="认证已失效", code=10401, status_code=401)

    # Redis 在线检查 + 滑动续期
    await _check_token_online(redis, session_id)
    await _try_sliding_refresh(redis, session_id)

    username = user_info.get("user_name")
    if not username:
        raise CustomException(msg="认证已失效", code=10401, status_code=401)

    user = await _load_user_from_db(db, username)
    permission_map = await _load_permission_map(redis, user)

    # 设置请求上下文（仅在当前 request 对象上，业务方通过 request.state.ctx 读取）
    request.state.ctx = replace(
        (getattr(request.state, "ctx", None) or RequestContext()),
        user_id=user.id,
        user_username=user.username,
        session_id=session_id,
        session_info=user_info,
    )

    # 返回的 auth.db 指向请求级事务会话，供后续读写操作使用
    auth = AuthSchema(db=db, redis=redis, permission_map=permission_map, check_data_scope=False)
    auth.user = user
    return auth


async def get_current_user_ws(
    ticket: str = Query(..., description="一次性 WebSocket ticket"),
    db: AsyncSession = Depends(ws_db_getter),
    redis: Redis = Depends(redis_getter),
) -> AuthSchema:
    """获取当前用户（WebSocket专用，从查询参数获取一次性 ticket）

    参数:
    - token (str): 认证token
    - db (AsyncSession): 数据库会话
    - redis (Redis): Redis连接

    返回:
    - AuthSchema: 认证信息模型
    """
    return await _verify_ws_ticket(ticket, db, redis)


async def _verify_ws_ticket(ticket: str, db: AsyncSession, redis: Redis) -> AuthSchema:
    """Consume a short-lived WebSocket ticket and load its user session.

    Args:
        ticket: One-time ticket issued by the authenticated HTTP endpoint.
        db: Database session used to load the user.
        redis: Redis connection containing the ticket and session state.

    Returns:
        Authenticated user context.

    Raises:
        CustomException: If the ticket is missing, replayed, or expired.
    """
    if not ticket or len(ticket) > 256:
        raise CustomException(msg="认证已失效", code=10401, status_code=401)
    raw = await RedisCURD(redis).getdel(f"{WS_TICKET_PREFIX}{ticket}")
    if not raw:
        raise CustomException(msg="WebSocket ticket 已失效", code=10401, status_code=401)
    if isinstance(raw, bytes):
        raw = raw.decode("utf-8")
    try:
        ticket_data = json.loads(raw)
    except (TypeError, json.JSONDecodeError):
        raise CustomException(msg="WebSocket ticket 无效", code=10401, status_code=401)
    session_id = str(ticket_data.get("session_id") or "")
    if not session_id:
        raise CustomException(msg="WebSocket ticket 无效", code=10401, status_code=401)
    await _check_token_online(redis, session_id)
    session_raw = await RedisCURD(redis).get(f"{RedisInitKeyConfig.USER_SESSION.key}:{session_id}")
    if not session_raw:
        raise CustomException(msg="认证已失效", code=10401, status_code=401)
    if isinstance(session_raw, bytes):
        session_raw = session_raw.decode("utf-8")
    try:
        user_info = json.loads(session_raw)
    except (TypeError, json.JSONDecodeError):
        raise CustomException(msg="认证已失效", code=10401, status_code=401)
    username = user_info.get("user_name")
    if not username:
        raise CustomException(msg="认证已失效", code=10401, status_code=401)
    user = await _load_user_from_db(db, username)
    auth = AuthSchema(db=db, redis=redis, permission_map=await _load_permission_map(redis, user), check_data_scope=False)
    auth.user = user
    return auth


async def _verify_token(
    token: str,
    db: AsyncSession,
    redis: Redis,
) -> AuthSchema:
    """验证token并返回用户信息（共享核心逻辑）

    参数:
    - token (str): 认证token
    - db (AsyncSession): 数据库会话
    - redis (Redis): Redis连接

    返回:
    - AuthSchema: 认证信息模型
    """
    if not token:
        raise CustomException(msg="认证已失效", code=10401, status_code=401)

    # 处理Bearer token（如果通过查询参数传递时包含Bearer前缀）
    if token.startswith("Bearer"):
        token = token.split(" ")[1]

    user_info, session_id = await _decode_token_info(token, redis)
    await _check_token_online(redis, session_id)
    await _try_sliding_refresh(redis, session_id)

    username = user_info.get("user_name")
    if not username:
        raise CustomException(msg="认证已失效", code=10401, status_code=401)

    user = await _load_user_from_db(db, username)

    auth = AuthSchema(db=db, redis=redis, permission_map=await _load_permission_map(redis, user), check_data_scope=False)
    auth.user = user
    return auth

class AuthPermission:
    """权限验证类"""

    def __init__(
        self,
        permissions: list[str] | None = None,
        check_data_scope: bool = True,
    ) -> None:
        """
        初始化权限验证

        参数:
        - permissions (list[str] | None): 权限标识列表。
        - check_data_scope (bool): 是否启用严格模式校验。
        """
        self.permissions = permissions or []
        self.check_data_scope = check_data_scope

    async def __call__(self, auth: AuthSchema = Depends(get_current_user)) -> AuthSchema:
        """
        调用权限验证

        参数:
        - auth (AuthSchema): 认证信息对象。

        返回:
        - AuthSchema: 认证信息对象。
        """
        # 用 model_copy 派生一份带正确 check_data_scope 的新实例（不修改原实例）
        auth = auth.model_copy(update={"check_data_scope": self.check_data_scope})

        # 超级管理员直接通过
        if auth.user and auth.user.is_superuser:
            return auth

        # 无需验证权限
        if not self.permissions:
            return auth

        # 超级管理员权限标识
        if "*" in self.permissions or "*:*:*" in self.permissions:
            return auth

        # 检查用户是否有角色
        if not auth.user or not auth.user.roles:
            raise CustomException(msg="无权限操作", code=10403, status_code=403)

        # 收集角色菜单权限。
        role_perms = auth.permission_map or _build_permission_map(auth.user)

        if not role_perms:
            raise CustomException(msg="无权限操作", code=10403, status_code=403)

        user_permissions = set(role_perms.keys())

        # 权限验证 - 满足任一权限即可
        if not any(perm in user_permissions for perm in self.permissions):
            logger.error(f"用户缺少任何所需的权限: {self.permissions}")
            raise CustomException(msg="无权限操作", code=10403, status_code=403)

        return auth


def require_superadmin(func):
    """
    装饰器：仅超级管理员可调用 Service 方法。

    自动校验 ``self.auth.user.is_superuser`` 属性，非超管直接抛出 403。
    适用于实例方法（``Service(auth).xxx(...)``），由 ``self.auth`` 取认证上下文。

    用法:
        class XxxService:
            def __init__(self, auth: AuthSchema) -> None:
                self.auth = auth

            @require_superadmin
            async def create(self, data: ...) -> ...:
                ...
    """
    from functools import wraps

    @wraps(func)
    async def wrapper(self, *args, **kwargs):
        if not self.auth.user or not self.auth.user.is_superuser:
            raise CustomException(msg="仅平台管理员可操作")
        return await func(self, *args, **kwargs)

    return wrapper
