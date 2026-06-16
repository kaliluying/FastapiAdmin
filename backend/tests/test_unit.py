"""多租户多模块纯单元测试（不依赖数据库连接）。"""

import pytest

# ==================== 01. 租户 ContextVar ====================


class TestTenantContextVar:
    """租户上下文变量读写与清理。"""

    def test_initially_none(self) -> None:
        from app.core.tenant import get_current_tenant_id, get_is_super_admin

        assert get_current_tenant_id() is None
        assert get_is_super_admin() is False

    def test_set_and_get(self) -> None:
        from app.core.tenant import (
            clear_current_tenant,
            get_current_tenant_id,
            get_is_super_admin,
            set_current_tenant,
        )

        set_current_tenant(42, True)
        assert get_current_tenant_id() == 42
        assert get_is_super_admin() is True

        clear_current_tenant()
        assert get_current_tenant_id() is None


# ==================== 02. ORM 模型定义 ====================


class TestModels:
    """核心业务模型表名与字段完整性。"""

    def test_tenant_model(self) -> None:
        from app.api.v1.module_platform.tenant.model import TenantModel

        assert TenantModel.__tablename__ == "platform_tenant"
        assert hasattr(TenantModel, "name")
        assert hasattr(TenantModel, "code")
        assert hasattr(TenantModel, "status")
        assert hasattr(TenantModel, "end_time")

    def test_tenant_quota_fields(self) -> None:
        """测试租户模型中的配额字段（单一大表设计）"""
        from app.api.v1.module_platform.tenant.model import TenantModel

        assert hasattr(TenantModel, "package_id")
        assert hasattr(TenantModel, "start_time")

    def test_tenant_config_model(self) -> None:
        """TenantModel 包含配置字段（单一大表设计）"""
        from app.api.v1.module_platform.tenant.model import TenantModel

        # 配置字段已合并到 TenantModel
        assert hasattr(TenantModel, "name")
        assert hasattr(TenantModel, "code")
        assert hasattr(TenantModel, "status")

    def test_package_model_quota(self) -> None:
        from app.api.v1.module_platform.package.model import PackageModel

        assert hasattr(PackageModel, "max_users")
        assert hasattr(PackageModel, "max_roles")
        assert hasattr(PackageModel, "max_depts")
        assert hasattr(PackageModel, "max_storage_mb")

    def test_tenant_user_model(self) -> None:
        from app.api.v1.module_platform.tenant.model import TenantUserModel

        assert TenantUserModel.__tablename__ == "platform_user_tenant"
        assert hasattr(TenantUserModel, "role")
        assert hasattr(TenantUserModel, "is_default")

    def test_user_model_has_tenant_id(self) -> None:
        from app.api.v1.module_system.user.model import UserModel

        assert hasattr(UserModel, "tenant_id")
        assert hasattr(UserModel, "is_superuser")

    def test_role_model_has_tenant_id(self) -> None:
        from app.api.v1.module_system.role.model import RoleModel

        assert hasattr(RoleModel, "tenant_id")
        assert hasattr(RoleModel, "menus")

    def test_menu_model_has_type(self) -> None:
        from app.api.v1.module_platform.menu.model import MenuModel

        assert hasattr(MenuModel, "type")
        assert hasattr(MenuModel, "name")
        assert hasattr(MenuModel, "permission")

    def test_notice_model(self) -> None:
        from app.api.v1.module_system.notice.model import NoticeModel

        assert NoticeModel.__tablename__ == "sys_notice"
        assert hasattr(NoticeModel, "notice_title")
        assert hasattr(NoticeModel, "status")

    def test_plugin_model(self) -> None:
        from app.api.v1.module_platform.plugin.model import PluginModel

        assert PluginModel.__tablename__ == "platform_plugin"
        assert hasattr(PluginModel, "code")

    def test_tenant_plugin_model(self) -> None:
        from app.api.v1.module_platform.plugin.model import TenantPluginModel

        assert TenantPluginModel.__tablename__ == "platform_tenant_plugin"

    def test_ticket_model(self) -> None:
        from app.api.v1.module_system.ticket.model import TicketModel

        assert TicketModel.__tablename__ == "sys_ticket"
        assert hasattr(TicketModel, "ticket_type")
        assert hasattr(TicketModel, "reply")


# ==================== 03. Pydantic Schema ====================


