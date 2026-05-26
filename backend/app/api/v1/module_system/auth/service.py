import json
import time
import uuid
from datetime import datetime, timedelta
from typing import NewType

from fastapi import Request
from redis.asyncio.client import Redis
from sqlalchemy.ext.asyncio import AsyncSession
from user_agents import parse

from app.api.v1.module_monitor.online.schema import OnlineOutSchema
from app.api.v1.module_system.user.crud import UserCRUD
from app.api.v1.module_system.user.model import UserModel
from app.common.enums import RedisInitKeyConfig
from app.config.setting import settings
from app.core.exceptions import CustomException
from app.core.logger import log
from app.core.redis_crud import RedisCURD
from app.core.security import (
    CustomOAuth2PasswordRequestForm,
    create_access_token,
    decode_access_token,
)
from app.utils.captcha_util import CaptchaUtil
from app.utils.common_util import get_random_character
from app.utils.hash_bcrpy_util import PwdUtil
from app.utils.ip_local_util import IpLocalUtil

from .schema import (
    AuthSchema,
    AutoLoginTokenSchema,
    AutoLoginUserSchema,
    CaptchaOutSchema,
    JWTOutSchema,
    JWTPayloadSchema,
    LoginWithTenantsSchema,
    LogoutPayloadSchema,
    RefreshTokenPayloadSchema,
    SelectTenantOutSchema,
    TenantOptionSchema,
)

CaptchaKey = NewType("CaptchaKey", str)
CaptchaBase64 = NewType("CaptchaBase64", str)


