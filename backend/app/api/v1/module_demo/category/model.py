from sqlalchemy import CheckConstraint, Integer, String, UniqueConstraint, column
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base_model import ModelMixin, UserMixin


class CategoryModel(ModelMixin, UserMixin):
    """创建人名下名称唯一；软删除保留名称与审计记录。"""

    __tablename__ = "demo_category"
    __table_args__ = (
        UniqueConstraint("created_id", "name", name="uq_demo_category_owner_name"),
        CheckConstraint("status IN (0, 1)", name="ck_demo_category_status"),
        CheckConstraint(column("order") >= 0, name="ck_demo_category_order"),
        {"comment": "标准业务模块范例：分类"},
    )

    name: Mapped[str] = mapped_column(String(64), nullable=False, comment="分类名称")
    order: Mapped[int] = mapped_column(Integer, default=0, nullable=False, comment="显示排序")
    status: Mapped[int] = mapped_column(Integer, default=0, nullable=False, comment="0启用，1停用")
    description: Mapped[str | None] = mapped_column(String(500), nullable=True, comment="说明")
