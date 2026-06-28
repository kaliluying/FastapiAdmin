# Day 3: 证据管理 + 文书生成 - 详细演讲稿
> 当前版本更新说明（2026-06-27）：
> - 课堂主线以 `courseware/index.html` 和 `完整四天授课执行脚本.md` 为准。
> - 当前讲课顺序调整为：从零实现主线 → 四天逐日节奏 → 技术地图 → 答辩准备。
> - “从零实现”已补充前端最小页面路径：先静态、再 mock、再接接口。
> - Day4 中密码安全、第三方登录、接口限流作为扩展了解，不再作为学生必须完整实现的主任务。
> - 旧路径已统一迁移到当前骨架表达：`backend/app/plugin/module_ai/chat/*`、`backend/app/plugin/module_ai/knowledge/*`、`backend/app/core/*`。
> - 旧稿中较深的实现细节仅供讲师备课参考，课堂投屏优先使用网页课件。

---

## 🌅 上午课程（9:00-12:00）

---

### 开场和练习复盘（9:00-9:30，30分钟）

大家早上好！欢迎来到第三天的课程。

前两天我们完成了环境搭建、RAG 检索、提示词工程和实时对话功能。今天我们要实现证据管理和文书生成，这是劳动仲裁系统的核心业务功能。

#### 9:00-9:15 练习检查（15分钟）

**练习 1 完成情况**：

请完成以下功能测试的同学举手：
- ✅ WebSocket 聊天功能测试成功
- ✅ 诉求分析接口测试成功
- ✅ 成功率评估接口测试成功

（讲师记录完成情况）

**优秀案例展示**：

（选择 2-3 个测试效果好的同学分享）

"请这位同学分享一下，你测试的案例是什么？AI 的分析准确吗？"

#### 9:15-9:25 常见问题讲解（10分钟）

**问题 1：WebSocket 连接失败**

```
WebSocket connection to 'ws://localhost:8004/ai/chat/ws' failed
```

**原因和解决**：

```bash
# 原因 1：没有传 token
# 解决：
const token = localStorage.getItem('token');
const ws = new WebSocket(`ws://localhost:8004/ai/chat/ws?token=${token}`);

# 原因 2：token 过期
# 解决：重新登录获取新 token

# 原因 3：服务未启动
# 解决：检查后端服务
uv run main.py run --env=dev
```

讲师提醒：这里的 `8004` 是当前骨架默认端口，现场以 `.env` 或 `backend/app/config/setting.py` 中的 `SERVER_PORT` 为准；WebSocket 路径使用当前 AI 模块的 `/ai/chat/ws`。

**问题 2：流式响应收不到消息**

```python
# 检查点 1：streaming 参数
llm = ChatOpenAI(
    model=settings.OPENAI_MODEL  # 以配置为准,
    streaming=True  # ← 必须设为 True
)

# 检查点 2：使用 astream 而不是 invoke
# 错误：
response = await llm.ainvoke(messages)  # ❌ 一次性返回

# 正确：
async for chunk in llm.astream(messages):  # ✅ 流式返回
    yield chunk.content
```

**问题 3：JSON 解析失败**

```python
# 现象：
json.JSONDecodeError: Expecting value: line 1 column 1 (char 0)

# 原因：AI 输出了非 JSON 内容
# 输出示例："让我来分析一下... ```json {..."

# 解决：加强提示词约束
"仅返回一个JSON对象，不输出markdown、解释或任何额外文本"
"第一个字符必须是 {，最后一个字符必须是 }"
```

#### 9:25-9:30 今日课程预览（5分钟）

**上午内容**：
1. 文件上传处理（multipart/form-data）
2. 后台异步任务（BackgroundTasks）
3. 文件解析（PDF、Excel、图片）
4. AI 证据分析

**下午内容**：
1. Jinja2 模板引擎
2. 文书自动生成
3. PDF 导出
4. API 性能优化

**今天的目标**：
完成证据管理和文书生成两大功能模块！

---

### 第一部分：文件上传处理（9:30-10:30，60分钟）

#### 1.1 文件上传基础（15分钟）

**为什么需要文件上传？**

在劳动仲裁系统中，用户需要上传：
- 📄 劳动合同（PDF）
- 💰 工资流水（Excel）
- 📸 聊天记录截图（图片）
- 📧 邮件通知（PDF）
- 🏥 孕检报告（PDF）

**HTTP 文件上传原理**：

```
Content-Type: multipart/form-data

