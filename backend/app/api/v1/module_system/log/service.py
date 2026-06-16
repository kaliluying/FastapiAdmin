from app.core.base_schema import AuthSchema
from app.core.exceptions import CustomException
from app.core.logger import logger

from .crud import LoginLogCRUD, OperationLogCRUD
from .schema import (
    LoginLogCreateSchema,
    LoginLogDetailOutSchema,
    LoginLogOutSchema,
    LoginLogQueryParam,
    OperationLogCreateSchema,
    OperationLogDetailOutSchema,
    OperationLogOutSchema,
)


class LoginLogService:
    """登录日志管理模块服务层"""

    @classmethod
    async def detail_service(cls, auth: AuthSchema, id: int) -> LoginLogDetailOutSchema:
        obj = await LoginLogCRUD(auth).get(id=id)
        if not obj:
            raise CustomException(msg="该数据不存在")
        return LoginLogDetailOutSchema.model_validate(obj)

    @classmethod
    async def page_service(
        cls,
        auth: AuthSchema,
        page_no: int,
        page_size: int,
        search: LoginLogQueryParam | None = None,
        order_by: list[dict[str, str]] | None = None,
    ) -> dict:
        search_dict = search.__dict__ if search else {}
        order_by_list = order_by or [{"updated_time": "desc"}]
        offset = (page_no - 1) * page_size

        result = await LoginLogCRUD(auth).page(
            offset=offset,
            limit=page_size,
            order_by=order_by_list,
            search=search_dict,
            out_schema=LoginLogOutSchema,
        )
        return result

    @classmethod
    async def create_service(cls, auth: AuthSchema, data: LoginLogCreateSchema) -> LoginLogDetailOutSchema:
        obj = await LoginLogCRUD(auth).create(data=data)
        if not obj:
            raise CustomException(msg="创建登录日志失败")
        return LoginLogDetailOutSchema.model_validate(obj)

    @classmethod
    async def delete_service(cls, auth: AuthSchema, ids: list[int]) -> None:
        if len(ids) < 1:
            raise CustomException(msg="删除失败，删除对象不能为空")

        existing = await LoginLogCRUD(auth).list(search={"id": ("in", ids)})
        existing_map = {obj.id for obj in existing}
        for nid in ids:
            if nid not in existing_map:
                raise CustomException(msg=f"删除失败，ID为{nid}的数据不存在")

        await LoginLogCRUD(auth).delete(ids=ids)


class OperationLogService:

    @staticmethod
    async def cleanup_operation_log() -> None:
        """定时任务：清理超过保留期的操作日志和登录日志（PRD §14.5）

        清理 create_time < now - retention_days 的记录。
        保留期从全局参数 `operation_log_retention_days` 读取，默认 90 天。
        """
        from datetime import datetime, timedelta

        from sqlalchemy import delete

        from app.core.database import async_db_session

        from .model import LoginLogModel, OperationLogModel

        retention_days = 90  # 默认 90 天，可通过系统参数覆盖
        # 尝试从系统参数读取自定义保留期
        try:
            from app.api.v1.module_system.params.model import ParamsModel
            async with async_db_session() as _s:
                from sqlalchemy import select
                result = await _s.execute(
                    select(ParamsModel.config_value).where(
                        ParamsModel.config_key == "operation_log_retention_days"
                    ).limit(1)
                )
                row = result.scalar()
                if row is not None:
                    retention_days = int(row)
        except Exception:
            pass  # 读取失败使用默认值

        cutoff = datetime.now() - timedelta(days=retention_days)
        async with async_db_session() as session:
            op_stmt = delete(OperationLogModel).where(OperationLogModel.created_time < cutoff)
            op_result = await session.execute(op_stmt)

            login_stmt = delete(LoginLogModel).where(LoginLogModel.created_time < cutoff)
            login_result = await session.execute(login_stmt)

            await session.commit()
            logger.info(
                f"操作日志清理完成: "
                f"操作日志 {op_result.rowcount} 条, "
                f"登录日志 {login_result.rowcount} 条"
            )
            return True

    @staticmethod
    async def create_service(auth: AuthSchema, data: OperationLogCreateSchema) -> OperationLogDetailOutSchema:
        crud = OperationLogCRUD(auth)
        obj = await crud.create(data)
        if not obj:
            raise CustomException(msg="创建操作日志失败")
        return OperationLogDetailOutSchema.model_validate(obj)

    @staticmethod
    async def page_service(
        auth: AuthSchema,
        page: int,
        page_size: int,
        search: dict | None = None,
        order_by: list[dict[str, str]] | None = None,
    ) -> dict:
        from app.common.enums import QueueEnum
        
        crud = OperationLogCRUD(auth)

        # 构建过滤条件
        filters = {}
        if search:
            if search.get("request_path"):
                filters["request_path"] = (QueueEnum.like.value, search["request_path"])
            if search.get("request_method"):
                filters["request_method"] = (QueueEnum.eq.value, search["request_method"])
            if search.get("username"):
                filters["username"] = (QueueEnum.like.value, search["username"])

        result = await crud.page(
            offset=(page - 1) * page_size,
            limit=page_size,
            order_by=order_by or [{"id": "desc"}],
            search=filters,
            out_schema=OperationLogOutSchema,
        )
        return result

    @staticmethod
    async def detail_service(auth: AuthSchema, id: int) -> OperationLogDetailOutSchema:
        crud = OperationLogCRUD(auth)
        obj = await crud.get(id=id)
        if not obj:
            raise CustomException(msg="该操作日志不存在")
        return OperationLogDetailOutSchema.model_validate(obj)

    @staticmethod
    async def delete_service(auth: AuthSchema, ids: list[int]) -> None:
        if len(ids) < 1:
            raise CustomException(msg="删除失败，删除对象不能为空")
        crud = OperationLogCRUD(auth)
        await crud.delete(ids)
