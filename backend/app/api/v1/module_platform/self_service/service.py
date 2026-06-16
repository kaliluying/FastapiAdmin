"""租户自助服务 Service"""
from datetime import datetime, timedelta

from sqlalchemy import func, select

from app.api.v1.module_platform.menu.model import MenuModel
from app.api.v1.module_platform.package.model import PackageMenuModel, PackageModel
from app.api.v1.module_platform.tenant.model import TenantModel
from app.api.v1.module_system.role.model import RoleModel
from app.core.base_schema import AuthSchema
from app.core.exceptions import CustomException
from app.core.logger import logger

from .schema import (
    PackageAvailableItem,
    PackageAvailableOut,
    PackagePreviewOut,
    PluginPurchaseCreate,
    SelfOrderCreate,
    SelfOrderDetailOut,
    SelfOrderListItem,
    SelfOrderListOut,
    SelfOrderOut,
    WorkspaceOrderItem,
    WorkspaceOut,
    WorkspacePackageInfo,
    WorkspaceQuotaInfo,
    WorkspaceTenantInfo,
    WorkspaceUsagePercent,
)


async def get_available_packages(auth: AuthSchema, tenant_id: int) -> PackageAvailableOut:
    """获取可选套餐列表"""
    tenant = await auth.db.get(TenantModel, tenant_id)
    current_pkg_id = tenant.package_id if tenant else None

    # 一次性获取当前套餐价格（可能未启用，不在后续结果中）
    current_price: int | None = None
    if current_pkg_id:
        cp = await auth.db.get(PackageModel, current_pkg_id)
        current_price = cp.price if cp else 0

    stmt = select(PackageModel).where(PackageModel.status == 0).order_by(PackageModel.price)
    result = await auth.db.execute(stmt)
    packages = result.scalars().all()

    items: list[PackageAvailableItem] = []
    for pkg in packages:
        is_current = pkg.id == current_pkg_id
        actions: list[str] = []
        if is_current:
            actions = ["renew"]
        elif current_pkg_id is None:
            actions = ["buy"]
        elif current_price is not None:
            actions = ["upgrade"] if pkg.price > current_price else ["downgrade"]

        items.append(PackageAvailableItem(
            id=pkg.id,
            name=pkg.name,
            price=pkg.price,
            period=pkg.period,
            trial_days=pkg.trial_days,
            max_users=pkg.max_users,
            max_roles=pkg.max_roles,
            max_depts=pkg.max_depts,
            max_storage_mb=pkg.max_storage_mb,
            description=pkg.description,
            is_current=is_current,
            available_actions=actions,
        ))

    return PackageAvailableOut(
        current_package_id=current_pkg_id,
        packages=items,
    )


