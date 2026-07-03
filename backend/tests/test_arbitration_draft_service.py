from types import SimpleNamespace

from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.api.v1.module_system.user.model import UserModel
from app.core.base_schema import AuthSchema
from app.core.base_model import MappedBase
from app.plugin.module_ai.arbitration.model import ArbitrationCaseModel, ArbitrationDraftModel
from app.plugin.module_ai.arbitration.schema import ArbitrationDraftRequestSchema
from app.plugin.module_ai.arbitration.service import ArbitrationDraftService


async def test_arbitration_draft_uses_case_input_and_profile_defaults() -> None:
    auth = AuthSchema(
        user=SimpleNamespace(
            name="张三",
            mobile="13800000000",
            company_name="深圳某电子厂",
            position_name="操作工",
            monthly_salary=8000,
            hire_date="2023-03-01",
            contract_type="劳动合同",
            social_insurance=False,
        )
    )
    data = ArbitrationDraftRequestSchema(
        respondent_name="深圳某电子厂",
        dispute_summary="公司拖欠 3 个月工资，并口头通知不用再来上班。",
        claims=["请求支付拖欠工资 24000 元", "请求支付违法解除赔偿金"],
        evidence_items=["劳动合同", "工资流水", "微信聊天记录"],
    )

    result = await ArbitrationDraftService(auth).generate_draft(data)

    assert result["title"] == "劳动人事争议仲裁申请书"
    assert "申请人：张三" in result["content"]
    assert "联系电话：13800000000" in result["content"]
    assert "被申请人：深圳某电子厂" in result["content"]
    assert "岗位为操作工" in result["content"]
    assert "工资标准为8000元/月" in result["content"]
    assert "合同签订情况为劳动合同" in result["content"]
    assert "社会保险缴纳情况为否" in result["content"]
    assert "1. 请求支付拖欠工资 24000 元；" in result["content"]
    assert "2. 请求支付违法解除赔偿金；" in result["content"]
    assert "1. 劳动合同" in result["content"]
    assert "身份证号：【待补充】" in result["content"]
    assert "人工核对" in result["risk_tips"][0]


async def test_arbitration_draft_ignores_invalid_position_text() -> None:
    auth = AuthSchema(
        user=SimpleNamespace(
            name="张三",
            mobile="13800000000",
            company_name="星河科技有限公司",
        )
    )
    data = ArbitrationDraftRequestSchema(
        respondent_name="星河科技有限公司",
        hire_date="2024-03-01",
        position_name="、工资标准及社保缴纳约定",
        monthly_salary=12000,
        contract_type="劳动合同",
        dispute_summary="公司拖欠工资。",
        claims=["请求支付拖欠工资"],
        evidence_items=["工资流水"],
    )

    result = await ArbitrationDraftService(auth).generate_draft(data)

    assert "岗位为、工资标准及社保缴纳约定" not in result["content"]
    assert "岗位【待补充】" in result["content"]
    assert "双方约定工资标准为12000元/月" in result["content"]


async def test_arbitration_draft_does_not_duplicate_evidence_items() -> None:
    auth = AuthSchema(user=SimpleNamespace(name="张三", company_name="星河科技有限公司"))
    service = ArbitrationDraftService(auth)
    case = {
        "claims": ["请求支付拖欠工资"],
        "evidence_items": ["01-劳动合同.docx：证明劳动关系存在"],
        "applicant_name": "张三",
        "respondent_name": "星河科技有限公司",
        "dispute_summary": "公司拖欠工资。",
        "monthly_salary": 12000,
    }
    analyses = [
        {
            "file_name": "01-劳动合同.docx",
            "summary": "证明劳动关系存在",
        }
    ]

    content = service._render_template(case=case, evidence_analyses=analyses)

    assert content.count("01-劳动合同.docx") == 1
    assert "1. 01-劳动合同.docx：证明劳动关系存在" in content


async def test_arbitration_draft_sanitizes_ai_markdown_output() -> None:
    content = ArbitrationDraftService._sanitize_ai_content(
        """
        # 劳动人事争议仲裁申请书

        **申请人：** test
        **性别：** 【待补充】
        - **身份证号：** 【待补充】
        """
    )

    assert "**" not in content
    assert "#" not in content
    assert "申请人： test" in content
    assert "性别： 【待补充】" in content
    assert "身份证号： 【待补充】" in content


async def test_arbitration_draft_persists_case_and_draft_history() -> None:
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(UserModel.metadata.create_all)

    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as db:
        auth = AuthSchema(
            db=db,
            tenant_id=1,
            user=SimpleNamespace(
                id=1,
                tenant_id=1,
                is_superuser=True,
                name="张三",
                mobile="13800000000",
                company_name="深圳某电子厂",
                position_name="操作工",
                monthly_salary=8000,
                hire_date="2023-03-01",
                contract_type="劳动合同",
                social_insurance=False,
            ),
        )
        data = ArbitrationDraftRequestSchema(
            case_title="张三欠薪争议",
            respondent_name="深圳某电子厂",
            dispute_summary="公司拖欠 3 个月工资，并口头通知不用再来上班。",
            claims=["请求支付拖欠工资 24000 元"],
            evidence_items=["劳动合同", "工资流水"],
        )

        result = await ArbitrationDraftService(auth).generate_draft(data)
        await db.commit()

        assert result["case_id"] is not None
        assert result["draft_id"] is not None
        cases = (await db.execute(select(ArbitrationCaseModel))).scalars().all()
        drafts = (await db.execute(select(ArbitrationDraftModel))).scalars().all()
        assert len(cases) == 1
        assert cases[0].case_title == "张三欠薪争议"
        assert cases[0].respondent_name == "深圳某电子厂"
        assert len(drafts) == 1
        assert drafts[0].case_id == cases[0].id
        assert "劳动人事争议仲裁申请书" in drafts[0].content

        history = await ArbitrationDraftService(auth).list_drafts(case_id=cases[0].id)
        assert history["total"] == 1
        assert history["items"][0]["id"] == drafts[0].id

        docx_bytes = await ArbitrationDraftService(auth).export_draft(draft_id=drafts[0].id, file_type="docx")
        pdf_bytes = await ArbitrationDraftService(auth).export_draft(draft_id=drafts[0].id, file_type="pdf")
        assert docx_bytes.startswith(b"PK")
        assert pdf_bytes.startswith(b"%PDF")

    await engine.dispose()
    MappedBase.metadata.remove(ArbitrationDraftModel.__table__)
    MappedBase.metadata.remove(ArbitrationCaseModel.__table__)