class LoginService:
    """登录认证服务"""

    @classmethod
    async def authenticate_user_service(
        cls,
        request: Request,
        redis: Redis,
        login_form: CustomOAuth2PasswordRequestForm,
        db: AsyncSession,
    ) -> LoginWithTenantsSchema:
        """
        用户认证

        参数:
        - request (Request): FastAPI请求对象
        - login_form (CustomOAuth2PasswordRequestForm): 登录表单数据
        - db (AsyncSession): 数据库会话对象

        返回:
        - LoginWithTenantsSchema: 包含令牌和租户列表的响应模型

        异常:
        - CustomException: 认证失败时抛出异常。
        """
        _t = time.time()

        # 判断是否来自API文档
        referer = request.headers.get("referer", "")
        request_from_docs = referer.endswith(("docs", "redoc"))

        # 验证码校验
        if settings.CAPTCHA_ENABLE and not request_from_docs:
            if not login_form.captcha_key or not login_form.captcha:
                raise CustomException(msg="验证码不能为空")
            await CaptchaService.check_captcha_service(
                redis=redis,
                key=login_form.captcha_key,
                captcha=login_form.captcha,
            )
        log.info(f"[登录计时] 验证码校验: {round((time.time() - _t) * 1000, 1)}ms"); _t2 = time.time()

        # 用户认证
        auth = AuthSchema(db=db)
        user = await UserCRUD(auth).get_by_username_crud(username=login_form.username)
        log.info(f"[登录计时] 数据库查询用户: {round((time.time() - _t2) * 1000, 1)}ms"); _t3 = time.time()

        if not user:
            raise CustomException(msg="用户不存在")

        if not PwdUtil.verify_password(
            plain_password=login_form.password, password_hash=user.password
        ):
            raise CustomException(msg="账号或密码错误")
        log.info(f"[登录计时] Bcrypt密码校验: {round((time.time() - _t3) * 1000, 1)}ms"); _t4 = time.time()

        if user.status == "1":
            raise CustomException(msg="用户已被停用")

        # 更新最后登录时间
        user = await UserCRUD(auth).update_last_login_crud(id=user.id)
        log.info(f"[登录计时] 更新登录时间: {round((time.time() - _t4) * 1000, 1)}ms"); _t5 = time.time()

        if not user:
            raise CustomException(msg="用户不存在")
        if not login_form.login_type:
            raise CustomException(msg="登录类型不能为空")

        # 创建token
        token = await cls.create_token_service(
            request=request,
            redis=redis,
            user=user,
            login_type=login_form.login_type,
        )
        log.info(f"[登录计时] 创建Token(含IP解析+Redis写入+在线记录): {round((time.time() - _t5) * 1000, 1)}ms")

        log.info(f"[登录计时] ⭐ 登录总耗时: {round((time.time() - _t) * 1000, 1)}ms")

        # 查询用户关联的租户列表
        _tt = time.time()
        tenants = await cls.get_user_tenants_service(
            auth=AuthSchema(db=db, tenant_id=user.tenant_id, check_data_scope=False),
            db=db,
            user_id=user.id,
        )
        log.info(f"[登录计时] 查询租户列表: {round((time.time() - _tt) * 1000, 1)}ms")

        user_info = {
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "avatar": user.avatar,
            "is_super_admin": user.is_superuser,
        }

        return LoginWithTenantsSchema(
            access_token=token.access_token,
            refresh_token=token.refresh_token,
            expires_in=token.expires_in,
            token_type=token.token_type,
            tenants=tenants,
            user_info=user_info,
        )

    @classmethod
    async def create_token_service(
        cls, request: Request, redis: Redis, user: UserModel, login_type: str
    ) -> JWTOutSchema:
        """
        创建访问令牌和刷新令牌

        参数:
        - request (Request): FastAPI请求对象
        - redis (Redis): Redis客户端对象
        - user (UserModel): 用户模型对象
        - login_type (str): 登录类型

        返回:
        - JWTOutSchema: 包含访问令牌和刷新令牌的响应模型

        异常:
        - CustomException: 创建令牌失败时抛出异常。
        """
        # 生成会话编号
        session_id = str(uuid.uuid4())
        request.scope["session_id"] = session_id

        user_agent = parse(request.headers.get("user-agent"))
        request_ip = None
        x_forwarded_for = request.headers.get("X-Forwarded-For")
        if x_forwarded_for:
            # 取第一个 IP 地址，通常为客户端真实 IP
            request_ip = x_forwarded_for.split(",")[0].strip()
        else:
            # 若没有 X-Forwarded-For 头，则使用 request.client.host
            request_ip = request.client.host if request.client else "127.0.0.1"

        login_location = await IpLocalUtil.resolve_location_for_log(request_ip)
        request.scope["login_location"] = login_location

        # 确保在请求上下文中设置用户名和会话ID
        request.scope["user_username"] = user.username

        access_expires = timedelta(seconds=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        refresh_expires = timedelta(seconds=settings.REFRESH_TOKEN_EXPIRE_MINUTES)

        now = datetime.now()

        # 记录租户信息到日志
        log.info(f"用户ID: {user.id}, 用户名: {user.username} 正在生成JWT令牌")

        # 生成会话信息
        session_info = OnlineOutSchema(
            session_id=session_id,
            user_id=user.id,
            tenant_id=user.tenant_id,
            is_super_admin=user.is_superuser,
            name=user.name,
            user_name=user.username,
            ipaddr=request_ip,
            login_location=login_location,
            os=user_agent.os.family,
            browser=user_agent.browser.family,
            login_time=user.last_login,
            login_type=login_type,
        ).model_dump_json()

        access_token = create_access_token(
            payload=JWTPayloadSchema(
                sub=session_info,
                is_refresh=False,
                exp=now + access_expires,
            )
        )
        refresh_token = create_access_token(
            payload=JWTPayloadSchema(
                sub=session_info,
                is_refresh=True,
                exp=now + refresh_expires,
            )
        )

        # 设置新的token
        await RedisCURD(redis).set(
            key=f"{RedisInitKeyConfig.ACCESS_TOKEN.key}:{session_id}",
            value=access_token,
            expire=int(access_expires.total_seconds()),
        )

        await RedisCURD(redis).set(
            key=f"{RedisInitKeyConfig.REFRESH_TOKEN.key}:{session_id}",
            value=refresh_token,
            expire=int(refresh_expires.total_seconds()),
        )

        return JWTOutSchema(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=int(access_expires.total_seconds()),
            token_type=settings.TOKEN_TYPE,
        )

    @classmethod
    async def refresh_token_service(
        cls,
        db: AsyncSession,
        redis: Redis,
        request: Request,
        refresh_token: RefreshTokenPayloadSchema,
    ) -> JWTOutSchema:
        """
        刷新访问令牌

        参数:
        - db (AsyncSession): 数据库会话对象
        - redis (Redis): Redis客户端对象
        - request (Request): FastAPI请求对象
        - refresh_token (RefreshTokenPayloadSchema): 刷新令牌数据

        返回:
        - JWTOutSchema: 新的令牌对象

        异常:
        - CustomException: 刷新令牌无效时抛出异常
        """
        token_payload: JWTPayloadSchema = decode_access_token(token=refresh_token.refresh_token)
        if not token_payload.is_refresh:
            raise CustomException(msg="非法凭证，请传入刷新令牌")

        # 去 Redis 查完整信息
        session_info = json.loads(token_payload.sub)
        session_id = session_info.get("session_id")
        user_id = session_info.get("user_id")

        if not session_id or not user_id:
            raise CustomException(msg="非法凭证,无法获取会话编号或用户ID")

        # 用户认证
        auth = AuthSchema(db=db)
        user = await UserCRUD(auth).get_by_id_crud(id=user_id)
        if not user:
            raise CustomException(msg="刷新token失败，用户不存在")

        # 记录刷新令牌时的租户信息
        log.info(f"用户ID: {user.id}, 用户名: {user.username} 正在刷新JWT令牌")

        # 设置新的 token
        access_expires = timedelta(seconds=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        refresh_expires = timedelta(seconds=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
        now = datetime.now()

        session_info_json = session_info if isinstance(session_info, str) else json.dumps(session_info)

        access_token = create_access_token(
            payload=JWTPayloadSchema(
                sub=session_info_json,
                is_refresh=False,
                exp=now + access_expires,
            )
        )

        refresh_token_new = create_access_token(
            payload=JWTPayloadSchema(
                sub=session_info_json,
                is_refresh=True,
                exp=now + refresh_expires,
            )
        )

        # 覆盖写入 Redis
        await RedisCURD(redis).set(
            key=f"{RedisInitKeyConfig.ACCESS_TOKEN.key}:{session_id}",
            value=access_token,
            expire=int(access_expires.total_seconds()),
        )

        await RedisCURD(redis).set(
            key=f"{RedisInitKeyConfig.REFRESH_TOKEN.key}:{session_id}",
            value=refresh_token_new,
            expire=int(refresh_expires.total_seconds()),
        )

        return JWTOutSchema(
            access_token=access_token,
            refresh_token=refresh_token_new,
            token_type=settings.TOKEN_TYPE,
            expires_in=int(access_expires.total_seconds()),
        )

    @classmethod
    async def logout_service(cls, redis: Redis, token: LogoutPayloadSchema) -> bool:
        """
        退出登录

        参数:
        - redis (Redis): Redis客户端对象
        - token (LogoutPayloadSchema): 退出登录令牌数据

        返回:
        - bool: 退出成功返回True

        异常:
        - CustomException: 令牌无效时抛出异常
        """
        payload: JWTPayloadSchema = decode_access_token(token=token.token)
        session_info = json.loads(payload.sub)
        session_id = session_info.get("session_id")

        if not session_id:
            raise CustomException(msg="非法凭证,无法获取会话编号")

        # 删除Redis中的在线用户、访问令牌、刷新令牌
        await RedisCURD(redis).delete(f"{RedisInitKeyConfig.ACCESS_TOKEN.key}:{session_id}")
        await RedisCURD(redis).delete(f"{RedisInitKeyConfig.REFRESH_TOKEN.key}:{session_id}")

        log.info(f"用户退出登录成功,会话编号:{session_id}")

        return True

    @classmethod
    async def get_user_tenants_service(
        cls,
        auth: AuthSchema,
        db: AsyncSession,
        user_id: int | None = None,
    ) -> list[TenantOptionSchema]:
        """
        获取用户关联的租户列表

        参数:
        - auth (AuthSchema): 认证信息对象
        - db (AsyncSession): 数据库会话对象
        - user_id (int | None): 用户ID，未传入时从 auth.user 获取

        返回:
        - list[TenantOptionSchema]: 租户选项列表
        """
        from sqlalchemy import select

        from app.api.v1.module_system.tenant.model import TenantModel, TenantUserModel

        uid = user_id or (auth.user.id if auth.user else None)
        if not uid:
            return []

        # 超管可以看到所有租户
        if auth.user and auth.user.is_superuser:
            stmt = (
                select(TenantModel)
                .where(TenantModel.status == "0", TenantModel.is_deleted == 0)
                .order_by(TenantModel.sort, TenantModel.id)
            )
            result = await db.execute(stmt)
            tenant_objs = result.scalars().all()
            return [
                TenantOptionSchema(id=t.id, name=t.name, code=t.code)
                for t in tenant_objs
            ]

        # 普通用户通过 sys_user_tenant 关联表查询
        stmt = (
            select(TenantModel)
            .join(TenantUserModel, TenantUserModel.tenant_id == TenantModel.id)
            .where(
                TenantUserModel.user_id == uid,
                TenantModel.status == "0",
                TenantModel.is_deleted == 0,
            )
            .order_by(TenantUserModel.is_default.desc(), TenantModel.sort, TenantModel.id)
        )
        result = await db.execute(stmt)
        tenant_objs = result.scalars().all()
        return [
            TenantOptionSchema(id=t.id, name=t.name, code=t.code)
            for t in tenant_objs
        ]

    @classmethod
    async def select_tenant_service(
        cls,
        request: Request,
        redis: Redis,
        auth: AuthSchema,
        tenant_id: int,
    ) -> SelectTenantOutSchema:
        """
        选择租户：验证用户归属并签发含租户上下文的新 JWT Token

        参数:
        - request (Request): FastAPI请求对象
        - redis (Redis): Redis客户端对象
        - auth (AuthSchema): 当前认证信息
        - tenant_id (int): 目标租户ID

        返回:
        - SelectTenantOutSchema: 包含新令牌的响应

        异常:
        - CustomException: 用户不属于该租户时抛出
        """
        from sqlalchemy import select

        from app.api.v1.module_system.tenant.model import TenantModel, TenantUserModel

        if not auth.user:
            raise CustomException(msg="未认证用户")

        # 超管可以选择任意租户
        if not auth.user.is_superuser:
            # 验证用户是否属于该租户
            exist_stmt = (
                select(TenantUserModel)
                .where(
                    TenantUserModel.user_id == auth.user.id,
                    TenantUserModel.tenant_id == tenant_id,
                )
                .limit(1)
            )
            result = await auth.db.execute(exist_stmt)
            if not result.scalar_one_or_none():
                raise CustomException(msg="您不属于该租户，无法切换")

        # 验证租户是否存在且状态正常
        tenant_stmt = (
            select(TenantModel)
            .where(TenantModel.id == tenant_id, TenantModel.status == "0")
            .limit(1)
        )
        result = await auth.db.execute(tenant_stmt)
        tenant = result.scalar_one_or_none()
        if not tenant:
            raise CustomException(msg="租户不存在或已被禁用")

        # 获取当前会话信息
        token = request.headers.get("Authorization", "").removeprefix("Bearer ").strip()
        if not token:
            raise CustomException(msg="无法获取当前Token")

        from app.core.security import decode_access_token

        payload = decode_access_token(token)
        session_info = json.loads(payload.sub)
        session_id = session_info.get("session_id")

        if not session_id:
            raise CustomException(msg="会话已失效")

        # 更新会话信息中的 tenant_id
        session_info["tenant_id"] = tenant_id

        # 签发新的 access_token（含新的 tenant_id）
        from app.core.security import create_access_token

        access_expires = timedelta(seconds=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        now = datetime.now()

        new_access_token = create_access_token(
            payload=JWTPayloadSchema(
                sub=json.dumps(session_info),
                is_refresh=False,
                exp=now + access_expires,
            )
        )

        # 覆盖 Redis 中的 access_token
        from app.core.redis_crud import RedisCURD

        await RedisCURD(redis).set(
            key=f"{RedisInitKeyConfig.ACCESS_TOKEN.key}:{session_id}",
            value=new_access_token,
            expire=int(access_expires.total_seconds()),
        )

        # 同时更新租户上下文
        from app.core.tenant import set_current_tenant

        set_current_tenant(tenant_id, auth.user.is_superuser)

        log.info(
            f"用户 {auth.user.username}(id={auth.user.id}) 切换到租户 "
            f"{tenant.name}(id={tenant_id})"
        )

        return SelectTenantOutSchema(
            access_token=new_access_token,
            token_type=settings.TOKEN_TYPE,
            expires_in=int(access_expires.total_seconds()),
        )


class CaptchaService:
    """验证码服务"""

    @classmethod
    async def get_captcha_service(cls, redis: Redis) -> dict[str, CaptchaKey | CaptchaBase64]:
        """
        获取验证码

        参数:
        - redis (Redis): Redis客户端对象

        返回:
        - dict[str, CaptchaKey | CaptchaBase64]: 包含验证码key和base64图片的字典

        异常:
        - CustomException: 验证码服务未启用时抛出异常
        """
        if not settings.CAPTCHA_ENABLE:
            raise CustomException(msg="未开启验证码服务")

        # 生成验证码图片和值
        captcha_base64, captcha_value = CaptchaUtil.captcha_arithmetic()
        captcha_key = get_random_character()

        # 保存到Redis并设置过期时间
        redis_key = f"{RedisInitKeyConfig.CAPTCHA_CODES.key}:{captcha_key}"
        await RedisCURD(redis).set(
            key=redis_key,
            value=captcha_value,
            expire=settings.CAPTCHA_EXPIRE_SECONDS,
        )

        log.info(f"生成验证码成功,验证码:{captcha_value}")

        # 返回验证码信息
        return CaptchaOutSchema(
            enable=settings.CAPTCHA_ENABLE,
            key=CaptchaKey(captcha_key),
            img_base=CaptchaBase64(f"data:image/png;base64,{captcha_base64}"),
        ).model_dump()

    @classmethod
    async def check_captcha_service(cls, redis: Redis, key: str, captcha: str) -> bool:
        """
        校验验证码

        参数:
        - redis (Redis): Redis客户端对象
        - key (str): 验证码key
        - captcha (str): 用户输入的验证码

        返回:
        - bool: 验证通过返回True

        异常:
        - CustomException: 验证码无效或错误时抛出异常
        """
        if not captcha:
            raise CustomException(msg="验证码不能为空")

        # 获取Redis中存储的验证码
        redis_key = f"{RedisInitKeyConfig.CAPTCHA_CODES.key}:{key}"

        captcha_value = await RedisCURD(redis).get(redis_key)
        if not captcha_value:
            log.error("验证码已过期或不存在")
            raise CustomException(msg="验证码已过期")

        # 验证码不区分大小写比对
        if captcha.lower() != captcha_value.lower():
            log.error(f"验证码错误,用户输入:{captcha},正确值:{captcha_value}")
            raise CustomException(msg="验证码错误")

        # 验证成功后删除验证码,避免重复使用
        await RedisCURD(redis).delete(redis_key)
        log.info(f"验证码校验成功,key:{key}")
        return True


class AutoLoginService:
    """免登录服务"""

    # 免登录Token前缀
    AUTO_LOGIN_PREFIX = "fastapiadmin:auto_login:"
    # Token有效期(秒) - 5分钟
    TOKEN_EXPIRE = 300

    @classmethod
    async def get_auto_login_users_service(
        cls, db: AsyncSession, tenant_id: int | None = None
    ) -> list[AutoLoginUserSchema]:
        """
        获取免登录用户列表

        参数:
        - db (AsyncSession): 数据库会话对象
        - tenant_id (int | None): 租户ID,非超管时必传以限制租户范围

        返回:
        - list[AutoLoginUserSchema]: 用户列表
        """
        from sqlalchemy import select

        from app.api.v1.module_system.user.model import UserModel

        stmt = select(UserModel).where(UserModel.status == "0")
        if tenant_id is not None:
            stmt = stmt.where(UserModel.tenant_id == tenant_id)
        stmt = stmt.order_by(UserModel.id)
        result = await db.execute(stmt)
        users = result.scalars().all()

        return [
            AutoLoginUserSchema(
                id=user.id,
                username=user.username,
                name=user.name,
                avatar=user.avatar,
            )
            for user in users
        ]

    @classmethod
    async def create_auto_login_token_service(
        cls,
        redis: Redis,
        db: AsyncSession,
        user_id: int,
        tenant_id: int | None = None,
    ) -> AutoLoginTokenSchema:
        """
        创建免登录Token

        参数:
        - request (Request): FastAPI请求对象
        - redis (Redis): Redis客户端对象
        - db (AsyncSession): 数据库会话对象
        - user_id (int): 用户ID
        - tenant_id (int | None): 租户ID,非超管时必传以防止跨租户操作

        返回:
        - AutoLoginTokenSchema: 免登录Token和用户信息

        异常:
        - CustomException: 用户不存在或已停用时抛出异常
        """
        from sqlalchemy import select

        from app.api.v1.module_system.user.model import UserModel

        stmt = select(UserModel).where(UserModel.id == user_id)
        if tenant_id is not None:
            stmt = stmt.where(UserModel.tenant_id == tenant_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            raise CustomException(msg="用户不存在")

        if user.status == "1":
            raise CustomException(msg="用户已被停用")

        # 生成免登录Token
        import uuid

        token = str(uuid.uuid4())
        token_key = f"{cls.AUTO_LOGIN_PREFIX}{token}"

        # 存储到Redis，设置5分钟过期
        token_data = {
            "user_id": user.id,
            "username": user.username,
            "tenant_id": user.tenant_id,
            "created_at": datetime.now().isoformat(),
        }
        await RedisCURD(redis).set(
            key=token_key,
            value=json.dumps(token_data),
            expire=cls.TOKEN_EXPIRE,
        )

        log.info(f"创建免登录Token成功,用户:{user.username}")

        return AutoLoginTokenSchema(
            token=token,
            user=AutoLoginUserSchema(
                id=user.id,
                username=user.username,
                name=user.name,
                avatar=user.avatar,
            ),
        )

    @classmethod
    async def auto_login_service(
        cls,
        request: Request,
        redis: Redis,
        db: AsyncSession,
        token: str,
        tenant_id: int | None = None,
    ) -> JWTOutSchema:
        """
        免登录

        参数:
        - request (Request): FastAPI请求对象
        - redis (Redis): Redis客户端对象
        - db (AsyncSession): 数据库会话对象
        - token (str): 免登录Token
        - tenant_id (int | None): 租户ID,非超管时必传以防止跨租户登录

        返回:
        - JWTOutSchema: JWT令牌信息

        异常:
        - CustomException: Token无效或过期时抛出异常
        """
        from sqlalchemy import select

        from app.api.v1.module_system.user.model import UserModel

        token_key = f"{cls.AUTO_LOGIN_PREFIX}{token}"
        token_data_str = await RedisCURD(redis).get(token_key)

        if not token_data_str:
            raise CustomException(msg="免登录Token已过期或无效")

        token_data = json.loads(token_data_str)
        user_id = token_data.get("user_id")
        token_tenant_id = token_data.get("tenant_id")

        stmt = select(UserModel).where(UserModel.id == user_id)
        effective_tenant_id = tenant_id if tenant_id is not None else token_tenant_id
        if effective_tenant_id is not None:
            stmt = stmt.where(UserModel.tenant_id == effective_tenant_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            raise CustomException(msg="用户不存在")

        if user.status == "1":
            raise CustomException(msg="用户已被停用")

        # 删除已使用的Token
        await RedisCURD(redis).delete(token_key)

        # 使用LoginService创建token
        jwt_token = await LoginService.create_token_service(
            request=request, redis=redis, user=user, login_type="PC端"
        )

        log.info(f"用户{user.username}免登录成功")

        return jwt_token