async def preview_package_change(
    auth: AuthSchema, tenant_id: int, target_package_id: int
) -> PackagePreviewOut:
    """套餐变更影响预览"""
    tenant = await auth.db.get(TenantModel, tenant_id)
    current_pkg_id = tenant.package_id if tenant else None

    target_pkg = await auth.db.get(PackageModel, target_package_id)
    if not target_pkg:
        raise CustomException(msg="目标套餐不存在")

    current_pkg = None
    if current_pkg_id:
        current_pkg = await auth.db.get(PackageModel, current_pkg_id)

    # 获取当前套餐的菜单
    current_menus = set()
    if current_pkg_id:
        cm_stmt = select(MenuModel).join(
            PackageMenuModel, MenuModel.id == PackageMenuModel.menu_id
        ).where(PackageMenuModel.package_id == current_pkg_id)
        result = await auth.db.execute(cm_stmt)
        current_menus = {m.id for m in result.scalars().all()}

    # 获取目标套餐的菜单
    tm_stmt = select(MenuModel).join(
        PackageMenuModel, MenuModel.id == PackageMenuModel.menu_id
    ).where(PackageMenuModel.package_id == target_package_id)
    result = await auth.db.execute(tm_stmt)
    target_menus = {m.id for m in result.scalars().all()}

    # 计算差异
    gained_menus, lost_menus = [], []
    if current_menus:
        lost_ids = current_menus - target_menus
        if lost_ids:
            lost_stmt = select(MenuModel).where(MenuModel.id.in_(lost_ids))
            lost = await auth.db.execute(lost_stmt)
            lost_menus = [{"id": m.id, "name": m.name, "path": m.route_path} for m in lost.scalars().all()]

    gained_ids = target_menus - (current_menus or set())
    if gained_ids:
        gain_stmt = select(MenuModel).where(MenuModel.id.in_(gained_ids))
        gained = await auth.db.execute(gain_stmt)
        gained_menus = [{"id": m.id, "name": m.name, "path": m.route_path} for m in gained.scalars().all()]

    # 确定操作类型
    if current_pkg_id is None:
        action = "buy"
    elif current_pkg and target_pkg.price > current_pkg.price:
        action = "upgrade"
    elif current_pkg and target_pkg.price < current_pkg.price:
        action = "downgrade"
    else:
        action = "renew"

    # 受影响角色
    affected_roles = []
    if current_pkg_id:
        role_stmt = select(RoleModel).where(RoleModel.tenant_id == tenant_id)
        r_result = await auth.db.execute(role_stmt)
        affected_roles = [r.name for r in r_result.scalars().all()]

    return PackagePreviewOut(
        current_package=current_pkg.name if current_pkg else "",
        target_package=target_pkg.name,
        action=action,
        amount=target_pkg.price if hasattr(target_pkg, "price") else 0,
        period=target_pkg.period if hasattr(target_pkg, "period") else "month",
        gained_menus=gained_menus,
        lost_menus=lost_menus,
        affected_roles=affected_roles,
        affected_users=0,
    )


async def create_self_order(
    auth: AuthSchema, tenant_id: int, data: SelfOrderCreate
) -> SelfOrderOut:
    """创建自助订单"""
    tenant = await auth.db.get(TenantModel, tenant_id)
    if not tenant:
        raise CustomException(msg="租户不存在")
    if tenant.status not in (0, 1, 2):
        raise CustomException(msg="租户状态不允许操作")

    pkg = await auth.db.get(PackageModel, data.package_id)
    if not pkg or pkg.status == 1:
        raise CustomException(msg="套餐不可用")

    amount = pkg.price if hasattr(pkg, "price") else 0

    from app.api.v1.module_platform.order.crud import OrderCRUD
    from app.api.v1.module_platform.order.schema import (
        OrderCreateInternalSchema,
        OrderUpdateInternalSchema,
    )
    from app.api.v1.module_platform.order.service import _generate_order_no

    order = await OrderCRUD(auth).create(
        OrderCreateInternalSchema(
            order_no=_generate_order_no(),
            tenant_id=tenant_id,
            package_id=data.package_id,
            order_type=data.order_type,
            amount=amount,
            expire_time=datetime.now() + timedelta(minutes=15),
        )
    )
    await auth.db.flush()

    # 免费订单自动激活
    if amount == 0:
        await OrderCRUD(auth).update(
            order.id,
            OrderUpdateInternalSchema(status=1, pay_method="free", pay_time=datetime.now()),
        )
        from app.api.v1.module_platform.order.service import PaymentService
        await PaymentService._activate_tenant_package(auth, order)

    logger.info(f"自助订单创建: order_no={order.order_no} tenant={tenant_id} amount={amount}")
    return SelfOrderOut(
        order_id=order.id,
        order_no=order.order_no,
        amount=amount,
        need_pay=amount > 0,
    )


