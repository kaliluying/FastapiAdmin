from dataclasses import dataclass

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.common.enums import QueueEnum
from app.core.base_schema import BaseSchema
from app.core.validator import DateTimeStr

# ──────────────────────────────────────────────────────────────
# EmailConfig Schemas
# ──────────────────────────────────────────────────────────────


class EmailConfigCreateSchema(BaseModel):
    """创建 SMTP 配置"""

    name: str = Field(..., min_length=1, max_length=100, description="配置名称")
    smtp_host: str = Field(..., min_length=1, max_length=255, description="SMTP 服务器地址")
    smtp_port: int = Field(default=465, ge=1, le=65535, description="SMTP 端口")
    smtp_user: str = Field(..., min_length=1, max_length=255, description="SMTP 登录用户名")
    smtp_password: str = Field(..., min_length=1, max_length=255, description="SMTP 授权密码")
    from_name: str = Field(default="FastapiAdmin", max_length=100, description="发件人显示名")
    use_tls: bool = Field(default=True, description="是否启用 SSL/TLS")
    is_default: bool = Field(default=False, description="是否设为默认配置")
    timeout: int = Field(default=30, ge=5, le=120, description="连接超时（秒）")
    description: str | None = Field(default=None, max_length=255, description="备注")


class EmailConfigUpdateSchema(BaseModel):
    """更新 SMTP 配置"""

    name: str | None = Field(default=None, max_length=100, description="配置名称")
    smtp_host: str | None = Field(default=None, max_length=255, description="SMTP 服务器地址")
    smtp_user: str | None = Field(default=None, max_length=255, description="SMTP 登录用户名")
    smtp_password: str | None = Field(default=None, max_length=255, description="SMTP 授权密码")
    smtp_port: int | None = Field(default=None, ge=1, le=65535, description="SMTP 端口")
    from_name: str | None = Field(default=None, max_length=100, description="发件人显示名")
    use_tls: bool | None = Field(default=None, description="是否启用 SSL/TLS")
    is_default: bool | None = Field(default=None, description="是否设为默认配置")
    timeout: int | None = Field(default=None, ge=5, le=120, description="连接超时（秒）")
    description: str | None = Field(default=None, max_length=255, description="备注")


class EmailConfigOutSchema(BaseSchema):
    """SMTP 配置响应（不含密码）"""

    model_config = ConfigDict(from_attributes=True)

    name: str
    smtp_host: str
    smtp_port: int
    smtp_user: str
    from_name: str
    use_tls: bool
    is_default: bool
    timeout: int
    description: str | None = None


@dataclass
class EmailConfigQueryParam:
    """SMTP 配置查询参数"""

    def __init__(
        self,
        name: str | None = None,
        is_default: bool | None = None,
    ) -> None:
        if name:
            self.name = (QueueEnum.like.value, name)
        if is_default is not None:
            self.is_default = (QueueEnum.eq.value, is_default)


# ──────────────────────────────────────────────────────────────
# EmailTemplate Schemas
# ──────────────────────────────────────────────────────────────


class EmailTemplateCreateSchema(BaseModel):
    """创建邮件模板"""

    name: str = Field(..., min_length=1, max_length=100, description="模板名称")
    template_code: str = Field(..., min_length=1, max_length=100, description="模板编码")
    subject: str = Field(..., min_length=1, max_length=255, description="邮件主题")
    body_html: str = Field(..., min_length=1, description="邮件正文 HTML（Jinja2 模板）")
    body_text: str | None = Field(default=None, description="纯文本版本（降级用）")
    variables: str | None = Field(default=None, description="变量说明 JSON")
    description: str | None = Field(default=None, max_length=255, description="备注")

    @field_validator("template_code")
    @classmethod
    def _validate_code(cls, v: str | None) -> str | None:
        if v is None:
            return v
        return v.strip()


class EmailTemplateUpdateSchema(BaseModel):
    """更新邮件模板"""

    name: str | None = Field(default=None, max_length=100, description="模板名称")
    template_code: str | None = Field(default=None, max_length=100, description="模板编码")
    subject: str | None = Field(default=None, max_length=255, description="邮件主题")
    body_html: str | None = Field(default=None, description="邮件正文 HTML")
    body_text: str | None = Field(default=None, description="纯文本版本")
    variables: str | None = Field(default=None, description="变量说明 JSON")
    description: str | None = Field(default=None, max_length=255, description="备注")

    @field_validator("template_code")
    @classmethod
    def _validate_code(cls, v: str | None) -> str | None:
        if v is None:
            return v
        return v.strip()


class EmailTemplateOutSchema(BaseSchema):
    """邮件模板响应"""

    model_config = ConfigDict(from_attributes=True)

    name: str
    template_code: str
    subject: str
    body_html: str
    body_text: str | None = None
    variables: str | None = None
    description: str | None = None


@dataclass
class EmailTemplateQueryParam:
    """邮件模板查询参数"""

    def __init__(
        self,
        name: str | None = None,
        template_code: str | None = None,
    ) -> None:
        if name:
            self.name = (QueueEnum.like.value, name)
        if template_code:
            self.template_code = (QueueEnum.like.value, template_code)


# ──────────────────────────────────────────────────────────────
# EmailLog Schemas
# ──────────────────────────────────────────────────────────────


class EmailSendSchema(BaseModel):
    """手动发送邮件（测试用）"""

    to_email: str = Field(..., min_length=5, max_length=255, description="收件人邮箱")
    to_name: str | None = Field(default=None, max_length=100, description="收件人姓名")
    template_code: str = Field(..., min_length=1, max_length=100, description="模板编码")
    variables: dict = Field(default_factory=dict, description="模板变量 {key: value}")
    config_id: int | None = Field(default=None, gt=0, description="指定 SMTP 配置 ID（默认使用 is_default=True 的配置）")
    biz_type: str = Field(default="other", max_length=50, description="业务类型")


class EmailLogOutSchema(BaseSchema):
    """邮件日志响应"""

    model_config = ConfigDict(from_attributes=True)

    config_id: int | None = None
    template_code: str | None = None
    to_email: str
    to_name: str | None = None
    subject: str
    biz_type: str
    error_msg: str | None = None
    retry_count: int
    tenant_id: int | None = None
    sent_time: DateTimeStr | None = None


@dataclass
class EmailLogQueryParam:
    """邮件日志查询参数"""

    def __init__(
        self,
        to_email: str | None = None,
        biz_type: str | None = None,
        status: int | None = None,
        template_code: str | None = None,
    ) -> None:
        if to_email:
            self.to_email = (QueueEnum.like.value, to_email)
        if biz_type:
            self.biz_type = (QueueEnum.eq.value, biz_type)
        if status is not None:
            self.status = (QueueEnum.eq.value, status)
        if template_code:
            self.template_code = (QueueEnum.eq.value, template_code)


class EmailTestSchema(BaseModel):
    """测试 SMTP 连接"""

    config_id: int = Field(..., gt=0, description="SMTP 配置 ID")
    to_email: str = Field(..., min_length=5, max_length=255, description="测试收件人")
