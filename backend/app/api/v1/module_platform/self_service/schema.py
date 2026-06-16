"""租户自助服务 Schema"""
from pydantic import BaseModel, Field


class PackageAvailableItem(BaseModel):
    """可选套餐项"""
    id: int
    name: str
    price: int  # 分
    period: str  # month/year
    trial_days: int = 0
    max_users: int = 0
    max_roles: int = 0
    max_depts: int = 0
    max_storage_mb: int = 0
    description: str | None = None
    is_current: bool = False
    available_actions: list[str] = []  # [buy, renew, upgrade, downgrade]


class PackageAvailableOut(BaseModel):
    """可选套餐列表"""
    current_package_id: int | None = None
    packages: list[PackageAvailableItem]


class PackagePreviewQuery(BaseModel):
    """套餐变更预览请求"""
    target_package_id: int = Field(..., ge=1)


class PackagePreviewOut(BaseModel):
    """套餐变更预览结果"""
    current_package: str = ""
    target_package: str = ""
    action: str = ""  # upgrade/downgrade/buy/renew
    amount: int = 0  # 分
    period: str = ""
    gained_menus: list[dict] = []
    lost_menus: list[dict] = []
    affected_roles: list[str] = []
    affected_users: int = 0


class SelfOrderCreate(BaseModel):
    """自助订单创建"""
    package_id: int = Field(..., ge=1)
    order_type: str = Field(..., pattern="^(buy|renew|upgrade|downgrade)$")


class PluginPurchaseCreate(BaseModel):
    """插件购买"""
    plugin_id: int = Field(..., ge=1, description="插件ID")
    pay_method: str | None = Field(default=None, pattern=r"^(alipay|wxpay)?$")


# ─── 订单 ───


class SelfOrderOut(BaseModel):
    """自助订单创建结果"""
    order_id: int
    order_no: str
    amount: int
    need_pay: bool


class SelfOrderListItem(BaseModel):
    """我的订单列表项"""
    id: int
    order_no: str
    package_name: str = ""
    order_type: str
    amount: int
    status: int
    pay_method: str | None = None
    pay_time: str | None = None
    created_at: str | None = None


class SelfOrderListOut(BaseModel):
    """我的订单列表"""
    items: list[SelfOrderListItem]
    total: int
    page_no: int
    page_size: int


class SelfOrderDetailOut(BaseModel):
    """订单详情"""
    id: int
    order_no: str
    package_id: int | None = None
    package_name: str = ""
    amount: int
    order_type: str
    status: int
    pay_method: str | None = None
    pay_time: str | None = None
    created_at: str | None = None


# ─── 工作台 ───


class WorkspaceTenantInfo(BaseModel):
    """工作台-租户信息"""
    id: int
    name: str
    code: str
    status: int
    status_label: str
    start_time: str | None = None
    end_time: str | None = None
    days_remaining: int = 0


class WorkspacePackageInfo(BaseModel):
    """工作台-套餐信息"""
    id: int
    name: str
    price: int
    period: str
    max_users: int
    max_roles: int
    max_depts: int


class WorkspaceUsagePercent(BaseModel):
    """工作台-用量百分比"""
    users: float = 0
    roles: float = 0
    depts: float = 0


class WorkspaceQuotaInfo(BaseModel):
    """工作台-配额用量"""
    max_users: int = 0
    max_roles: int = 0
    max_depts: int = 0
    current_users: int = 0
    current_roles: int = 0
    current_depts: int = 0
    usage_percent: WorkspaceUsagePercent = Field(default_factory=WorkspaceUsagePercent)


class WorkspaceOrderItem(BaseModel):
    """工作台-近期订单项"""
    id: int
    order_no: str
    amount: int
    order_type: str
    status: int
    created_at: str | None = None


class WorkspaceOut(BaseModel):
    """工作台概览"""
    tenant: WorkspaceTenantInfo
    package: WorkspacePackageInfo | None = None
    quota: WorkspaceQuotaInfo
    recent_orders: list[WorkspaceOrderItem] = []
