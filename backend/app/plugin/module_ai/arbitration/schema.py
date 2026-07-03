from __future__ import annotations

from pydantic import BaseModel, Field, field_validator


class ArbitrationDraftRequestSchema(BaseModel):
    """Generate an arbitration application draft."""

    case_id: int | None = Field(None, description="已有案件 ID；为空时创建新案件")
    case_title: str | None = Field(None, description="案件标题")
    session_id: str | None = Field(None, description="关联聊天会话 ID，可用于读取证据分析结果")
    arbitration_committee: str | None = Field(None, description="劳动人事争议仲裁委员会名称")

    applicant_name: str | None = Field(None, description="申请人姓名")
    applicant_gender: str | None = Field(None, description="申请人性别")
    applicant_id_no: str | None = Field(None, description="申请人身份证号")
    applicant_phone: str | None = Field(None, description="申请人联系电话")
    applicant_address: str | None = Field(None, description="申请人住址")

    respondent_name: str | None = Field(None, description="被申请人名称")
    respondent_credit_code: str | None = Field(None, description="统一社会信用代码")
    respondent_address: str | None = Field(None, description="被申请人住所地")
    respondent_legal_rep: str | None = Field(None, description="法定代表人")
    respondent_phone: str | None = Field(None, description="被申请人联系电话")

    hire_date: str | None = Field(None, description="入职日期")
    leave_date: str | None = Field(None, description="离职日期")
    position_name: str | None = Field(None, description="岗位")
    work_location: str | None = Field(None, description="工作地点")
    monthly_salary: float | None = Field(None, description="月工资")
    contract_type: str | None = Field(None, description="合同类型")
    social_insurance: bool | None = Field(None, description="是否缴纳社保")

    dispute_summary: str = Field(..., min_length=1, description="争议事实概述")
    claims: list[str] = Field(default_factory=list, description="仲裁请求")
    evidence_items: list[str] = Field(default_factory=list, description="证据清单")
    use_ai: bool = Field(False, description="是否调用大模型润色生成；默认用稳定模板生成")

    @field_validator("claims", "evidence_items")
    @classmethod
    def strip_list_items(cls, values: list[str]) -> list[str]:
        return [item.strip() for item in values if item and item.strip()]


class ArbitrationDraftOutSchema(BaseModel):
    case_id: int | None = Field(None, description="案件 ID")
    draft_id: int | None = Field(None, description="草稿 ID")
    title: str = Field(description="文书标题")
    content: str = Field(description="申请书草稿正文")
    risk_tips: list[str] = Field(description="风险提示")
    source_summary: dict[str, object] = Field(description="生成来源摘要")


class ArbitrationCaseOutSchema(BaseModel):
    id: int
    case_title: str
    respondent_name: str | None = None
    applicant_name: str | None = None
    dispute_summary: str
    session_id: str | None = None
    created_time: str | None = None
    updated_time: str | None = None


class ArbitrationDraftListItemSchema(BaseModel):
    id: int
    case_id: int
    session_id: str | None = None
    title: str
    review_status: str
    used_ai: bool
    created_time: str | None = None
    updated_time: str | None = None