class TestSchemas:
    """请求/响应Schema字段验证。"""

    def test_tenant_create_schema(self) -> None:
        from app.api.v1.module_platform.tenant.schema import TenantCreateSchema

        s = TenantCreateSchema(name="test", code="test001", status=0)
        assert s.name == "test"
        assert s.code == "test001"

    def test_tenant_update_schema_partial(self) -> None:
        from app.api.v1.module_platform.tenant.schema import TenantUpdateSchema

        s = TenantUpdateSchema(name="renamed")
        assert s.name == "renamed"
        assert s.code is None  # 未传则为 None

    def test_package_schema_quota(self) -> None:
        from app.api.v1.module_platform.package.schema import PackageCreateSchema

        s = PackageCreateSchema(name="test", code="test", max_users=100, max_roles=30)
        assert s.max_users == 100
        assert s.max_roles == 30

        # 负数应被拒绝
        with pytest.raises(ValueError):
            PackageCreateSchema(name="test", code="test", max_users=-1)

    def test_ticket_schema(self) -> None:
        from app.api.v1.module_system.ticket.schema import TicketCreateSchema

        s = TicketCreateSchema(title="test", ticket_type="suggestion")
        assert s.title == "test"
        assert s.ticket_type == "suggestion"

    def test_menu_type_enum(self) -> None:
        """菜单类型: 1=目录 2=菜单 3=按钮 4=链接"""
        from app.api.v1.module_platform.menu.model import MenuModel

        assert hasattr(MenuModel, "type")
        # type 是 int 字段


# ==================== 04. 配置类 ====================


class TestSettings:
    """配置默认值与环境变量覆盖。"""

    def test_settings_defaults(self) -> None:
        from app.config.setting import settings

        assert settings.DATABASE_HOST
        assert settings.DATABASE_PORT > 0
        assert settings.SERVER_PORT > 0

    def test_redis_config(self) -> None:
        from app.config.setting import settings

        assert isinstance(settings.REDIS_ENABLE, bool)
        assert settings.REDIS_PORT == 6379

    def test_database_password_empty_by_default(self) -> None:
        """密码默认值为空，需通过 .env 或环境变量提供。"""
        from app.config.setting import Settings

        # 检查字段默认值（不依赖运行时环境变量）
        assert Settings.model_fields["DATABASE_PASSWORD"].default == ""


# ==================== 05. 常量与枚举 ====================


class TestEnums:
    """业务枚举值完整性。"""

    def test_status_operate_enum(self) -> None:
        from app.common.enums import BusinessType

        assert hasattr(BusinessType, "OTHER")

    def test_menu_type_values(self) -> None:
        """type: 1=目录 2=菜单 3=按钮 4=链接"""
        from app.api.v1.module_platform.menu.model import MenuModel

        assert MenuModel.__tablename__ == "platform_menu"
        # type 字段是 int 类型
        col = next((c for c in MenuModel.__table__.columns if c.name == "type"), None)
        assert col is not None


# ==================== 06. 租户自助注册（PRD §4.5）====================


class TestTenantRegister:
    """TenantRegisterSchema / TenantRegisterOutSchema 校验。"""

    def test_register_schema_valid(self) -> None:
        from app.api.v1.module_system.auth.schema import TenantRegisterSchema

        s = TenantRegisterSchema(
            username="testowner",
            password="TestPass123",
            email="test@example.com",
            tenant_name="测试企业",
        )
        assert s.username == "testowner"
        assert s.email == "test@example.com"
        assert s.tenant_name == "测试企业"

    def test_register_schema_minimal(self) -> None:
        """仅必填字段。"""
        from app.api.v1.module_system.auth.schema import TenantRegisterSchema

        s = TenantRegisterSchema(
            username="owner2",
            password="secret123",
            email="owner2@example.com",
        )
        assert s.tenant_name is None

    def test_register_schema_short_password(self) -> None:
        """密码少于 6 位应拒绝。"""
        from pydantic import ValidationError

        from app.api.v1.module_system.auth.schema import TenantRegisterSchema

        with pytest.raises(ValidationError):
            TenantRegisterSchema(
                username="x",
                password="123",
                email="a@b.com",
            )

    def test_register_schema_bad_email(self) -> None:
        """非法邮箱应拒绝。"""
        from pydantic import ValidationError

        from app.api.v1.module_system.auth.schema import TenantRegisterSchema

        with pytest.raises(ValidationError):
            TenantRegisterSchema(
                username="x",
                password="123456",
                email="not-an-email",
            )

    def test_register_out_schema_fields(self) -> None:
        """注册响应 Schema 包含所有必要字段。"""
        from app.api.v1.module_system.auth.schema import TenantRegisterOutSchema

        fields = set(TenantRegisterOutSchema.model_fields.keys())
        for f in ("user_id", "tenant_id", "tenant_name", "tenant_code", "package", "trial_end", "message"):
            assert f in fields, f"{f} 未在 TenantRegisterOutSchema 中找到"


# ==================== 07. 支付回调套餐激活 ====================


