import pytest
from pydantic import ValidationError

from app.api.v1.module_system.user.schema import CurrentUserUpdateSchema


def test_avatar_accepts_root_relative_path():
    avatar = "/api/v1/static/image/avatar.png"

    assert CurrentUserUpdateSchema(avatar=avatar).avatar == avatar


@pytest.mark.parametrize(
    "avatar",
    ["//evil.example/avatar.png", r"/\evil.example\avatar.png", "javascript:alert(1)", "relative/avatar.png", " /api/v1/static/avatar.png"],
)
def test_avatar_rejects_unsafe_paths(avatar):
    with pytest.raises(ValidationError):
        CurrentUserUpdateSchema(avatar=avatar)
