from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, SmallInteger, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates

from app.common.enums import PermissionFilterStrategy
from app.core.base_model import MappedBase, ModelMixin


class TenantModel(ModelMixin):
    """
    租户模型

    - 系统租户(id=1)：平台管理，由超级管理员维护
    - 普通租户(id>1)：独立组织数据，通过业务表的 tenant_id 隔离
    """

    __tablename__: str = "sys_tenant"
    __table_args__: dict[str, str] = {"comment": "租户表"}
    __permission_strategy__: PermissionFilterStrategy = PermissionFilterStrategy.DATA_SCOPE

    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, comment="租户名称")
    code: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, comment="租户编码")
    contact_name: Mapped[str | None] = mapped_column(
        String(64), nullable=True, default=None, comment="联系人姓名"
    )
    contact_phone: Mapped[str | None] = mapped_column(
        String(20), nullable=True, default=None, comment="联系人电话"
    )
    contact_email: Mapped[str | None] = mapped_column(
        String(128), nullable=True, default=None, comment="联系人邮箱"
    )
    address: Mapped[str | None] = mapped_column(
        String(255), nullable=True, default=None, comment="地址"
    )
    domain: Mapped[str | None] = mapped_column(
        String(255), nullable=True, default=None, comment="域名"
    )
    logo_url: Mapped[str | None] = mapped_column(
        String(500), nullable=True, default=None, comment="Logo URL"
    )
    sort: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, comment="排序"
    )
    start_time: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True, default=None, comment="开始时间"
    )
    end_time: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True, default=None, comment="结束时间"
    )

    @validates("name")
    def validate_name(self, key: str, name: str) -> str:
        if not name or not name.strip():
            raise ValueError("名称不能为空")
        return name

    @validates("code")
    def validate_code(self, key: str, code: str) -> str:
        if not code or not code.strip():
            raise ValueError("编码不能为空")
        if not code.isalnum():
            raise ValueError("编码只能包含字母和数字")
        return code


class TenantUserModel(MappedBase):
    """
    用户-租户关联表

    支持一个用户关联多个租户（如顾问在多个租户间切换）。
    每个用户有一个默认租户（is_default=1），用于登录后的默认上下文。
    """

    __tablename__: str = "sys_user_tenant"
    __table_args__ = (
        UniqueConstraint("user_id", "tenant_id", name="uq_user_tenant"),
        {"comment": "用户租户关联表"},
    )

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="主键ID"
    )
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("sys_user.id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
        index=True,
        comment="用户ID",
    )
    tenant_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("sys_tenant.id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
        index=True,
        comment="租户ID",
    )
    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="member",
        comment="租户内角色(owner:拥有者 admin:管理员 member:成员)",
    )
    is_default: Mapped[int] = mapped_column(
        SmallInteger,
        nullable=False,
        default=0,
        comment="是否默认租户(0:否 1:是)",
    )
    create_time: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now,
        nullable=False,
        comment="创建时间",
    )


class TenantQuotaModel(MappedBase):
    """租户配额模型 — 限制租户资源使用上限"""

    __tablename__: str = "sys_tenant_quota"
    __table_args__: dict[str, str] = {"comment": "租户配额表"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, comment="主键ID")
    tenant_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("sys_tenant.id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
        comment="租户ID",
    )
    max_users: Mapped[int] = mapped_column(Integer, nullable=False, default=50, comment="最大用户数")
    max_roles: Mapped[int] = mapped_column(Integer, nullable=False, default=20, comment="最大角色数")
    max_storage_mb: Mapped[int] = mapped_column(Integer, nullable=False, default=500, comment="最大存储(MB)")
    max_depts: Mapped[int] = mapped_column(Integer, nullable=False, default=50, comment="最大部门数")

    tenant: Mapped["TenantModel"] = relationship("TenantModel", lazy="selectin")


class TenantConfigModel(MappedBase):
    """租户个性化配置模型 — 键值对存储"""

    __tablename__: str = "sys_tenant_config"
    __table_args__ = (
        UniqueConstraint("tenant_id", "config_key", name="uq_tenant_config_key"),
        {"comment": "租户配置表"},
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, comment="主键ID")
    tenant_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("sys_tenant.id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
        index=True,
        comment="租户ID",
    )
    config_key: Mapped[str] = mapped_column(String(100), nullable=False, comment="配置键")
    config_value: Mapped[str | None] = mapped_column(Text, nullable=True, comment="配置值")
    config_type: Mapped[str] = mapped_column(
        String(20), nullable=False, default="string", comment="配置类型(string/json/int/bool)"
    )


class TenantMenuModel(MappedBase):
    """租户菜单权限模型 — 控制租户可见的菜单项"""

    __tablename__: str = "sys_tenant_menu"
    __table_args__ = (
        UniqueConstraint("tenant_id", "menu_id", name="uq_tenant_menu"),
        {"comment": "租户菜单权限表"},
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, comment="主键ID")
    tenant_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("sys_tenant.id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
        index=True,
        comment="租户ID",
    )
    menu_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("sys_menu.id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False,
        index=True,
        comment="菜单ID",
    )
