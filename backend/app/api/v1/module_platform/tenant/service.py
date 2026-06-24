
import json
import random
import string

import sqlalchemy as sa
from redis.asyncio.client import Redis

from app.common.enums import RedisInitKeyConfig
from app.core.base_schema import AuthSchema, BatchSetAvailable
from app.core.dependencies import require_superadmin
from app.core.exceptions import CustomException
from app.core.logger import logger
from app.core.redis_crud import RedisCURD
from app.utils.hash_bcrpy_util import PwdUtil

from .crud import TenantCRUD
from .model import TenantModel, TenantUserModel
from .schema import (
    TenantConfigOutSchema,
    TenantCreateSchema,
    TenantOutSchema,
    TenantQueryParam,
    TenantUpdateSchema,
    TenantUserAddSchema,
    TenantUserOutSchema,
)


class TenantService:
    """
    租户管理服务（查询操作租户可见，写操作仅超级管理员可操作）

    设计：实例方法承载「当前用户上下文 (auth)」，``redis`` 仍是方法参数。
    内部跨方法调用从 ``cls.xxx(auth, ...)`` 改为 ``self.xxx(...)``。
    后台维护方法与静态工具方法保持 ``@staticmethod``（无 auth）。
    """

    def __init__(self, auth: AuthSchema) -> None:
        self.auth = auth

    async def detail(self, id: int) -> TenantOutSchema:
        """
        租户详情

        参数:
        - id (int): 租户ID

        返回:
        - TenantOutSchema: 租户详情
        """
        return await TenantCRUD(self.auth).get_or_404(id=id, out_schema=TenantOutSchema)

    async def page(
        self,
        page_no: int,
        page_size: int,
        search: TenantQueryParam | None = None,
        order_by: list[dict[str, str]] | None = None,
    ) -> dict:
        return await TenantCRUD(self.auth).page(
            offset=(page_no - 1) * page_size,
            limit=page_size,
            order_by=order_by or [{"id": "asc"}],
            search=vars(search) if search else None,
            out_schema=TenantOutSchema,
        )

    @require_superadmin
    async def create(self, data: TenantCreateSchema) -> TenantOutSchema:
        if await TenantCRUD(self.auth).get(name=data.name):
            raise CustomException(msg="创建失败，名称已存在")
        if await TenantCRUD(self.auth).get(code=data.code):
            raise CustomException(msg="创建失败，编码已存在")

        tenant_obj = await TenantCRUD(self.auth).create(data=data)
        if not tenant_obj:
            raise CustomException(msg="创建租户失败")

        # 创建租户初始管理员
        # 1. 生成初始管理员用户名
        # 2. 检查用户名是否已存在
        # 3. 创建初始管理员用户
        username = f"{tenant_obj.code}_admin"
        from app.api.v1.module_system.user.crud import UserCRUD

        if await UserCRUD(self.auth).get(username=username):
            raise CustomException(msg=f"初始管理员用户名已存在: {username}，请更换租户编码后重试")

        password_length = 12
        characters = string.ascii_letters + string.digits + "!@#$%^&*"
        password = "".join(random.choice(characters) for _ in range(password_length))
        admin_data = {
            "username": username,
            "password": PwdUtil.hash_password(password=password),
            "name": f"{tenant_obj.name}管理员",
            "tenant_id": tenant_obj.id,
            "status": 0,
            "is_superuser": False,
        }
        try:
            user_obj = await UserCRUD(self.auth).create(data=admin_data)
            if not user_obj:
                raise CustomException(msg="创建租户初始管理员失败")
        except CustomException:
            raise
        except Exception as e:
            logger.error(f"为租户[{tenant_obj.name}]创建初始管理员失败: {e!s}")
            raise CustomException(msg="创建租户初始管理员失败") from e

        logger.info(f"为租户[{tenant_obj.name}]创建初始管理员成功，用户名: {username}，临时密码: {password}")

        await self.auth.db.refresh(tenant_obj)
        result = TenantOutSchema.model_validate(tenant_obj)

        return result

    @require_superadmin
    async def update(self, id: int, data: TenantUpdateSchema) -> TenantOutSchema:
        """
        更新租户

        参数:
        - id (int): 租户ID
        - data (TenantUpdateSchema): 租户更新模型

        返回:
        - TenantOutSchema: 租户详情
        """
        obj = await TenantCRUD(self.auth).get_or_404(id=id)

        if id == 1:
            if data.code is not None and data.code != obj.code:
                raise CustomException(msg="系统租户编码不可修改")
            if data.status is not None and data.status == 1:
                raise CustomException(msg="系统租户不允许禁用")

        if data.name is not None:
            exist = await TenantCRUD(self.auth).get(name=data.name)
            if exist and exist.id != id:
                raise CustomException(msg="更新失败，名称重复")
        if data.code is not None:
            exist = await TenantCRUD(self.auth).get(code=data.code)
            if exist and exist.id != id:
                raise CustomException(msg="更新失败，编码重复")

        updated = await TenantCRUD(self.auth).update(id=id, data=data)
        if not updated:
            raise CustomException(msg="更新失败")

        result = TenantOutSchema.model_validate(updated)
        return result

    @require_superadmin
    async def delete(self, ids: list[int]) -> None:
        """
        批量删除租户（含级联资源检查：用户/部门/角色/岗位）

        参数:
        - ids (list[int]): 租户ID列表

        返回:
        - None
        """
        if not ids:
            raise CustomException(msg="删除失败，删除对象不能为空")
        if 1 in ids:
            raise CustomException(msg="系统租户不允许删除")
        from app.api.v1.module_system.dept.crud import DeptCRUD
        from app.api.v1.module_system.position.crud import PositionCRUD
        from app.api.v1.module_system.role.crud import RoleCRUD
        from app.api.v1.module_system.user.crud import UserCRUD

        for tid in ids:
            reasons: list[str] = []
            if await UserCRUD(self.auth).get_list(search={"tenant_id": tid}):
                reasons.append("用户")
            if await DeptCRUD(self.auth).get_list(search={"tenant_id": tid}):
                reasons.append("部门")
            if await RoleCRUD(self.auth).get_list(search={"tenant_id": tid}):
                reasons.append("角色")
            if await PositionCRUD(self.auth).get_list(search={"tenant_id": tid}):
                reasons.append("岗位")
            if reasons:
                raise CustomException(msg=f"租户下已存在{'/'.join(reasons)}，操作失败")

        await TenantCRUD(self.auth).delete(ids=ids)

    async def set_available(self, data: BatchSetAvailable) -> None:
        """
        批量设置租户状态

        参数:
        - data (BatchSetAvailable): 批量状态设置

        返回:
        - None
        """
        if data.status == 1 and 1 in data.ids:
            raise CustomException(msg="系统租户不允许禁用")
        await TenantCRUD(self.auth).set(ids=data.ids, status=data.status)

    async def toggle_status(self, id: int) -> None:
        """
        切换单个租户的启用/禁用状态

        参数:
        - id (int): 租户ID

        返回:
        - None
        """
        obj = await TenantCRUD(self.auth).get_or_404(id=id)
        if id == 1:
            raise CustomException(msg="系统租户不允许禁用")
        new_status = 0 if obj.status == 1 else 1
        await TenantCRUD(self.auth).set(ids=[id], status=new_status)

    async def get_tenant_users(self, tenant_id: int) -> list[TenantUserOutSchema]:
        """获取租户下的用户列表"""
        from sqlalchemy import select

        from app.api.v1.module_system.user.model import UserModel

        stmt = (
            select(TenantUserModel, UserModel)
            .join(UserModel, UserModel.id == TenantUserModel.user_id)
            .where(TenantUserModel.tenant_id == tenant_id)
            .order_by(TenantUserModel.is_default.desc(), TenantUserModel.id)
        )
        result = await self.auth.db.execute(stmt)
        rows = result.all()

        users = []
        for tu, u in rows:
            users.append(
                TenantUserOutSchema(
                    id=tu.id,
                    user_id=tu.user_id,
                    tenant_id=tu.tenant_id,
                    role=tu.role,
                    is_default=tu.is_default,
                    create_time=tu.create_time,
                    username=u.username,
                    name=u.name,
                )
            )
        return users

    async def add_tenant_user(self, tenant_id: int, data: TenantUserAddSchema) -> None:
        """
        向租户添加用户

        参数:
        - tenant_id (int): 租户ID
        - data (TenantUserAddSchema): 用户添加参数

        返回:
        - None
        """
        # 验证租户存在
        tenant = await TenantCRUD(self.auth).get(id=tenant_id)
        if not tenant:
            raise CustomException(msg="该数据不存在")

        # 验证用户存在
        from app.api.v1.module_system.user.crud import UserCRUD

        user = await UserCRUD(self.auth).get(id=data.user_id)
        if not user:
            raise CustomException(msg="该数据不存在")

        # 检查是否已关联
        from sqlalchemy import select

        exist_stmt = (
            select(TenantUserModel)
            .where(
                TenantUserModel.user_id == data.user_id,
                TenantUserModel.tenant_id == tenant_id,
            )
            .limit(1)
        )
        result = await self.auth.db.execute(exist_stmt)
        if result.scalar_one_or_none():
            raise CustomException(msg="该用户已关联此租户")

        # 如果设为默认租户，先取消其他默认
        if data.is_default == 1:
            await self.auth.db.execute(
                sa.update(TenantUserModel).where(TenantUserModel.user_id == data.user_id).values(is_default=0)
            )
        elif data.is_default == 0:
            # 检查是否是该用户的第一个租户关联
            count_result = await self.auth.db.execute(
                select(sa.func.count()).select_from(TenantUserModel).where(TenantUserModel.user_id == data.user_id)
            )
            count = count_result.scalar()
            if count == 0:
                # 第一个租户自动设为默认
                data.is_default = 1

        from datetime import datetime

        tu = TenantUserModel(
            user_id=data.user_id,
            tenant_id=tenant_id,
            role=data.role,
            is_default=data.is_default,
            create_time=datetime.now(),
        )
        self.auth.db.add(tu)
        await self.auth.db.flush()

        logger.info(f"向租户[{tenant.name}]添加用户[{user.username}]成功, role={data.role}")

    async def remove_tenant_user(self, tenant_id: int, user_id: int) -> None:
        """
        从租户移除用户

        参数:
        - tenant_id (int): 租户ID
        - user_id (int): 用户ID

        返回:
        - None
        """
        from sqlalchemy import select

        # 查找关联记录
        exist_stmt = (
            select(TenantUserModel)
            .where(
                TenantUserModel.user_id == user_id,
                TenantUserModel.tenant_id == tenant_id,
            )
            .limit(1)
        )
        result = await self.auth.db.execute(exist_stmt)
        tu = result.scalar_one_or_none()
        if not tu:
            raise CustomException(msg="该用户未关联此租户")

        # 不允许移除租户最后一个 owner
        if tu.role == "owner":
            count_result = await self.auth.db.execute(
                select(sa.func.count())
                .select_from(TenantUserModel)
                .where(
                    TenantUserModel.tenant_id == tenant_id,
                    TenantUserModel.role == "owner",
                )
            )
            owner_count = count_result.scalar()
            if owner_count <= 1:
                raise CustomException(msg="租户至少需要保留一个拥有者(owner)")

        await self.auth.db.delete(tu)
        await self.auth.db.flush()

        logger.info(f"从租户[{tenant_id}]移除用户[{user_id}]成功")

    async def get_quota(self, tenant_id: int) -> dict:
        """
        获取租户配额（套餐模块已删除，返回无限配额）

        参数:
        - tenant_id (int): 租户ID

        返回:
        - dict: 配额信息
        """
        tenant = await TenantCRUD(self.auth).get(id=tenant_id)
        if not tenant:
            raise CustomException(msg="该数据不存在")

        return {
            "tenant_id": tenant.id,
            "max_users": 999999,
            "max_roles": 999999,
            "max_storage_mb": 999999,
            "max_depts": 999999,
            "package_name": "无限制",
        }

    async def check_quota(self, tenant_id: int, resource_type: str) -> None:
        """检查租户配额（套餐模块已删除，跳过所有配额检查）"""
        return

    async def get_config(self, tenant_id: int) -> dict:
        """
        获取租户所有配置（从租户主表读取，返回原始 dict 供内部使用）

        参数:
        - tenant_id (int): 租户ID

        返回:
        - dict: 配置字典
        """
        tenant = await TenantCRUD(self.auth).get(id=tenant_id)
        if not tenant:
            raise CustomException(msg="该数据不存在")

        config_fields = [
            "name", "description", "version", "logo_url", "favicon",
            "login_bg", "copyright", "keep_record", "help_doc", "privacy",
            "clause", "git_code",
        ]
        config = {field: getattr(tenant, field, None) for field in config_fields}
        return config

    async def get_config_items(self, tenant_id: int) -> list[TenantConfigOutSchema]:
        """获取租户所有配置（对外接口，返回结构化列表）"""
        config = await self.get_config(tenant_id)
        return [TenantConfigOutSchema(config_key=k, config_value=str(v) if v is not None else None) for k, v in config.items()]

    @staticmethod
    async def get_config_cache(redis: Redis, tenant_id: int) -> dict:
        """
        从 Redis 缓存获取租户配置，缓存未命中则从 DB 加载并回写缓存

        参数:
        - redis (Redis): Redis 客户端实例
        - tenant_id (int): 租户ID

        返回:
        - dict: 租户配置字典
        """
        redis_key = f"{RedisInitKeyConfig.TENANT_CONFIG.key}:{tenant_id}"
        redis_config = await RedisCURD(redis).get(key=redis_key)

        if redis_config:
            try:
                return json.loads(redis_config)
            except Exception as e:
                logger.error(f"解析租户配置数据失败: {e}")

        logger.info(f"Redis 中没有租户[{tenant_id}]配置数据，从数据库中加载")
        from app.core.database import async_db_session

        async with async_db_session() as session:
            async with session.begin():
                from app.core.base_schema import AuthSchema as _AuthSchema

                _auth = _AuthSchema(db=session, check_data_scope=False)
                svc = TenantService(_auth)
                config = await svc.get_config(tenant_id)
                await TenantService._sync_configs_to_redis(redis, tenant_id, config)
                logger.info("✅ 已从数据库加载租户配置到缓存")

        return config

    @staticmethod
    async def get_config_cache_items(redis: Redis, tenant_id: int) -> list[TenantConfigOutSchema]:
        """获取租户缓存配置（对外接口，返回结构化列表）"""
        config = await TenantService.get_config_cache(redis, tenant_id)
        return [TenantConfigOutSchema(config_key=k, config_value=str(v) if v is not None else None) for k, v in config.items()]

    @staticmethod
    async def _sync_configs_to_redis(redis: Redis, tenant_id: int, config: dict) -> None:
        """将租户配置写入 Redis 缓存"""
        redis_key = f"{RedisInitKeyConfig.TENANT_CONFIG.key}:{tenant_id}"
        value = json.dumps(config, ensure_ascii=False)
        await RedisCURD(redis).set(key=redis_key, value=value, expire=None)

    @staticmethod
    async def _del_configs_from_redis(redis: Redis, tenant_id: int) -> None:
        """删除租户配置的 Redis 缓存"""
        redis_key = f"{RedisInitKeyConfig.TENANT_CONFIG.key}:{tenant_id}"
        await RedisCURD(redis).delete(redis_key)

    async def update_config(self, redis: Redis, tenant_id: int, config: dict) -> list[TenantConfigOutSchema]:
        """
        更新租户配置（同步 Redis 缓存）

        参数:
        - redis (Redis): Redis 客户端
        - tenant_id (int): 租户ID
        - config (dict): 配置字典

        返回:
        - list[TenantConfigOutSchema]: 更新后的配置项列表
        """
        tenant = await TenantCRUD(self.auth).get(id=tenant_id)
        if not tenant:
            raise CustomException(msg="该数据不存在")

        config_fields = [
            "name", "description", "version", "logo_url", "favicon",
            "login_bg", "copyright", "keep_record", "help_doc", "privacy",
            "clause", "git_code",
        ]

        for field in config_fields:
            if field in config:
                setattr(tenant, field, config[field])

        await self.auth.db.flush()

        # 刷新 DB 数据并同步到 Redis
        new_config = await self.get_config(tenant_id)
        await TenantService._sync_configs_to_redis(redis, tenant_id, new_config)
        logger.info(f"租户[{tenant_id}]配置已更新")
        return [TenantConfigOutSchema(config_key=k, config_value=str(v) if v is not None else None) for k, v in new_config.items()]

    @staticmethod
    async def init_cache(redis: Redis) -> None:
        """
        初始化所有租户配置到 Redis 缓存（应用启动时调用）。

        参数:
        - redis (Redis): Redis 客户端实例

        返回:
        - None
        """
        from sqlalchemy import select

        from app.core.database import async_db_session

        async with async_db_session() as session:
            async with session.begin():
                stmt = select(TenantModel)
                result = await session.execute(stmt)
                tenants = result.scalars().all()

                for tenant in tenants:
                    config_fields = [
                        "name", "description", "version", "logo_url", "favicon",
                        "login_bg", "copyright", "keep_record", "help_doc", "privacy",
                        "clause", "git_code",
                    ]
                    config = {field: getattr(tenant, field, None) for field in config_fields}

                    await TenantService._sync_configs_to_redis(redis, tenant.id, config)
                    logger.info(f"✅ 租户[{tenant.name}](id={tenant.id}) 配置已缓存到 Redis")

    async def renew(self, tenant_id: int, end_time: str) -> TenantOutSchema:
        """租户续期：延长 end_time 并恢复为 active 状态

        仅 active(0)/grace(1)/suspended(2) 状态可续期。
        expired(4)/frozen(3)/archived(5) 不可续期。

        参数:
        - tenant_id (int): 租户ID
        - end_time (str): 新的结束时间

        返回:
        - dict: 更新后的租户信息
        """
        from datetime import datetime

        tenant = await TenantCRUD(self.auth).get(id=tenant_id)
        if not tenant:
            raise CustomException(msg="该数据不存在")

        if tenant.status not in (0, 1, 2):
            status_labels = {0: "正常", 1: "宽限期", 2: "暂停", 3: "冻结", 4: "过期", 5: "归档"}
            current_label = status_labels.get(str(tenant.status), str(tenant.status))
            raise CustomException(msg=f"当前租户状态为「{current_label}」，仅正常/宽限期/暂停状态可续期")

        new_end = datetime.fromisoformat(end_time) if isinstance(end_time, str) else end_time
        if new_end <= datetime.now():
            raise CustomException(msg="续期结束时间必须晚于当前时间")

        tenant.end_time = new_end
        tenant.status = 0
        tenant.grace_start_time = None

        await self.auth.db.flush()
        logger.info(f"租户[{tenant.name}]续期成功, 新的结束时间: {end_time}")

        return TenantOutSchema.model_validate(tenant)

    @staticmethod
    async def check_tenant_expiry() -> None:
        """后台维护：多阶段租户到期自动处理

        PRD §9 到期阶段：
          grace(1)   → 到期后第 1-7 天，仅提醒
          suspended(2) → 到期后第 8-14 天，禁用登录
          frozen(3)     → 到期后第 15-30 天，只读模式
          expired(4)    → 第 31 天起，归档候选
        """
        from datetime import datetime

        from sqlalchemy import text

        from app.core.database import async_db_session

        now = datetime.now()

        async with async_db_session() as session:
            # 获取所有已过期的活跃租户（status=0）
            rows = await session.execute(
                text(
                    "SELECT id, name, contact_email, contact_name, end_time, status "
                    "FROM platform_tenant WHERE status = '0' AND end_time IS NOT NULL AND end_time < :now"
                ),
                {"now": now},
            )
            expired_tenants = rows.fetchall()

            for t in expired_tenants:
                tenant_id, tenant_name, email, contact_name, end_time, cur_status = t
                days_past = (now - end_time).days if end_time else 0

                if days_past <= 7:
                    new_status, label = 1, "宽限期"
                elif days_past <= 14:
                    new_status, label = 2, "已停用"
                elif days_past <= 30:
                    new_status, label = 3, "已冻结"
                else:
                    new_status, label = 4, "已过期"

                if new_status == cur_status:
                    continue

                await session.execute(
                    text("UPDATE platform_tenant SET status = :s WHERE id = :tid"),
                    {"s": new_status, "tid": tenant_id},
                )
                logger.info(f"租户状态切换: id={tenant_id} name={tenant_name} status={cur_status}→{new_status} ({label})")

                # 发送通知邮件
                if email:
                    await TenantService._send_expiry_email(
                        tenant_name, contact_name, email, end_time, days_past, label
                    )

            await session.commit()

        logger.info(f"到期检查完成，处理了 {len(expired_tenants)} 个过期租户")

    @staticmethod
    async def send_grace_reminders() -> None:
        """后台维护：向宽限期租户发送续费提醒邮件（每天 09:00）"""
        from datetime import datetime

        from sqlalchemy import text

        from app.core.database import async_db_session

        async with async_db_session() as session:
            rows = await session.execute(
                text(
                    "SELECT id, name, contact_email, contact_name, end_time FROM platform_tenant "
                    "WHERE status = '1' AND contact_email IS NOT NULL AND contact_email != ''"
                )
            )
            grace_tenants = rows.fetchall()

            sent = 0
            for t in grace_tenants:
                tenant_id, name, email, contact_name, end_time = t
                days_past = (datetime.now() - end_time).days if end_time else 0

                try:
                    ok = await TenantService._send_renew_email(name, contact_name, email, days_past)
                    if ok:
                        sent += 1
                except Exception as e:
                    logger.warning(f"续费提醒邮件发送失败: tenant_id={tenant_id}, err={e}")

            logger.info(f"续费提醒完成，共发送 {sent}/{len(grace_tenants)} 封邮件")

    @staticmethod
    async def clean_expired_tenants() -> None:
        """后台维护：将过期超 90 天租户归档，清理旧审计日志（每月 1 号 02:00）"""
        from datetime import datetime, timedelta

        from sqlalchemy import text

        from app.core.database import async_db_session

        cutoff = datetime.now() - timedelta(days=90)

        async with async_db_session() as session:
            # 归档过期租户
            result = await session.execute(
                text("SELECT COUNT(*) FROM platform_tenant WHERE status = '4' AND end_time < :cutoff"),
                {"cutoff": cutoff},
            )
            count = result.scalar() or 0
            if count > 0:
                await session.execute(
                    text("UPDATE platform_tenant SET status = '5' WHERE status = '4' AND end_time < :cutoff"),
                    {"cutoff": cutoff},
                )
                await session.commit()
                logger.info(f"已将 {count} 个过期超过 90 天的租户标记为归档")

            await session.commit()

    @staticmethod
    async def _send_expiry_email(
        tenant_name: str,
        contact_name: str | None,
        email: str,
        end_time: object,
        days_past: int,
        label: str,
    ) -> None:
        """发送租户状态变更通知邮件"""
        from app.config.setting import settings
        from app.utils.email_util import render_template, send_email

        if not settings.SMTP_HOST:
            return

        smtp_config = {
            "host": settings.SMTP_HOST,
            "port": settings.SMTP_PORT,
            "username": settings.SMTP_USER,
            "password": settings.SMTP_PASSWORD,
            "from_addr": settings.SMTP_FROM,
            "starttls": settings.SMTP_TLS,
            "ssl_tls": settings.SMTP_SSL,
        }
        end_str = end_time.strftime("%Y-%m-%d") if hasattr(end_time, "strftime") else str(end_time)

        try:
            html_body = await render_template(
                "email/tenant_expiry_notice.html",
                tenant_name=tenant_name,
                contact_name=contact_name or "管理员",
                days_expired=days_past,
                status_name=label,
                end_time=end_str,
                site_url=getattr(settings, "SITE_URL", ""),
            )
            await send_email(
                smtp_config=smtp_config,
                recipients=[email],
                subject=f"【重要】租户 {tenant_name} 服务状态变更通知",
                body=html_body,
                html=True,
            )
        except Exception as e:
            logger.warning(f"到期通知邮件发送失败: tenant={tenant_name}, err={e}")

    @staticmethod
    async def _send_renew_email(name: str, contact_name: str | None, email: str, days_past: int) -> bool:
        """发送续费提醒邮件"""
        from app.config.setting import settings
        from app.utils.email_util import render_template, send_email

        if not settings.SMTP_HOST:
            return False

        smtp_config = {
            "host": settings.SMTP_HOST,
            "port": settings.SMTP_PORT,
            "username": settings.SMTP_USER,
            "password": settings.SMTP_PASSWORD,
            "from_addr": settings.SMTP_FROM,
            "starttls": settings.SMTP_TLS,
            "ssl_tls": settings.SMTP_SSL,
        }

        html_body = await render_template(
            "email/tenant_renew_reminder.html",
            tenant_name=name,
            contact_name=contact_name or "管理员",
            days_expired=days_past,
            renew_url=f"{getattr(settings, 'SITE_URL', '')}/tenant/order/create",
        )
        return await send_email(
            smtp_config=smtp_config,
            recipients=[email],
            subject=f"【续费提醒】租户 {name} 服务即将到期",
            body=html_body,
            html=True,
        )