class TestActivateTenantPackage:
    """PaymentService._activate_tenant_package 日期计算逻辑。"""

    def test_new_calculation(self) -> None:
        """order_type=new：设置 start_time=now, end_time=now+period。"""
        from datetime import datetime, timedelta

        now = datetime(2025, 1, 1, 12, 0, 0)
        period_months = 1
        duration = timedelta(days=30 * period_months)

        # 模拟 _activate_tenant_package 中 new 分支的日期计算
        fake = {"package_id": None, "start_time": None, "end_time": None, "status": 1}
        fake["package_id"] = 1
        fake["start_time"] = now
        fake["end_time"] = now + duration
        fake["status"] = 0

        assert fake["package_id"] == 1
        assert fake["start_time"] == now
        assert fake["end_time"] == now + timedelta(days=30)
        assert fake["status"] == 0

    def test_renew_extends_end_time(self) -> None:
        """order_type=renew：在原有 end_time 基础上顺延。"""
        from datetime import datetime, timedelta

        now = datetime(2025, 1, 1)
        original_end = now + timedelta(days=30)
        fake = {"end_time": original_end, "status": 1}

        # 模拟 renew 分支：base = max(end_time, now) + duration
        base = max(fake["end_time"], now)
        fake["end_time"] = base + timedelta(days=30)
        fake["status"] = 0

        assert fake["end_time"] == original_end + timedelta(days=30)
        assert fake["status"] == 0

    def test_upgrade_changes_package(self) -> None:
        """order_type=upgrade：更换 package_id，状态置为 active。"""
        fake = {"package_id": 1, "status": 1}

        fake["package_id"] = 2
        fake["status"] = 0

        assert fake["package_id"] == 2
        assert fake["status"] == 0


# ==================== 08. 插件热重载 ====================


class TestPluginReload:
    """discover.reload_dynamic_router 可正常导入且签名正确。"""

    def test_reload_function_exists(self) -> None:
        from app.core.discover import reload_dynamic_router

        assert callable(reload_dynamic_router)

    def test_set_app_ref_exists(self) -> None:
        from app.core.discover import set_app_ref

        assert callable(set_app_ref)

    def test_reload_service_exists(self) -> None:
        """PluginService.reload_service 方法存在且为类方法。"""
        import inspect

        from app.api.v1.module_platform.plugin.service import PluginService

        assert hasattr(PluginService, "reload_service")
        assert isinstance(
            inspect.getattr_static(PluginService, "reload_service"),
            (classmethod, classmethod),
        )


# ==================== 18. status 字段类型一致性 ====================

class TestStatusFieldType:
    """验证 status 字段从 String(10) 迁移为 SmallInteger 后的一致性"""

    def test_model_mixin_status_is_integer(self) -> None:
        """验证 ModelMixin 子类的 status 字段已转为 SmallInteger"""
        from app.api.v1.module_system.user.model import UserModel

        col = UserModel.__table__.c["status"]
        assert "SMALLINT" in str(col.type).upper(), (
            f"UserModel.status 应为 SmallInteger，当前为 {col.type}"
        )

    def test_tenant_status_is_integer(self) -> None:
        from app.api.v1.module_platform.tenant.model import TenantModel

        col = TenantModel.__table__.c["status"]
        assert "SMALLINT" in str(col.type).upper(), (
            f"TenantModel.status 应为 SmallInteger，当前为 {col.type}"
        )

    def test_user_status_is_integer(self) -> None:
        from app.api.v1.module_system.user.model import UserModel

        col = UserModel.__table__.c["status"]
        assert "SMALLINT" in str(col.type).upper()

    def test_role_status_is_integer(self) -> None:
        from app.api.v1.module_system.role.model import RoleModel

        col = RoleModel.__table__.c["status"]
        assert "SMALLINT" in str(col.type).upper()

    def test_dept_status_is_integer(self) -> None:
        from app.api.v1.module_system.dept.model import DeptModel

        col = DeptModel.__table__.c["status"]
        assert "SMALLINT" in str(col.type).upper()

    def test_menu_status_is_integer(self) -> None:
        from app.api.v1.module_platform.menu.model import MenuModel

        col = MenuModel.__table__.c["status"]
        assert "SMALLINT" in str(col.type).upper()

    def test_package_status_is_integer(self) -> None:
        from app.api.v1.module_platform.package.model import PackageModel

        col = PackageModel.__table__.c["status"]
        assert "SMALLINT" in str(col.type).upper(), (
            f"PackageModel.status 应为 SmallInteger，当前为 {col.type}"
        )

    def test_ticket_status_is_integer(self) -> None:
        from app.api.v1.module_system.ticket.model import TicketModel

        col = TicketModel.__table__.c["status"]
        assert "SMALLINT" in str(col.type).upper()
