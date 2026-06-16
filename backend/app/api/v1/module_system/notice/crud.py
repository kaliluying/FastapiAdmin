from app.core.base_crud import CRUDBase
from app.core.base_schema import AuthSchema

from .model import NoticeModel
from .schema import NoticeCreateSchema, NoticeUpdateSchema


class NoticeCRUD(CRUDBase[NoticeModel, NoticeCreateSchema, NoticeUpdateSchema]):
    """公告数据层"""

    def __init__(self, auth: AuthSchema) -> None:
        """
        初始化公告数据层。

        参数:
        - auth (AuthSchema): 认证信息模型（含 DB 会话等上下文）。

        返回:
        - None
        """
        super().__init__(model=NoticeModel, auth=auth)
