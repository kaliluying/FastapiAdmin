import io
from typing import Any

import pandas as pd
from fastapi import UploadFile

from app.core.base_schema import AuthSchema, BatchSetAvailable
from app.core.exceptions import CustomException
from app.core.logger import logger
from app.utils.excel_util import ExcelUtil

from .crud import DemoCRUD
from .schema import (
    DemoCreateSchema,
    DemoOutSchema,
    DemoQueryParam,
    DemoUpdateSchema,
)


class DemoService:
    """
    示例管理模块服务层
    """

    @classmethod
    async def detail_service(cls, auth: AuthSchema, id: int) -> DemoOutSchema:
        """
        详情

        参数:
        - auth (AuthSchema): 认证信息模型
        - id (int): 示例ID

        返回:
        - DemoOutSchema: 示例详情
        """
        obj = await DemoCRUD(auth).get(id=id)
        if not obj:
            raise CustomException(msg="该数据不存在")
        return DemoOutSchema.model_validate(obj)

    @classmethod
    async def list_service(
        cls,
        auth: AuthSchema,
        search: DemoQueryParam | None = None,
        order_by: list[dict[str, str]] | None = None,
    ) -> list[DemoOutSchema]:
        """
        列表查询

        参数:
        - auth (AuthSchema): 认证信息模型
        - search (DemoQueryParam | None): 查询参数
        - order_by (list[dict[str, str]] | None): 排序参数

        返回:
        - list[DemoOutSchema]: 示例列表
        """
        search_dict = search.__dict__ if search else None
        obj_list = await DemoCRUD(auth).list(search=search_dict, order_by=order_by)
        return [DemoOutSchema.model_validate(obj) for obj in obj_list]

    @classmethod
    async def page_service(
        cls,
        auth: AuthSchema,
        page_no: int,
        page_size: int,
        search: DemoQueryParam | None = None,
        order_by: list[dict[str, str]] | None = None,
    ) -> dict:
        """
        分页查询

        参数:
        - auth (AuthSchema): 认证信息模型
        - page_no (int): 页码
        - page_size (int): 每页数量
        - search (DemoQueryParam | None): 查询参数
        - order_by (list[dict[str, str]] | None): 排序参数

        返回:
        - dict: 分页数据
        """
        search_dict = search.__dict__ if search else {}
        order_by_list = order_by or [{"id": "asc"}]
        offset = (page_no - 1) * page_size

        result = await DemoCRUD(auth).page(
            offset=offset,
            limit=page_size,
            order_by=order_by_list,
            search=search_dict,
            out_schema=DemoOutSchema,
        )
        return result

    @classmethod
    async def create_service(cls, auth: AuthSchema, data: DemoCreateSchema) -> DemoOutSchema:
        """
        创建

        参数:
        - auth (AuthSchema): 认证信息模型
        - data (DemoCreateSchema): 示例创建模型

        返回:
        - DemoOutSchema: 新创建的示例
        """
        obj = await DemoCRUD(auth).get(name=data.name)
        if obj:
            raise CustomException(msg="创建失败，名称已存在")
        obj = await DemoCRUD(auth).create(data=data)
        return DemoOutSchema.model_validate(obj)

    @classmethod
    async def update_service(cls, auth: AuthSchema, id: int, data: DemoUpdateSchema) -> DemoOutSchema:
        """
        更新

        参数:
        - auth (AuthSchema): 认证信息模型
        - id (int): 示例ID
        - data (DemoUpdateSchema): 示例更新模型

        返回:
        - DemoOutSchema: 更新后的示例
        """
        obj = await DemoCRUD(auth).get(id=id)
        if not obj:
            raise CustomException(msg="更新失败，该数据不存在")

        exist_obj = await DemoCRUD(auth).get(name=data.name)
        if exist_obj and exist_obj.id != id:
            raise CustomException(msg="更新失败，名称重复")

        obj = await DemoCRUD(auth).update(id=id, data=data)
        return DemoOutSchema.model_validate(obj)

    @classmethod
    async def delete_service(cls, auth: AuthSchema, ids: list[int]) -> None:
        """
        删除

        参数:
        - auth (AuthSchema): 认证信息模型
        - ids (list[int]): 示例ID列表

        返回:
        - None
        """
        if len(ids) < 1:
            raise CustomException(msg="删除失败，删除对象不能为空")

        for id in ids:
            obj = await DemoCRUD(auth).get(id=id)
            if not obj:
                raise CustomException(msg=f"删除失败，ID为{id}的数据不存在")

        await DemoCRUD(auth).delete(ids=ids)

    @classmethod
    async def set_available_service(cls, auth: AuthSchema, data: BatchSetAvailable) -> None:
        """
        批量设置状态

        参数:
        - auth (AuthSchema): 认证信息模型
        - data (BatchSetAvailable): 批量设置状态模型

        返回:
        - None
        """
        await DemoCRUD(auth).set(ids=data.ids, status=data.status)

    @classmethod
    async def batch_export_service(cls, obj_list: list[dict[str, Any]]) -> bytes:
        """
        批量导出

        参数:
        - obj_list (list[dict[str, Any]]): 示例模型实例字典列表

        返回:
        - bytes: Excel文件字节流
        """
        mapping_dict = {
            "id": "编号",
            "name": "名称",
            "status": "状态",
            "description": "备注",
            "created_time": "创建时间",
            "updated_time": "更新时间",
            "created_id": "创建者",
        }

        data = obj_list.copy()
        for item in data:
            item["status"] = "启用" if item.get("status") == 0 else "停用"
            creator_info = item.get("created_id")
            if isinstance(creator_info, dict):
                item["created_id"] = creator_info.get("name", "未知")
            else:
                item["created_id"] = "未知"

        return ExcelUtil.export_list2excel(list_data=data, mapping_dict=mapping_dict)

    @classmethod
    async def batch_import_service(
        cls, auth: AuthSchema, file: UploadFile, update_support: bool = False
    ) -> str:
        """
        批量导入

        参数:
        - auth (AuthSchema): 认证信息模型
        - file (UploadFile): 上传的Excel文件
        - update_support (bool): 是否支持更新存在数据

        返回:
        - str: 导入结果信息
        """

        header_dict = {"名称": "name", "状态": "status", "描述": "description"}

        try:
            contents = await file.read()
            df = pd.read_excel(io.BytesIO(contents))
            await file.close()

            if df.empty:
                raise CustomException(msg="导入文件为空")

            missing_headers = [header for header in header_dict if header not in df.columns]
            if missing_headers:
                raise CustomException(msg=f"导入文件缺少必要的列: {', '.join(missing_headers)}")

            df.rename(columns=header_dict, inplace=True)

            required_fields = ["name", "status"]
            errors = []
            for field in required_fields:
                missing_rows = df[df[field].isnull()].index.tolist()
                if missing_rows:
                    field_name = next(k for k, v in header_dict.items() if v == field)
                    rows_str = "、".join([str(i + 1) for i in missing_rows])
                    errors.append(f"{field_name}不能为空，第{rows_str}行")
            if errors:
                raise CustomException(msg=f"导入失败，以下行缺少必要字段：\n{'; '.join(errors)}")

            error_msgs = []
            success_count = 0
            count = 0

            for _index, row in df.iterrows():
                count += 1
                try:
                    try:
                        status = 0 if row["status"] == "正常" else 1
                    except ValueError:
                        error_msgs.append(f"第{count}行: 状态必须是'正常'或'停用'")
                        continue

                    data = {
                        "name": str(row["name"]),
                        "status": status,
                        "description": str(row["description"]),
                    }

                    exists_obj = await DemoCRUD(auth).get(name=data["name"])
                    if exists_obj:
                        if update_support:
                            await DemoCRUD(auth).update(id=exists_obj.id, data=data)
                            success_count += 1
                        else:
                            error_msgs.append(f"第{count}行: 对象 {data['name']} 已存在")
                    else:
                        await DemoCRUD(auth).create(data=data)
                        success_count += 1

                except Exception as e:
                    error_msgs.append(f"第{count}行: {e!s}")
                    continue

            result = f"成功导入 {success_count} 条数据"
            if error_msgs:
                result += "\n错误信息:\n" + "\n".join(error_msgs)
            return result

        except Exception as e:
            logger.error(f"批量导入用户失败: {e!s}")
            raise CustomException(msg=f"导入失败: {e!s}")

    @classmethod
    async def import_template_download_service(cls) -> bytes:
        """
        下载导入模板

        返回:
        - bytes: Excel文件字节流
        """
        header_list = ["名称", "状态", "描述"]
        selector_header_list = ["状态"]
        option_list = [{"状态": ["正常", "停用"]}]
        return ExcelUtil.get_excel_template(
            header_list=header_list,
            selector_header_list=selector_header_list,
            option_list=option_list,
        )
