from sqlalchemy import CheckConstraint, Integer, String, UniqueConstraint, column
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base_model import ModelMixin, UserMixin


class __MODEL_CLASS__(ModelMixin, UserMixin):
    """创建人名下名称唯一；软删除保留名称与审计记录。"""

    __tablename__ = "__MODULE_____RESOURCE__"
    __table_args__ = (
        UniqueConstraint("created_id", "name", name="uq___MODULE_____RESOURCE___owner_name"),
        CheckConstraint("status IN (0, 1)", name="ck___MODULE_____RESOURCE___status"),
        CheckConstraint(column("order") >= 0, name="ck___MODULE_____RESOURCE___order"),
        {"comment": "__TITLE__管理"},
    )

    name: Mapped[str] = mapped_column(String(64), nullable=False, comment="__TITLE__名称")
    order: Mapped[int] = mapped_column(Integer, default=0, nullable=False, comment="显示排序")
    status: Mapped[int] = mapped_column(Integer, default=0, nullable=False, comment="0启用，1停用")
    description: Mapped[str | None] = mapped_column(String(500), nullable=True, comment="说明")