请求体：
------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="contract.pdf"
Content-Type: application/pdf

[二进制文件数据]
------WebKitFormBoundary
Content-Disposition: form-data; name="category"

LABOR_CONTRACT
------WebKitFormBoundary--
```

**FastAPI 文件上传**：

```python
# 简单示例
from fastapi import FastAPI, UploadFile, File

app = FastAPI()

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # 读取文件内容
    contents = await file.read()
    
    # 保存文件
    with open(f"uploads/{file.filename}", "wb") as f:
        f.write(contents)
    
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(contents)
    }
```

**UploadFile 对象属性**：

```python
file.filename          # 文件名
file.content_type      # MIME 类型（application/pdf）
file.file             # SpooledTemporaryFile 对象
await file.read()     # 读取内容（bytes）
await file.seek(0)    # 重置文件指针
await file.close()    # 关闭文件
```

#### 1.2 项目中的文件上传实现（25分钟）

**需求分析**：

上传证据时需要提供：
1. 证据分类（category_code）
2. 证据类型（evidence_code）
3. 文件（file）
4. 上下文说明（context_note，可选）
5. 发生时间（occurred_at，可选）

**数据模型**：

```python
# backend/app/plugin/module_ai/chat/schema.py
class Evidence(Base, table=True):
    """证据表"""
    __tablename__ = "evidence"
    
    evidence_id: str = Field(..., unique=True, description="证据唯一标识")
    user_id: int = Field(..., foreign_key="users.id")
    
    category_code: str = Field(..., description="证据分类")
    evidence_code: str = Field(..., description="证据类型")
    
    file_name: str = Field(..., description="文件名")
    file_path: str = Field(..., description="文件路径")
    file_size: int = Field(None, description="文件大小（字节）")
    
    status: str = Field("uploading", description="状态")
    # uploading → processing → completed / failed
    
    context_note: str = Field(None, description="上下文说明")
    occurred_at: date = Field(None, description="发生日期")
    
    analysis_result: dict = Field(None, sa_column=Column(JSON), description="AI分析结果")
    error_message: str = Field(None, description="错误信息")