async def create_plugin_purchase_order(
    auth: AuthSchema, tenant_id: int, data: PluginPurchaseCreate
) -> SelfOrderOut:
    """创建插件购买订单（复用套餐订单流程）"""
    from app.api.v1.module_platform.order.schema import OrderCreateSchema
    from app.api.v1.module_platform.order.service import OrderService
    from app.api.v1.module_platform.plugin.model import PluginModel, TenantPluginModel

    # 校验插件存在且可用
    plugin = await auth.db.get(PluginModel, data.plugin_id)
    if not plugin or plugin.status == 1:
        raise CustomException(msg="插件不可用")

    if getattr(plugin, "price", 0) == 0:
        raise CustomException(msg="免费插件可直接安装，无需购买")

    # 校验未重复购买
    existing = await auth.db.execute(
        select(TenantPluginModel).where(
            TenantPluginModel.tenant_id == tenant_id,
            TenantPluginModel.plugin_id == data.plugin_id,
        ).limit(1)
    )
    tp = existing.scalar_one_or_none()
    if tp and tp.purchased == "1":
        raise CustomException(msg="您已购买此插件，可直接安装")

    order_data = OrderCreateSchema(
        tenant_id=tenant_id,
        package_id=None,
        plugin_id=data.plugin_id,
        order_type="plugin",
        pay_method=data.pay_method,
    )
    result = await OrderService.create_order(auth, order_data)

    logger.info(f"插件购买订单创建: order_no={result.order_no} plugin={plugin.name}")
    return SelfOrderOut(
        order_id=result.id,
        order_no=result.order_no,
        amount=result.amount,
        need_pay=result.amount > 0,
    )


async def get_self_order_list(
    auth: AuthSchema,
    tenant_id: int,
    page_no: int = 1,
    page_size: int = 20,
    order_by: list[dict] | None = None,
) -> SelfOrderListOut:
    """我的订单列表"""
    from sqlalchemy import func as sa_func

    from app.api.v1.module_platform.order.model import OrderModel

    stmt = (
        select(OrderModel)
        .where(OrderModel.tenant_id == tenant_id)
        .order_by(OrderModel.created_time.desc())
        .offset((page_no - 1) * page_size)
        .limit(page_size)
    )
    result = await auth.db.execute(stmt)
    orders = result.scalars().all()

    # 查总数
    total = (
        await auth.db.execute(
            select(sa_func.count(OrderModel.id)).where(OrderModel.tenant_id == tenant_id)
        )
    ).scalar() or 0

    # 批量查询关联套餐，避免 N+1
    package_ids = [o.package_id for o in orders if o.package_id]
    pkg_map: dict[int, str] = {}
    if package_ids:
        pkg_result = await auth.db.execute(
            select(PackageModel.id, PackageModel.name).where(PackageModel.id.in_(package_ids))
        )
        pkg_map = {row[0]: row[1] for row in pkg_result.all()}

    items = []
    for o in orders:
        pkg_name = pkg_map.get(o.package_id, "") if o.package_id else ""
        items.append(SelfOrderListItem(
            id=o.id,
            order_no=o.order_no,
            package_name=pkg_name,
            order_type=o.order_type,
            amount=o.amount,
            status=o.status,
            pay_method=o.pay_method,
            pay_time=o.pay_time.isoformat() if o.pay_time else None,
            created_at=o.created_time.isoformat() if o.created_time else None,
        ))

    return SelfOrderListOut(
        items=items,
        total=total,
        page_no=page_no,
        page_size=page_size,
    )


async def get_self_order_detail(
    auth: AuthSchema, tenant_id: int, order_id: int
) -> SelfOrderDetailOut:
    """订单详情"""
    from app.api.v1.module_platform.order.model import OrderModel

    stmt = select(OrderModel).where(
        OrderModel.id == order_id,
        OrderModel.tenant_id == tenant_id,
    )
    result = await auth.db.execute(stmt)
    order = result.scalar_one_or_none()
    if not order:
        raise CustomException(msg="订单不存在")

    pkg_name = ""
    if order.package_id:
        p = await auth.db.get(PackageModel, order.package_id)
        if p:
            pkg_name = p.name

    return SelfOrderDetailOut(
        id=order.id,
        order_no=order.order_no,
        package_id=order.package_id,
        package_name=pkg_name,
        amount=order.amount,
        order_type=order.order_type,
        status=order.status,
        pay_method=order.pay_method,
        pay_time=order.pay_time.isoformat() if order.pay_time else None,
        created_at=order.created_time.isoformat() if order.created_time else None,
    )


