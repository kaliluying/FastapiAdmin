"""发票管理 Schema"""
from pydantic import BaseModel, ConfigDict, Field

from app.core.base_schema import BaseSchema


class InvoiceCreateSchema(BaseModel):
    """创建发票（内部使用）"""
    invoice_no: str
    order_id: int
    tenant_id: int
    invoice_type: str
    title: str
    tax_no: str | None = None
    bank_info: str | None = None
    address_info: str | None = None
    amount: int
    tax_amount: int = 0
    status: int = 0
    description: str | None = None


class InvoiceUpdateSchema(BaseModel):
    """更新发票（内部使用）"""
    status: int | None = None
    pdf_url: str | None = None
    api_response: str | None = None
    description: str | None = None


class InvoiceApplySchema(BaseModel):
    """申请开票"""
    order_id: int = Field(..., description="订单ID")
    invoice_type: str = Field(..., description="vat_normal/vat_special")
    title: str = Field(..., max_length=200, description="发票抬头")
    tax_no: str | None = Field(None, max_length=50, description="纳税人识别号")
    bank_info: str | None = Field(None, description="开户行及账号")
    address_info: str | None = Field(None, description="注册地址及电话")
    description: str | None = Field(None, description="备注")


class InvoiceIssueSchema(BaseModel):
    """超管开票"""
    api_response: str | None = Field(None, description="第三方API响应（手动填入）")
    pdf_url: str | None = Field(None, description="PDF下载地址")


class InvoiceVoidSchema(BaseModel):
    """作废发票"""
    description: str | None = Field(None, description="作废原因")


class InvoiceOutSchema(BaseSchema):
    """发票列表输出"""
    invoice_no: str
    order_id: int
    tenant_id: int
    invoice_type: str
    title: str
    tax_no: str | None = None
    bank_info: str | None = None
    address_info: str | None = None
    amount: int
    tax_amount: int
    pdf_url: str | None = None

    model_config = ConfigDict(from_attributes=True)


class InvoiceQueryParam(BaseModel):
    """发票查询参数"""
    invoice_type: str | None = Field(None, description="发票类型")
    status: int | None = Field(None, description="状态")
    tenant_id: int | None = Field(None, description="租户ID")
    page_no: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
