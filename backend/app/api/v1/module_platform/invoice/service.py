"""发票管理 Service"""
import random
from datetime import date, datetime, timedelta

from app.api.v1.module_platform.order.crud import OrderCRUD
from app.core.base_schema import AuthSchema
from app.core.exceptions import CustomException
from app.core.logger import logger

from .crud import InvoiceCRUD
from .schema import (
    InvoiceApplySchema,
    InvoiceCreateSchema,
    InvoiceOutSchema,
    InvoiceQueryParam,
    InvoiceUpdateSchema,
)


def _generate_invoice_no() -> str:
    """生成发票编号"""
    today = date.today().strftime("%Y%m%d")
    suffix = str(random.randint(100000, 999999))
    return f"INV{today}{suffix}"


class InvoiceTenantService:
    """租户端发票服务"""

    @staticmethod
    async def apply(auth: AuthSchema, data: InvoiceApplySchema, tenant_id: int) -> InvoiceOutSchema:
        # 校验：专票必填字段
        if data.invoice_type == "vat_special":
            if not data.tax_no:
                raise CustomException(msg="增值税专用发票必须填写纳税人识别号")
            if not data.bank_info:
                raise CustomException(msg="增值税专用发票必须填写开户行及账号")
            if not data.address_info:
                raise CustomException(msg="增值税专用发票必须填写注册地址及电话")

        # 校验：订单存在且已支付
        order = await OrderCRUD(auth).get(id=data.order_id)
        if not order:
            raise CustomException(msg="订单不存在")
        if order.status != 1:
            raise CustomException(msg="仅已支付订单可申请开票")

        # 校验：30 天内
        if order.created_time and datetime.now() - order.created_time > timedelta(days=30):
            raise CustomException(msg="订单支付超过 30 天，不可申请开票")

        crud = InvoiceCRUD(auth)
        existing = await crud.get_by_order_id(data.order_id)
        if existing:
            raise CustomException(msg="该订单已申请过发票")

        tax_rate = 0  # 默认税率0%，未来可从套餐配置读取
        tax_amount = int(order.amount * tax_rate / 100)
        invoice = await crud.create(
            InvoiceCreateSchema(
                invoice_no=_generate_invoice_no(),
                order_id=data.order_id,
                tenant_id=tenant_id,
                invoice_type=data.invoice_type,
                title=data.title,
                tax_no=data.tax_no,
                bank_info=data.bank_info,
                address_info=data.address_info,
                amount=order.amount,
                tax_amount=tax_amount,
                description=data.description,
            )
        )
        logger.info(f"发票申请成功: invoice_no={invoice.invoice_no}, order_id={data.order_id}")
        return InvoiceOutSchema.model_validate(invoice)

    @staticmethod
    async def list_my(auth: AuthSchema, tenant_id: int, params: InvoiceQueryParam) -> dict:
        search: dict = {"tenant_id": tenant_id}
        if params.invoice_type:
            search["invoice_type"] = params.invoice_type
        if params.status is not None:
            search["status"] = params.status
        return await InvoiceCRUD(auth).page(
            offset=(params.page_no - 1) * params.page_size,
            limit=params.page_size,
            order_by=[{"created_time": "desc"}],
            search=search,
            out_schema=InvoiceOutSchema,
        )


class InvoicePlatformService:
    """平台端发票服务"""

    @staticmethod
    async def list_all(auth: AuthSchema, params: InvoiceQueryParam) -> dict:
        search: dict = {}
        if params.invoice_type:
            search["invoice_type"] = params.invoice_type
        if params.status is not None:
            search["status"] = params.status
        if params.tenant_id:
            search["tenant_id"] = params.tenant_id
        return await InvoiceCRUD(auth).page(
            offset=(params.page_no - 1) * params.page_size,
            limit=params.page_size,
            order_by=[{"created_time": "desc"}],
            search=search,
            out_schema=InvoiceOutSchema,
        )

    @staticmethod
    async def issue(auth: AuthSchema, invoice_id: int, pdf_url: str, api_response: str) -> InvoiceOutSchema:
        crud = InvoiceCRUD(auth)
        invoice = await crud.get(id=invoice_id)
        if not invoice:
            raise CustomException(msg="发票不存在")
        if invoice.status != 0:
            raise CustomException(msg="仅待开票状态可操作")

        # 第三方开票 API 调用（暂为存根，对接百望云/票通时替换）
        api_ok, pdf_url_result, api_response_result = await InvoicePlatformService._call_third_party_api(invoice)

        if not api_ok:
            invoice = await crud.update(invoice_id, InvoiceUpdateSchema(status=2, api_response=api_response_result))
            logger.warning(f"第三方开票API调用失败: invoice_no={invoice.invoice_no}, resp={api_response_result}")
            raise CustomException(msg=f"开票失败: {api_response_result}")

        invoice = await crud.update(
            invoice_id,
            InvoiceUpdateSchema(
                status=1,
                pdf_url=pdf_url or pdf_url_result,
                api_response=api_response or api_response_result,
            ),
        )
        logger.info(f"发票开具成功: invoice_no={invoice.invoice_no}")
        return InvoiceOutSchema.model_validate(invoice)

    @staticmethod
    async def _call_third_party_api(invoice) -> tuple[bool, str, str]:
        """第三方开票 API 存根

        对接百望云/票通等电子发票平台时替换此方法。
        开发模式下直接模拟成功，返回 PDF 路径。

        返回:
            (success: bool, pdf_url: str, api_response: str)
        """
        pdf_url = f"/static/invoice/{invoice.tenant_id}/{invoice.invoice_no}.pdf"
        api_response = '{"code":"SUCCESS","msg":"模拟开票成功","invoice_no":"' + invoice.invoice_no + '"}'
        return True, pdf_url, api_response

    @staticmethod
    async def void(auth: AuthSchema, invoice_id: int, data) -> InvoiceOutSchema:
        crud = InvoiceCRUD(auth)
        invoice = await crud.get(id=invoice_id)
        if not invoice:
            raise CustomException(msg="发票不存在")
        if invoice.status != 1:
            code_text = {0: "待开票", 2: "开票失败", 3: "已作废"}.get(invoice.status, "未知")
            raise CustomException(msg=f"仅已开票状态可作废，当前状态: {code_text}")
        description = getattr(data, "description", "") or ""
        invoice = await crud.update(invoice_id, InvoiceUpdateSchema(status=3, description=description))
        logger.info(f"发票作废: invoice_no={invoice.invoice_no}")
        return InvoiceOutSchema.model_validate(invoice)
