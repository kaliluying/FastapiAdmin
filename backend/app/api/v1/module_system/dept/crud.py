from collections.abc import Sequence

from app.core.base_crud import CRUDBase
from app.core.base_schema import AuthSchema

from .model import DeptModel
from .schema import DeptCreateSchema, DeptUpdateSchema


class DeptCRUD(CRUDBase[DeptModel, DeptCreateSchema, DeptUpdateSchema]):
    """部门模块数据层"""

    def __init__(self, auth: AuthSchema) -> None:
        """
        初始化部门数据层。

        参数:
        - auth (AuthSchema): 认证信息模型（含 DB 会话等上下文）。

        返回:
        - None
        """
        super().__init__(model=DeptModel, auth=auth)

    async def get_tree_list(
        self,
        search: dict | None = None,
        order_by: list[dict] | None = None,
        preload: list | None = None,
    ) -> Sequence[DeptModel]:
        """
        获取部门树形列表。

        参数:
        - search (dict | None): 搜索条件。
        - order_by (list[dict] | None): 排序字段列表。
        - preload (list | None): 预加载关系，未提供时使用模型默认项

        返回:
        - Sequence[DeptModel]: 部门树形列表。
        """
        return await self.tree_list(
            search=search,
            order_by=order_by,
            children_attr="children",
            preload=preload,
        )
