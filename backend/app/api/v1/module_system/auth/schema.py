from pydantic import BaseModel, ConfigDict, Field

from app.core.base_schema import JWTOutSchema


class CaptchaOutSchema(BaseModel):
    """验证码响应模型"""

    model_config = ConfigDict(from_attributes=True)

    enable: bool = Field(default=True, description="是否启用验证码")
    key: str = Field(..., min_length=1, description="验证码唯一标识")
    img_base: str = Field(..., min_length=1, description="Base64编码的验证码图片")


class AutoLoginUserSchema(BaseModel):
    """免登录用户信息模型"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="用户ID")
    username: str = Field(..., description="用户名")
    name: str = Field(..., description="用户姓名")
    avatar: str | None = Field(default=None, description="头像")


class AutoLoginTokenSchema(BaseModel):
    """免登录Token响应模型"""

    model_config = ConfigDict(from_attributes=True)

    token: str = Field(..., description="免登录Token")
    user: AutoLoginUserSchema = Field(..., description="用户信息")


class LoginSchema(JWTOutSchema):
    """登录响应。"""

    user_info: dict = Field(default_factory=dict, description="用户信息")


