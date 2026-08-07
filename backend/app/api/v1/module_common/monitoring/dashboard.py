"""首页运营概览数据接口。"""

from datetime import date, datetime, time, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import func, select

from app.api.v1.module_system.log.model import LoginLogModel
from app.api.v1.module_system.user.model import UserModel
from app.common.response import ResponseSchema, SuccessResponse
from app.core.base_schema import AuthSchema
from app.core.dependencies import AuthPermission
from app.core.permission import Permission

from .schema import LoginTrendItem, LoginTrendOut

DashboardRouter = APIRouter(prefix="/monitoring", tags=["公共模块", "运营概览"])


def _normalise_group_day(value: object) -> str | None:
    """将不同数据库返回的日期分组值统一为 ISO 日期字符串。"""
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, str):
        return value[:10]
    return None


@DashboardRouter.get(
    "/login-trend",
    summary="获取近七日登录趋势",
    response_model=ResponseSchema[LoginTrendOut],
)
async def get_login_trend_controller(
    auth: Annotated[AuthSchema, Depends(AuthPermission(["module_system:login_log:query"]))],
) -> JSONResponse:
    """返回首页使用的近七日成功登录和新增账号统计。"""
    if auth.db is None:
        raise RuntimeError("登录趋势查询缺少数据库会话")

    today = date.today()
    first_day = today - timedelta(days=6)
    start_at = datetime.combine(first_day, time.min)
    end_at = datetime.combine(today + timedelta(days=1), time.min)

    login_day = func.date(LoginLogModel.created_time).label("day")
    login_query = (
        select(
            login_day,
            func.count(LoginLogModel.id).label("logins"),
            func.count(func.distinct(LoginLogModel.username)).label("unique_users"),
        )
        .where(
            LoginLogModel.status == 1,
            LoginLogModel.is_deleted == False,  # noqa: E712
            LoginLogModel.created_time >= start_at,
            LoginLogModel.created_time < end_at,
        )
        .group_by(login_day)
    )
    login_query = await Permission(LoginLogModel, auth).filter_query(login_query)
    login_rows = (await auth.db.execute(login_query)).mappings()
    login_by_day: dict[str, tuple[int, int]] = {}
    for row in login_rows:
        group_day = _normalise_group_day(row["day"])
        if group_day is not None:
            login_by_day[group_day] = (int(row["logins"] or 0), int(row["unique_users"] or 0))

    user_day = func.date(UserModel.created_time).label("day")
    user_query = (
        select(user_day, func.count(UserModel.id).label("new_users"))
        .where(
            UserModel.is_deleted == False,  # noqa: E712
            UserModel.created_time >= start_at,
            UserModel.created_time < end_at,
        )
        .group_by(user_day)
    )
    user_query = await Permission(UserModel, auth).filter_query(user_query)
    user_rows = (await auth.db.execute(user_query)).mappings()
    new_users_by_day: dict[str, int] = {}
    for row in user_rows:
        group_day = _normalise_group_day(row["day"])
        if group_day is not None:
            new_users_by_day[group_day] = int(row["new_users"] or 0)

    items = []
    for offset in range(7):
        group_day = (first_day + timedelta(days=offset)).isoformat()
        logins, unique_users = login_by_day.get(group_day, (0, 0))
        items.append(
            LoginTrendItem(
                day=group_day,
                logins=logins,
                unique_users=unique_users,
                new_users=new_users_by_day.get(group_day, 0),
            )
        )

    return SuccessResponse(data=LoginTrendOut(items=items), msg="获取登录趋势成功")