```

**Controller 实现**：

打开 `backend/app/plugin/module_ai/chat/controller.py`，找到证据上传路由：

```python
@router.post("/evidences", name="上传证据")
async def create_evidence_controller(
    category_code: str = Form(..., description="证据分类代码"),
    evidence_code: str = Form(..., description="证据类型代码"),
    file: UploadFile = File(..., description="证据文件"),
    context_note: str = Form(None, description="上下文说明"),
    occurred_at: str = Form(None, description="发生日期 YYYY-MM-DD"),
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """上传证据文件
    
    支持的文件类型：
    - PDF（劳动合同、解除通知等）
    - 图片（JPG、PNG - 聊天记录截图等）
    - Excel（工资流水等）
    
    流程：
    1. 保存文件到磁盘
    2. 创建数据库记录（status=uploading）
    3. 后台任务：分析证据（status=processing → completed）
    """
    
    try:
        # === 步骤 1：验证文件类型 ===
        allowed_types = [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ]
        
        if file.content_type not in allowed_types:
            raise ExceptResponse(msg=f"不支持的文件类型: {file.content_type}")
        
        # === 步骤 2：验证文件大小（最大 10MB）===
        MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise ExceptResponse(msg="文件大小超过限制（最大 10MB）")
        
        await file.seek(0)  # 重置文件指针
        
        # === 步骤 3：生成文件路径 ===
        evidence_id = f"evt_{uuid4().hex[:12]}"
        file_ext = Path(file.filename).suffix
        
        # 文件存储路径：data/evidence_uploads/{user_id}/{evidence_id}/
        upload_dir = settings.BASE_DIR / "data" / "evidence_uploads" / str(current_user.id) / evidence_id
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = upload_dir / f"{evidence_id}{file_ext}"
        
        # === 步骤 4：保存文件 ===
        with open(file_path, "wb") as f:
            f.write(contents)
        
        logger.info(f"文件保存成功: {file_path}")
        
        # === 步骤 5：创建数据库记录 ===
        evidence = Evidence(
            evidence_id=evidence_id,
            user_id=current_user.id,
            category_code=category_code,
            evidence_code=evidence_code,
            file_name=file.filename,
            file_path=str(file_path),
            file_size=len(contents),
            status="uploading",
            context_note=context_note,
            occurred_at=occurred_at if occurred_at else None
        )
        
        db.add(evidence)
        db.commit()
        db.refresh(evidence)
        
        logger.info(f"证据记录创建成功: {evidence_id}")
        
        # === 步骤 6：添加后台任务（异步分析）===
        background_tasks.add_task(
            EvidenceService.process_evidence,
            db=db,
            evidence_id=evidence_id
        )
        
        return SuccessResponse(
            data={
                "evidence_id": evidence_id,
                "file_name": file.filename,
                "status": "processing",
                "message": "文件上传成功，正在后台分析"
            }
        )
        
    except Exception as e:
        logger.error(f"证据上传失败: {e}", exc_info=True)
        raise ExceptResponse(msg=f"上传失败: {str(e)}")
```

（逐步讲解代码，强调关键点）

**关键点讲解**：

1. **文件验证**
```python
# 为什么需要验证？
# - 安全：防止上传恶意文件（病毒、脚本）
# - 性能：限制文件大小
# - 功能：只处理支持的格式

# 验证方式
# 方式 1：MIME 类型（不完全可靠）
if file.content_type not in allowed_types:
    raise Exception("不支持的类型")

# 方式 2：文件扩展名
file_ext = Path(file.filename).suffix
if file_ext not in ['.pdf', '.jpg', '.png']:
    raise Exception("不支持的扩展名")

# 方式 3：文件头（magic number，最可靠）
import magic
mime = magic.from_buffer(contents, mime=True)
```

2. **文件存储路径设计**
```python
# 路径结构：
data/evidence_uploads/{user_id}/{evidence_id}/原始文件

# 为什么这样设计？
# - 按用户隔离（方便管理、删除）
# - 按证据 ID 隔离（避免文件名冲突）
# - 保留原始文件名（用户友好）

# 示例：
data/evidence_uploads/
├── 1/                          # 用户 1
│   ├── evt_abc123/
│   │   └── evt_abc123.pdf     # 劳动合同
│   └── evt_def456/
│       └── evt_def456.jpg     # 聊天截图
└── 2/                          # 用户 2
    └── evt_ghi789/
        └── evt_ghi789.xlsx    # 工资流水
```

3. **文件大小限制**
```python
# 为什么限制 10MB？
# - 前端上传体验（太大会超时）
# - 服务器内存（FastAPI 默认加载到内存）
# - 存储成本

# 如何设置？
# 方式 1：代码中检查（我们用的）
if len(contents) > MAX_FILE_SIZE:
    raise Exception("文件太大")

# 方式 2：Nginx 限制
# nginx.conf
client_max_body_size 10m;

# 方式 3：FastAPI 配置（中间件）
app.add_middleware(
    LimitUploadSize,
    max_upload_size=10 * 1024 * 1024
)
```

#### 1.3 后台异步任务（BackgroundTasks）（20分钟）

**为什么需要后台任务？**

```
场景：证据分析需要时间

同步方式（不推荐）：
用户上传文件 → 等待分析完成（30秒）→ 返回结果
❌ 用户体验差（长时间等待）
❌ 容易超时

异步方式（推荐）：
用户上传文件 → 立即返回（1秒）→ 后台分析 → 完成后更新状态
✅ 用户体验好（立即返回）
✅ 不会超时
```

**FastAPI BackgroundTasks**：

```python
from fastapi import BackgroundTasks

# 定义后台任务函数
def send_email(email: str, message: str):
    print(f"发送邮件到 {email}: {message}")
    time.sleep(5)  # 模拟耗时操作
    print("邮件发送完成")

# 在路由中使用
@app.post("/register")
async def register(
    email: str,
    background_tasks: BackgroundTasks
):
    # 立即返回
    background_tasks.add_task(send_email, email, "欢迎注册")
    return {"message": "注册成功，欢迎邮件将在后台发送"}
```

**项目中的后台任务**：

```python
# backend/app/plugin/module_ai/chat/service.py
class EvidenceService:
    
    @staticmethod
    async def process_evidence(db: Session, evidence_id: str):
        """后台处理证据（异步任务）
        
        流程：
        1. 更新状态为 processing
        2. 解析文件内容
        3. 调用 AI 分析
        4. 保存分析结果
        5. 更新状态为 completed
        """
        
        logger.info(f"开始处理证据: {evidence_id}")
        
        try:
            # === 步骤 1：查询证据记录 ===
            evidence = db.exec(
                select(Evidence).where(Evidence.evidence_id == evidence_id)
            ).first()
            
            if not evidence:
                logger.error(f"证据不存在: {evidence_id}")
                return
            
            # === 步骤 2：更新状态 ===
            evidence.status = "processing"
            db.commit()
            
            # === 步骤 3：解析文件内容 ===
            file_path = Path(evidence.file_path)
            
            if file_path.suffix == '.pdf':
                text = extract_text_from_pdf(file_path)
            elif file_path.suffix in ['.jpg', '.png']:
                text = extract_text_from_image(file_path)  # OCR
            elif file_path.suffix in ['.xls', '.xlsx']:
                text = extract_text_from_excel(file_path)
            else:
                raise Exception(f"不支持的文件格式: {file_path.suffix}")
            
            logger.debug(f"文件解析成功，文本长度: {len(text)}")
            
            # === 步骤 4：AI 分析 ===
            analysis = await ai_util.analyze_evidence(
                evidence_type=evidence.evidence_code,
                content=text,
                context_note=evidence.context_note
            )
            
            logger.info(f"AI 分析完成: {evidence_id}")
            
            # === 步骤 5：保存结果 ===
            evidence.status = "completed"
            evidence.analysis_result = analysis
            db.commit()
            
            logger.info(f"证据处理完成: {evidence_id}")
            
        except Exception as e:
            logger.error(f"证据处理失败: {evidence_id}, {e}", exc_info=True)
            
            # 更新为失败状态
            evidence.status = "failed"
            evidence.error_message = str(e)
            db.commit()
```

（讲解后台任务的完整流程）

**注意事项**：

```python
# 1. 后台任务与数据库会话
# 问题：BackgroundTasks 在响应返回后执行，原 db 会话可能已关闭

# 错误示例：
background_tasks.add_task(process_evidence, db, evidence_id)
# db 会话在响应后关闭，后台任务中使用会报错

# 正确方式：在后台任务中创建新会话
def process_evidence(evidence_id: str):
    with Session(engine) as db:  # 新会话
        # 处理逻辑
        pass

# 2. 异常处理
# 后台任务的异常不会返回给客户端，必须捕获并记录
try:
    # 处理逻辑
except Exception as e:
    logger.error(f"后台任务失败: {e}")
    # 更新数据库状态为 failed

# 3. 长时间任务
# BackgroundTasks 适合短任务（< 1分钟）
# 长任务建议使用 Celery
```

---

### 🕚 休息（10:30-10:40，10分钟）

---

### 第二部分：文件解析和 AI 分析（10:40-12:00，80分钟）

#### 2.1 PDF 文件解析（20分钟）

**PDF 解析库选择**：

```python
# 常用 PDF 库对比

# 1. PyPDF2（纯 Python）
# - 优点：纯 Python，安装简单
# - 缺点：对复杂 PDF 支持差

# 2. pdfplumber
# - 优点：表格提取好
# - 缺点：依赖多

# 3. pypdf（当前依赖）
# - 优点：基于 Google PDFium，支持好
# - 缺点：二进制依赖

# 4. pymupdf (fitz)
# - 优点：功能强大，速度快
# - 缺点：License 限制（AGPL）
```

**pypdf 使用示例**：

```python
# utils/file_parser.py
from pypdf import PdfReader

def extract_text_from_pdf(file_path: Path) -> str:
    """从 PDF 提取文本
    
    Args:
        file_path: PDF 文件路径
        
    Returns:
        提取的文本内容
    """
    try:
        pdf = pdfium.PdfDocument(str(file_path))
        
        all_text = []
        for page_num in range(len(pdf)):
            page = pdf[page_num]
            textpage = page.get_textpage()
            text = textpage.get_text_range()
            all_text.append(text)
            
            textpage.close()
            page.close()
        
        pdf.close()
        
        full_text = "\n\n".join(all_text)
        return full_text
        
    except Exception as e:
        logger.error(f"PDF 解析失败: {e}")
        raise Exception(f"PDF 文件解析失败: {str(e)}")
```

**测试 PDF 解析**：

```python
# test_pdf_parser.py
from utils.file_parser import extract_text_from_pdf
from pathlib import Path

pdf_file = Path("test_data/劳动合同.pdf")
text = extract_text_from_pdf(pdf_file)

print(f"提取文本长度: {len(text)}")
print(f"前 500 字符:\n{text[:500]}")
```

#### 2.2 Excel 文件解析（15分钟）

**使用 openpyxl**：

```python
# utils/file_parser.py
import openpyxl

def extract_text_from_excel(file_path: Path) -> str:
    """从 Excel 提取文本
    
    将 Excel 表格内容转为文本格式
    """
    try:
        workbook = openpyxl.load_workbook(file_path)
        
        all_text = []
        for sheet_name in workbook.sheetnames:
            sheet = workbook[sheet_name]
            all_text.append(f"===工作表: {sheet_name}===\n")
            
            for row in sheet.iter_rows(values_only=True):
                row_text = "\t".join([str(cell) if cell is not None else "" for cell in row])
                all_text.append(row_text)
        
        workbook.close()
        
        full_text = "\n".join(all_text)
        return full_text
        
    except Exception as e:
        logger.error(f"Excel 解析失败: {e}")
        raise Exception(f"Excel 文件解析失败: {str(e)}")
```

#### 2.3 图片 OCR（可选，10分钟）

**OCR 识别库**：

```python
# 常用 OCR 库

# 1. OCR（选做，需另装 OCR 工具）
# - 开源免费
# - 识别率一般
# - 需要安装 Tesseract 引擎

# 2. PaddleOCR（推荐）
# - 百度开源
# - 中文识别率高
# - 纯 Python

# 3. 云服务（腾讯、阿里、百度 OCR API）
# - 识别率最高
# - 收费
```

简单示例（使用 pytesseract）：

```python
# utils/file_parser.py
# OCR 为选做，需另装 OCR 工具
from PIL import Image

def extract_text_from_image(file_path: Path) -> str:
    """从图片提取文本（OCR）"""
    try:
        image = Image.open(file_path)
        text = ocr_text = "按实际 OCR 工具返回文本"
        return text
    except Exception as e:
        logger.error(f"OCR 失败: {e}")
        return ""  # OCR 失败返回空字符串，不影响主流程
```

#### 2.4 AI 证据分析（35分钟）

**分析目标**：

从证据文件中提取：
1. 证据类型识别
2. 证据效力评估（高/中/低）
3. 关键信息提取
4. 改进建议

**提示词设计**：

```python
# backend/app/plugin/module_ai/chat/rag.py

EVIDENCE_ANALYSIS_PROMPT = """
你是一位资深劳动法律师，负责分析证据文件。

任务：
1. 识别证据类型（劳动合同/工资流水/解除通知/聊天记录等）
2. 评估证据效力（高/中/低）
3. 提取关键信息（合同期限、工资金额、时间节点等）
4. 给出改进建议

输入：
证据类型：{evidence_type}
文件内容：
{content}

上下文说明：{context_note}

输出格式（JSON）：
{{
  "evidence_type_detected": string,
  "effectiveness": "高" | "中" | "低",
  "key_info": {{
    "关键字段1": "值1",
    "关键字段2": "值2"
  }},
  "suggestions": [string, string, string]
}}

约束：
- 仅返回 JSON，不输出其他内容
- effectiveness 必须是"高"、"中"或"低"
- suggestions 必须具体可操作，不要空泛建议
"""

async def analyze_evidence(
    evidence_type: str,
    content: str,
    context_note: str = None
) -> dict:
    """AI 分析证据"""
    
    llm = ChatOpenAI(
        model=settings.OPENAI_MODEL,
        temperature=0.3
    )
    
    prompt = EVIDENCE_ANALYSIS_PROMPT.format(
        evidence_type=evidence_type,
        content=content[:2000],  # 限制长度
        context_note=context_note or "无"
    )
    
    messages = [
        SystemMessage(content=prompt)
    ]
    
    response = await llm.ainvoke(messages)
    result = parse_llm_json_response(response.content)
    
    return result
```

**测试证据分析**：

```python
# test_evidence_analysis.py
from utils.ai_util import analyze_evidence
import asyncio

content = """
劳动合同

甲方（用人单位）：北京XX科技有限公司
乙方（劳动者）：张三
身份证号：110***

双方于2019年1月1日签订本劳动合同，合同期限为5年，至2024年1月1日止。

工作岗位：产品经理
工作地点：北京市朝阳区XX路XX号
月工资：8000元（税前）

...
"""

result = asyncio.run(analyze_evidence(
    evidence_type="LABOR_CONTRACT",
    content=content,
    context_note="这是我的劳动合同原件"
))

print(result)
```

期望输出：

```json
{
  "evidence_type_detected": "劳动合同",
  "effectiveness": "高",
  "key_info": {
    "公司名称": "北京XX科技有限公司",
    "劳动者姓名": "张三",
    "合同期限": "2019-01-01 至 2024-01-01",
    "工作岗位": "产品经理",
    "月工资": "8000元"
  },
  "suggestions": [
    "该证据可有效证明劳动关系存在",
    "建议补充工资流水作为工资金额的佐证",
    "如需证明工作年限，建议保留社保缴纳记录"
  ]
}
```

---

### 上午总结（12:00，5分钟）

**上午完成的内容**：
✅ 文件上传处理（multipart/form-data）
✅ 后台异步任务（BackgroundTasks）
✅ 文件解析（PDF、Excel、图片 OCR）
✅ AI 证据分析

**重点回顾**：
1. 文件上传需要验证类型和大小
2. 后台任务用于耗时操作，提升用户体验
3. 不同格式文件使用不同解析库
4. AI 分析需要设计专业的提示词

**下午预告**：
- Jinja2 模板引擎
- 文书自动生成
- PDF 导出
- API 性能优化

中午休息，14:00 见！

---

## 讲师增强版：Day3 下午与完整收尾口径

Day3 的主线是把“咨询回答”推进到“证据链和文书草稿”。讲师要明确：证据管理不是文件上传页面，文书生成也不是让模型随便写一篇文章。真正的业务闭环是事实、证据、请求、法律依据和文书结构之间能互相对应。

### 1. 下午开场话术（14:00-14:10）

> 上午我们解决了材料怎么进入系统、怎么解析、怎么初步分析。下午要做的是把这些材料组织成一个劳动仲裁案件能用的结构：有哪些事实，哪些证据能证明，诉求怎么写，文书如何生成。

板书：

```text
原始文件 -> 证据信息 -> 证明目的 -> 仲裁请求 -> 文书草稿 -> 人工复核
```

### 2. 证据链讲解（14:10-14:50）

继续使用张三案例：

| 事实 | 可用证据 | 证明目的 |
|---|---|---|
| 张三与公司存在劳动关系 | 劳动合同、社保记录、工资流水 | 证明双方存在劳动关系 |
| 张三工作 5 年 | 劳动合同期限、社保缴纳记录、入职邮件 | 证明工作年限 |
| 公司单方解除 | 微信通知、邮件通知、录音、离职系统截图 | 证明解除事实 |
| 月工资 8000 元 | 工资流水、个税记录、工资条 | 证明补偿计算基数 |

讲师话术：

> 证据不是“上传越多越好”。每份证据都要回答两个问题：它证明什么？它和诉求有什么关系？如果一份材料不能支撑事实或诉求，它在文书里就没有价值。

课堂互动：

> 如果张三只有口头通知，没有书面解除通知，应该补哪些证据？期望回答：聊天记录、录音、考勤异常、公司系统状态、同事证言等。

### 3. 文书生成讲解（14:50-15:40）

文书生成建议按固定结构讲：

```text
标题
申请人/被申请人
仲裁请求
事实与理由
证据清单
风险和待补充信息
```

仲裁请求示例：

```text
1. 请求确认被申请人解除劳动合同违法。
2. 请求被申请人支付违法解除劳动合同赔偿金。
3. 请求被申请人支付拖欠工资或其他应付款项。
```

讲师提醒：

> 文书生成不是一次性生成最终稿。AI 生成的是草稿，必须让人检查事实、金额、主体信息、请求是否过度、证据是否能支撑。

### 4. Prompt 设计重点（15:50-16:40）

证据和文书类 Prompt 要比普通问答更严格：

```text
你是劳动仲裁文书辅助助手。
请基于用户事实和证据清单生成仲裁申请书草稿。
要求：
1. 不得编造姓名、金额、日期、证据。
2. 事实不足处标注“需补充”。
3. 仲裁请求必须能被证据或法律依据支撑。
4. 输出包含：仲裁请求、事实与理由、证据清单、风险提示。
5. 文书仅为草稿，需人工复核。
```

对比讲法：

- 宽松 Prompt 容易编出不存在的证据。
- 严格 Prompt 会把不确定处标出来。
- 法律场景宁可提示“需补充”，不要自作主张补全事实。

### 5. 导出与格式化讲解（16:40-17:20）

如果演示文书导出，讲清三个层次：

| 层次 | 说明 |
|---|---|
| 数据层 | 用户事实、证据、请求、法律依据。 |
| 模板层 | 文书固定结构和段落占位。 |
| 导出层 | Markdown、Word、PDF 等呈现形式。 |

讲师话术：

> 好的文书生成系统，不应该把业务逻辑写死在一个大 Prompt 里。事实、证据、模板和导出要分层，这样后面才能替换模板、调整格式、复用证据。

### 6. Day3 课堂验收标准（17:20-18:00）

学生结束前要能完成：

- 上传或选择一组证据材料。
- 说明每份证据证明什么事实。
- 让 AI 输出一份结构化证据分析。
- 生成一份仲裁申请书草稿。
- 标出草稿中哪些信息来自用户输入，哪些信息来自证据，哪些地方需要补充。
- 说清楚 AI 文书为什么必须人工复核。

收尾话术：

> 到今天为止，系统已经从“能回答问题”推进到“能整理证据、生成文书草稿”。明天我们要解决最后两个问题：谁能访问这些能力，以及如何把四天成果讲清楚、演示出来。