async def get_workspace_data(auth: AuthSchema, tenant_id: int) -> WorkspaceOut:
    """获取租户工作台概览数据

    聚合返回：租户信息、当前套餐、配额用量、近期订单。
    """
    from app.api.v1.module_platform.package.model import PackageModel
    from app.api.v1.module_platform.tenant.model import TenantModel
    from app.api.v1.module_system.dept.model import DeptModel
    from app.api.v1.module_system.role.model import RoleModel
    from app.api.v1.module_system.user.model import UserModel

    tenant = await auth.db.get(TenantModel, tenant_id)
    if not tenant:
        return WorkspaceOut(
            tenant=WorkspaceTenantInfo(id=0, name="", code="", status=0, status_label="未知"),
            quota=WorkspaceQuotaInfo(),
        )

    # ── 套餐 ──
    package = None
    if tenant.package_id:
        package = await auth.db.get(PackageModel, tenant.package_id)

    # ── 用量计数 ──
    async def _count(model_cls) -> int:
        stmt = select(func.count()).select_from(model_cls).where(
            model_cls.tenant_id == tenant_id,
            model_cls.is_deleted == False,
        )
        return (await auth.db.execute(stmt)).scalar() or 0

    user_count = await _count(UserModel)
    role_count = await _count(RoleModel)
    dept_count = await _count(DeptModel)

    # ── 到期状态 ──
    now = datetime.now()
    days_remaining = (tenant.end_time - now).days if tenant.end_time else 0

    status_labels = {
        "0": "正常",
        "1": "宽限期",
        "2": "已暂停",
        "3": "已冻结",
        "4": "已过期",
        "5": "已归档",
    }

    # ── 近期订单 ──
    from app.api.v1.module_platform.order.model import OrderModel

    orders_stmt = (
        select(OrderModel)
        .where(OrderModel.tenant_id == tenant_id)
        .order_by(OrderModel.created_time.desc())
        .limit(5)
    )
    orders_result = await auth.db.execute(orders_stmt)
    recent_orders = []
    for o in orders_result.scalars().all():
        recent_orders.append(WorkspaceOrderItem(
            id=o.id,
            order_no=o.order_no,
            amount=o.amount,
            order_type=o.order_type,
            status=o.status,
            created_at=o.created_time.isoformat() if o.created_time else None,
        ))

    return WorkspaceOut(
        tenant=WorkspaceTenantInfo(
            id=tenant.id,
            name=tenant.name,
            code=tenant.code,
            status=tenant.status,
            status_label=status_labels.get(str(tenant.status), "未知"),
            start_time=tenant.start_time.isoformat() if tenant.start_time else None,
            end_time=tenant.end_time.isoformat() if tenant.end_time else None,
            days_remaining=max(days_remaining, 0),
        ),
        package=WorkspacePackageInfo(
            id=package.id,
            name=package.name,
            price=package.price,
            period=package.period,
            max_users=package.max_users,
            max_roles=package.max_roles,
            max_depts=package.max_depts,
        ) if package else None,
        quota=WorkspaceQuotaInfo(
            max_users=package.max_users if package else 0,
            max_roles=package.max_roles if package else 0,
            max_depts=package.max_depts if package else 0,
            current_users=user_count,
            current_roles=role_count,
            current_depts=dept_count,
            usage_percent=WorkspaceUsagePercent(
                users=round(user_count / package.max_users * 100, 1) if package and package.max_users > 0 else 0,
                roles=round(role_count / package.max_roles * 100, 1) if package and package.max_roles > 0 else 0,
                depts=round(dept_count / package.max_depts * 100, 1) if package and package.max_depts > 0 else 0,
            ),
        ),
        recent_orders=recent_orders,
    )


async def get_tenant_api_usage_today(auth: AuthSchema, tenant_id: int) -> dict:
    """获取租户当日 API 用量汇总（已移除 api_usage 模块）"""
    return {"today": {"request_count": 0, "error_count": 0, "total_duration_ms": 0}, "month": {"total_calls": 0}, "top_paths": []}


async def get_tenant_api_usage_daily(auth: AuthSchema, tenant_id: int, days: int = 7) -> dict:
    """获取租户每日 API 用量（已移除 api_usage 模块）"""
    return {"daily": []}
