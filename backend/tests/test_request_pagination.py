import pytest

from app.common.request import paginate
from app.core.exceptions import CustomException


def test_paginate_slices_items_and_reports_next_page() -> None:
    result = paginate([1, 2, 3], page_no=1, page_size=2)

    assert result.items == [1, 2]
    assert result.total == 3
    assert result.page_no == 1
    assert result.page_size == 2
    assert result.has_next is True


def test_paginate_rejects_invalid_page() -> None:
    with pytest.raises(CustomException):
        paginate([1], page_no=0, page_size=1)
