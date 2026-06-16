"""邮件 Service"""
from datetime import datetime

from app.core.base_schema import AuthSchema
from app.core.database import async_db_session
from app.core.exceptions import CustomException
from app.utils.email_util import render_template, send_email

from .crud import EmailConfigCRUD, EmailLogCRUD, EmailTemplateCRUD
from .schema import (
    EmailConfigCreateSchema,
    EmailConfigOutSchema,
    EmailConfigQueryParam,
    EmailConfigUpdateSchema,
    EmailLogOutSchema,
    EmailLogQueryParam,
    EmailSendSchema,
    EmailTemplateCreateSchema,
    EmailTemplateOutSchema,
    EmailTemplateQueryParam,
    EmailTemplateUpdateSchema,
    EmailTestSchema,
)


class EmailConfigService:
    """SMTP 配置管理"""

    @classmethod
    async def page_service(
        cls,
        auth: AuthSchema,
        page_no: int,
        page_size: int,
        search: EmailConfigQueryParam | None = None,
        order_by: list | None = None,
    ) -> dict:
        return await EmailConfigCRUD(auth).page(
            offset=(page_no - 1) * page_size,
            limit=page_size,
            order_by=order_by or [{"id": "asc"}],
            search=search.__dict__ if search else {},
            out_schema=EmailConfigOutSchema,
        )

    @classmethod
    async def detail_service(cls, auth: AuthSchema, id: int) -> EmailConfigOutSchema:
        obj = await EmailConfigCRUD(auth).get(id=id)
        if not obj:
            raise CustomException(msg="SMTP 配置不存在")
        return EmailConfigOutSchema.model_validate(obj)

    @classmethod
    async def create_service(
        cls, auth: AuthSchema, data: EmailConfigCreateSchema
    ) -> EmailConfigOutSchema:
        crud = EmailConfigCRUD(auth)
        if data.is_default:
            await crud.clear_default()
        obj = await crud.create(data=data)
        return EmailConfigOutSchema.model_validate(obj)

    @classmethod
    async def update_service(
        cls, auth: AuthSchema, id: int, data: EmailConfigUpdateSchema
    ) -> EmailConfigOutSchema:
        crud = EmailConfigCRUD(auth)
        obj = await crud.get(id=id)
        if not obj:
            raise CustomException(msg="SMTP 配置不存在")
        if data.is_default is True:
            await crud.clear_default()
        updated = await crud.update(id=id, data=data)
        return EmailConfigOutSchema.model_validate(updated)

    @classmethod
    async def delete_service(cls, auth: AuthSchema, ids: list[int]) -> None:
        if not ids:
            raise CustomException(msg="删除对象不能为空")
        # 不允许删除默认配置
        for cid in ids:
            obj = await EmailConfigCRUD(auth).get(id=cid)
            if obj and obj.is_default:
                raise CustomException(
                    msg=f"配置「{obj.name}」是默认配置，请先将其他配置设为默认后再删除"
                )
        await EmailConfigCRUD(auth).delete(ids=ids)

    @classmethod
    async def test_service(cls, auth: AuthSchema, data: EmailTestSchema) -> dict:
        """测试 SMTP 连接：发送一封测试邮件"""
        config = await EmailConfigCRUD(auth).get(id=data.config_id)
        if not config:
            raise CustomException(msg="SMTP 配置不存在")

        subject = "【FastapiAdmin】SMTP 连接测试"
        body_html = (
            "<p>这是一封测试邮件，SMTP 配置「{name}」连接成功！</p>"
            "<p>发送时间：{time}</p>"
        ).format(name=config.name, time=datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

        try:
            await send_email(
                smtp_host=config.smtp_host,
                smtp_port=config.smtp_port,
                smtp_user=config.smtp_user,
                smtp_password=config.smtp_password,
                use_tls=config.use_tls,
                from_name=config.from_name,
                to_email=data.to_email,
                to_name=None,
                subject=subject,
                body_html=body_html,
                timeout=config.timeout,
            )
        except Exception as e:
            raise CustomException(msg=f"SMTP 连接测试失败：{e!s}") from e

        return {"message": f"测试邮件已发送至 {data.to_email}"}


class EmailTemplateService:
    """邮件模板管理"""

    @classmethod
    async def page_service(
        cls,
        auth: AuthSchema,
        page_no: int,
        page_size: int,
        search: EmailTemplateQueryParam | None = None,
        order_by: list | None = None,
    ) -> dict:
        return await EmailTemplateCRUD(auth).page(
            offset=(page_no - 1) * page_size,
            limit=page_size,
            order_by=order_by or [{"id": "asc"}],
            search=search.__dict__ if search else {},
            out_schema=EmailTemplateOutSchema,
        )

    @classmethod
    async def detail_service(cls, auth: AuthSchema, id: int) -> EmailTemplateOutSchema:
        obj = await EmailTemplateCRUD(auth).get(id=id)
        if not obj:
            raise CustomException(msg="邮件模板不存在")
        return EmailTemplateOutSchema.model_validate(obj)

    @classmethod
    async def create_service(
        cls, auth: AuthSchema, data: EmailTemplateCreateSchema
    ) -> EmailTemplateOutSchema:
        existing = await EmailTemplateCRUD(auth).get_by_code(
            template_code=data.template_code
        )
        if existing:
            raise CustomException(msg=f"模板编码「{data.template_code}」已存在")

        obj = await EmailTemplateCRUD(auth).create(data=data)
        return EmailTemplateOutSchema.model_validate(obj)

    @classmethod
    async def update_service(
        cls, auth: AuthSchema, id: int, data: EmailTemplateUpdateSchema
    ) -> EmailTemplateOutSchema:
        obj = await EmailTemplateCRUD(auth).get(id=id)
        if not obj:
            raise CustomException(msg="邮件模板不存在")

        updated = await EmailTemplateCRUD(auth).update(id=id, data=data)
        return EmailTemplateOutSchema.model_validate(updated)

    @classmethod
    async def delete_service(cls, auth: AuthSchema, ids: list[int]) -> None:
        if not ids:
            raise CustomException(msg="删除对象不能为空")
        await EmailTemplateCRUD(auth).delete(ids=ids)


class EmailSendService:
    """
    邮件发送服务 — 供其他模块调用。

    设计原则：
    1. 优先使用 is_default=True 的 SMTP 配置，无默认配置时降级为站内信（仅记录日志）
    2. 每次发送都写 platform_email_log
    3. 渲染失败/发送失败均记录 error_msg，不向调用方抛出异常（静默降级）
    4. 使用独立数据库会话：邮件发送失败不因调用方事务回滚而丢失日志
    """

    @classmethod
    async def send_by_template(
        cls,
        *,
        to_email: str,
        template_code: str,
        variables: dict,
        biz_type: str = "other",
        to_name: str | None = None,
        tenant_id: int | None = None,
        config_id: int | None = None,
    ) -> bool:
        """
        通过模板发送邮件（核心方法，供内部调用）。

        返回 True=发送成功，False=失败（已降级记录日志）。
        """
        # ① 获取模板（独立会话，不影响调用方事务）
        async with async_db_session() as session:
            auth = AuthSchema(db=session, check_data_scope=False)
            template = await EmailTemplateCRUD(auth).get_active_by_code(template_code)

        if not template:
            await EmailLogCRUD.create_log(
                to_email=to_email,
                subject=f"[{template_code}]",
                biz_type=biz_type,
                to_name=to_name,
                template_code=template_code,
                tenant_id=tenant_id,
                status=2,
                error_msg=f"模板「{template_code}」不存在或已禁用",
            )
            return False

        # ② 渲染主题 & 正文
        try:
            rendered_subject = render_template(template.subject, variables)
            rendered_html = render_template(template.body_html, variables)
            rendered_text = (
                render_template(template.body_text, variables) if template.body_text else None
            )
        except Exception as e:
            await EmailLogCRUD.create_log(
                to_email=to_email,
                subject=template.subject,
                biz_type=biz_type,
                to_name=to_name,
                template_code=template_code,
                tenant_id=tenant_id,
                status=2,
                error_msg=f"模板渲染失败：{e!s}",
            )
            return False

        # ③ 获取 SMTP 配置（独立会话）
        async with async_db_session() as session:
            auth = AuthSchema(db=session, check_data_scope=False)
            if config_id:
                config = await EmailConfigCRUD(auth).get_active_by_id(config_id)
            else:
                config = await EmailConfigCRUD(auth).get_active_default()

        if not config:
            await EmailLogCRUD.create_log(
                to_email=to_email,
                subject=rendered_subject,
                biz_type=biz_type,
                to_name=to_name,
                template_code=template_code,
                tenant_id=tenant_id,
                status=2,
                error_msg="无可用的 SMTP 配置，邮件未发送（已降级为站内信）",
            )
            return False

        # ④ 发送
        try:
            await send_email(
                smtp_host=config.smtp_host,
                smtp_port=config.smtp_port,
                smtp_user=config.smtp_user,
                smtp_password=config.smtp_password,
                use_tls=config.use_tls,
                from_name=config.from_name,
                to_email=to_email,
                to_name=to_name,
                subject=rendered_subject,
                body_html=rendered_html,
                body_text=rendered_text,
                timeout=config.timeout,
            )
        except Exception as e:
            await EmailLogCRUD.create_log(
                to_email=to_email,
                subject=rendered_subject,
                biz_type=biz_type,
                to_name=to_name,
                template_code=template_code,
                config_id=config.id,
                tenant_id=tenant_id,
                status=2,
                error_msg=f"SMTP 发送失败：{e!s}",
            )
            return False

        # ⑤ 写成功日志
        await EmailLogCRUD.create_log(
            config_id=config.id,
            template_code=template_code,
            to_email=to_email,
            to_name=to_name,
            subject=rendered_subject,
            biz_type=biz_type,
            status=1,
            tenant_id=tenant_id,
        )

        return True

    @classmethod
    async def manual_send_service(
        cls, auth: AuthSchema, data: EmailSendSchema
    ) -> dict:
        """超管手动触发发送（测试/补发用）"""
        success = await cls.send_by_template(
            to_email=data.to_email,
            template_code=data.template_code,
            variables=data.variables,
            biz_type=data.biz_type,
            to_name=data.to_name,
            config_id=data.config_id,
        )
        if not success:
            raise CustomException(msg="邮件发送失败，请查看邮件日志获取详情")
        return {"message": f"邮件已发送至 {data.to_email}"}


class EmailLogService:
    """邮件日志查询"""

    @classmethod
    async def page_service(
        cls,
        auth: AuthSchema,
        page_no: int,
        page_size: int,
        search: EmailLogQueryParam | None = None,
        order_by: list | None = None,
    ) -> dict:
        return await EmailLogCRUD(auth).page(
            offset=(page_no - 1) * page_size,
            limit=page_size,
            order_by=order_by or [{"created_time": "desc"}],
            search=search.__dict__ if search else {},
            out_schema=EmailLogOutSchema,
        )
