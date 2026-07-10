from typing import Any

from app.common.constant import RET
from app.core.base_schema import PageResultSchema
from app.core.exceptions import CustomException


def paginate(
    data_list: list[Any],
    page_no: int | None = None,
    page_size: int | None = None,
) -> PageResultSchema[Any]:
    """对已在内存中的列表做切片分页。"""
    page_no = 1 if page_no is None else page_no
    page_size = 10 if page_size is None else page_size
    if page_no < 1 or page_size < 1:
        raise CustomException(code=RET.ERROR.code, msg="分页参数不合法")

    total = len(data_list)
    start = (page_no - 1) * page_size
    end = min(start + page_size, total)
    return PageResultSchema(
        items=data_list[start:end],
        total=total,
        page_no=page_no,
        page_size=page_size,
        has_next=end < total,
    )
