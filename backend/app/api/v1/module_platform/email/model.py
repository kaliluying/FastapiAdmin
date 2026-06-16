from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, validates

from app.core.base_model import ModelMixin


class EmailConfigModel(ModelMixin):
    """
    邮件 SMTP 配置表

    每条记录对应一套 SMTP 配置（平台级，tenant_id=1）。
    通过 is_default 标记当前生效的配置；只能有一条 is_default=True。
    """

    __tablename__: str = "platform_email_config"
    __table_args__: dict = {"comment": "邮件 SMTP 配置表"}

    name: Mapped[str] = mapped_column(
        String(100), nullable=False, unique=True, comment="配置名称"
    )
    smtp_host: Mapped[str] = mapped_column(
        String(255), nullable=False, comment="SMTP 服务器地址"
    )
    smtp_port: Mapped[int] = mapped_column(
        Integer, nullable=False, default=465, comment="SMTP 端口（465=SSL, 587=TLS）"
    )
    smtp_user: Mapped[str] = mapped_column(
        String(255), nullable=False, comment="SMTP 登录用户名（发件邮箱）"
    )
    smtp_password: Mapped[str] = mapped_column(
        String(255), nullable=False, comment="SMTP 授权密码（AES 加密存储）"
    )
    from_name: Mapped[str] = mapped_column(
        String(100), nullable=False, default="FastapiAdmin", comment="发件人显示名"
    )
    use_tls: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, comment="是否启用 SSL/TLS"
    )
    is_default: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, comment="是否为默认配置"
    )
    timeout: Mapped[int] = mapped_column(
        Integer, nullable=False, default=30, comment="连接超时（秒）"
    )

    @validates("smtp_port")
    def validate_port(self, key: str, value: int) -> int:
        if value < 1 or value > 65535:
            raise ValueError("SMTP 端口范围为 1-65535")
        return value

    @validates("timeout")
    def validate_timeout(self, key: str, value: int) -> int:
        if value < 5 or value > 120:
            raise ValueError("超时时间应在 5-120 秒之间")
        return value


class EmailTemplateModel(ModelMixin):
    """
    邮件模板表

    支持变量插值（Jinja2 语法），如 {{ username }}、{{ reset_link }}。
    template_code 是唯一业务键，代码中通过 code 引用，不依赖自增 ID。
    """

    __tablename__: str = "platform_email_template"
    __table_args__: dict = {"comment": "邮件模板表"}

    name: Mapped[str] = mapped_column(
        String(100), nullable=False, unique=True, comment="模板名称"
    )
    template_code: Mapped[str] = mapped_column(
        String(100), nullable=False, unique=True, comment="模板编码（业务键）"
    )
    subject: Mapped[str] = mapped_column(
        String(255), nullable=False, comment="邮件主题（可含变量）"
    )
    body_html: Mapped[str] = mapped_column(
        Text, nullable=False, comment="邮件正文 HTML（Jinja2 模板）"
    )
    body_text: Mapped[str | None] = mapped_column(
        Text, nullable=True, default=None, comment="邮件纯文本版本（降级用）"
    )
    variables: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        default=None,
        comment="模板变量说明（JSON 格式，如 {\"username\": \"用户名\", \"link\": \"链接\"}）",
    )

    @validates("template_code")
    def validate_code(self, key: str, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("模板编码不能为空")
        return value


class EmailLogModel(ModelMixin):
    """
    邮件发送日志表

    记录每次邮件发送的结果，支持重试追踪。
    status 覆盖 ModelMixin：0=待发送 1=成功 2=失败。
    """

    __tablename__: str = "platform_email_log"
    __table_args__: dict = {"comment": "邮件发送日志表"}

    config_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("platform_email_config.id", ondelete="SET NULL", onupdate="CASCADE"),
        nullable=True,
        index=True,
        comment="使用的 SMTP 配置 ID",
    )
    template_code: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        comment="模板编码（冗余存储，模板删除后仍可追溯）",
    )
    to_email: Mapped[str] = mapped_column(
        String(255), nullable=False, index=True, comment="收件人邮箱"
    )
    to_name: Mapped[str | None] = mapped_column(
        String(100), nullable=True, comment="收件人姓名"
    )
    subject: Mapped[str] = mapped_column(
        String(255), nullable=False, comment="邮件主题（渲染后）"
    )
    biz_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="other",
        comment="业务类型（register/reset_password/invite/expiry_warning/ticket_reply/other）",
    )
    error_msg: Mapped[str | None] = mapped_column(
        Text, nullable=True, default=None, comment="失败原因"
    )
    retry_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, comment="重试次数"
    )
    tenant_id: Mapped[int | None] = mapped_column(
        Integer, nullable=True, index=True, comment="关联租户 ID（可为空，如平台注册邮件）"
    )
    sent_time: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True, default=None, comment="实际发送时间"
    )
