# Day 3 下午课程 - 文书生成详细内容
> 当前版本更新说明（2026-06-27）：
> - 课堂主线以 `courseware/index.html` 和 `完整四天授课执行脚本.md` 为准。
> - 当前讲课顺序调整为：从零实现主线 → 四天逐日节奏 → 技术地图 → 答辩准备。
> - “从零实现”已补充前端最小页面路径：先静态、再 mock、再接接口。
> - Day4 中密码安全、第三方登录、接口限流作为扩展了解，不再作为学生必须完整实现的主任务。
> - 旧路径已统一迁移到当前骨架表达：`backend/app/plugin/module_ai/chat/*`、`backend/app/plugin/module_ai/knowledge/*`、`backend/app/core/*`。
> - 旧稿中较深的实现细节仅供讲师备课参考，课堂投屏优先使用网页课件。

---

## 🌆 下午课程（14:00-18:00）

---

### 第三部分：Jinja2 模板引擎（14:00-15:20，80分钟）

#### 3.1 Jinja2 基础概念（20分钟）

**什么是模板引擎？**

模板引擎用于分离内容和展示：
- 内容：数据（用户信息、案件信息等）
- 展示：HTML 结构、格式

**为什么需要模板？**

```python
# 不用模板（硬编码）
def generate_document(user_name, company_name, amount):
    html = f"""
    <h1>劳动仲裁申请书</h1>
    <p>申请人：{user_name}</p>
    <p>被申请人：{company_name}</p>
    <p>请求赔偿：{amount}元</p>
    """
    return html
# ❌ 难以维护，格式固定

# 使用模板
template = """
<h1>{{ document_title }}</h1>
<p>申请人：{{ user_name }}</p>
<p>被申请人：{{ company_name }}</p>
<p>请求赔偿：{{ amount }}元</p>
"""
# ✅ 易于维护，格式灵活
```

**Jinja2 核心语法**：

```jinja2
{# 1. 变量输出 #}
{{ user_name }}

{# 2. 条件判断 #}
{% if amount > 10000 %}
  金额较大
{% else %}
  金额一般
{% endif %}

{# 3. 循环 #}
{% for evidence in evidence_list %}
  - {{ evidence }}
{% endfor %}

{# 4. 过滤器 #}
{{ amount | format_currency }}  {# 格式化为货币 #}
{{ text | truncate(100) }}      {# 截取前100字符 #}

{# 5. 注释 #}
{# 这是注释，不会渲染 #}
```

**快速示例**：

```python
# 示例代码
from jinja2 import Template

template_str = """
劳动仲裁申请书

申请人：{{ applicant.name }}
性别：{{ applicant.gender }}
住址：{{ applicant.address }}

被申请人：{{ respondent.name }}

仲裁请求：
{% for request in requests %}
{{ loop.index }}. {{ request }}
{% endfor %}

事实与理由：
{{ facts_and_reasons }}
"""

template = Template(template_str)

# 渲染
result = template.render(
    applicant={
        'name': '张三',
        'gender': '女',
        'address': '北京市朝阳区...'
    },
    respondent={'name': 'XX科技公司'},
    requests=[
        '要求支付违法解除劳动合同赔偿金80,000元',
        '要求支付拖欠工资12,000元'
    ],
    facts_and_reasons='申请人于2019年...'
)

print(result)
```

#### 3.2 文书模板设计（30分钟）

**劳动仲裁申请书模板结构**：

```
1. 标题
2. 申请人信息
3. 被申请人信息
4. 仲裁请求
5. 事实与理由
6. 证据清单
7. 法律依据
8. 此致
9. 申请人签名
10. 日期
```

**创建模板文件**：

```bash
# 创建模板目录
mkdir -p templates/documents

# 创建模板文件
touch templates/documents/arbitration_application.html
```

**模板内容**（`templates/documents/arbitration_application.html`）：

```jinja2
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>劳动仲裁申请书</title>
    <style>
        body {
            font-family: "SimSun", serif;
            font-size: 14px;
            line-height: 1.8;
            margin: 40px;
        }
        h1 {
            text-align: center;
            font-size: 22px;
            margin-bottom: 30px;
        }
        .section {
            margin-bottom: 20px;
        }
        .section-title {
            font-weight: bold;
            margin-bottom: 10px;
        }
        .indent {
            text-indent: 2em;
        }
        .signature {
            text-align: right;
            margin-top: 40px;
        }
    </style>
</head>
<body>
    <h1>劳动仲裁申请书</h1>
    
    {# 申请人信息 #}
    <div class="section">
        <div class="section-title">申请人信息：</div>
        <p>姓名：{{ applicant.name }}</p>
        <p>性别：{{ applicant.gender }}</p>
        <p>身份证号：{{ applicant.id_card }}</p>
        <p>联系电话：{{ applicant.phone }}</p>
        <p>住址：{{ applicant.address }}</p>
    </div>
    
    {# 被申请人信息 #}
    <div class="section">
        <div class="section-title">被申请人信息：</div>
        <p>名称：{{ respondent.name }}</p>
        <p>地址：{{ respondent.address }}</p>
        <p>法定代表人：{{ respondent.legal_representative }}</p>
    </div>
    
    {# 仲裁请求 #}
    <div class="section">
        <div class="section-title">仲裁请求：</div>
        {% for request in arbitration_requests %}
        <p>{{ loop.index }}. {{ request }}</p>
        {% endfor %}
    </div>
    
    {# 事实与理由 #}
    <div class="section">
        <div class="section-title">事实与理由：</div>
        {% for paragraph in facts_and_reasons %}
        <p class="indent">{{ paragraph }}</p>
        {% endfor %}
    </div>
    
    {# 证据清单 #}
    <div class="section">
        <div class="section-title">证据清单：</div>
        {% for evidence in evidence_list %}
        <p>{{ loop.index }}. {{ evidence.name }}，证明目的：{{ evidence.purpose }}</p>
        {% endfor %}
    </div>
    
    {# 法律依据 #}
    <div class="section">
        <div class="section-title">法律依据：</div>
        {% for law in legal_basis %}
        <p>{{ loop.index }}. 《{{ law.law_name }}》第{{ law.article }}条：{{ law.article_text }}</p>
        {% endfor %}
    </div>
    
    {# 结尾 #}
    <div class="section">
        <p>此致</p>
        <p>{{ arbitration_committee }}劳动争议仲裁委员会</p>
    </div>
    
    {# 签名 #}
    <div class="signature">
        <p>申请人：{{ applicant.name }}</p>
        <p>日期：{{ application_date }}</p>
    </div>
</body>
</html>
```

#### 3.3 文书生成实现（30分钟）

**Service 层实现**：

```python
# backend/app/plugin/module_ai/chat/service.py
from jinja2 import Environment, FileSystemLoader

class DocumentService:
    
    @staticmethod
    async def generate_arbitration_application(
        db: Session,
        user: User,
        data: ArbitrationApplicationData
    ):
        """生成劳动仲裁申请书
        
        Args:
            db: 数据库会话
            user: 当前用户
            data: 文书数据
            
        Returns:
            生成的文档记录
        """
        
        logger.info(f"开始生成文书: user={user.id}")
        
        try:
            # === 步骤 1：AI 生成内容补充 ===
            # 用 AI 扩写"事实与理由"部分
            facts_paragraphs = await ai_util.generate_facts_and_reasons(
                rights_claim=data.rights_claim,
                case_summary=data.case_summary,
                evidence_list=[e.dict() for e in data.evidence_list]
            )
            
            # === 步骤 2：准备模板数据 ===
            template_data = {
                'applicant': {
                    'name': data.applicant_name,
                    'gender': data.applicant_gender,
                    'id_card': data.applicant_id_card,
                    'phone': data.applicant_phone,
                    'address': data.applicant_address
                },
                'respondent': {
                    'name': data.respondent_name,
                    'address': data.respondent_address,
                    'legal_representative': data.respondent_legal_rep
                },
                'arbitration_requests': data.arbitration_requests,
                'facts_and_reasons': facts_paragraphs,
                'evidence_list': [e.dict() for e in data.evidence_list],
                'legal_basis': [b.dict() for b in data.legal_basis],
                'arbitration_committee': data.arbitration_committee,
                'application_date': datetime.now().strftime('%Y年%m月%d日')
            }
            
            # === 步骤 3：加载模板 ===
            env = Environment(
                loader=FileSystemLoader('templates/documents')
            )
            template = env.get_template('arbitration_application.html')
            
            # === 步骤 4：渲染模板 ===
            html_content = template.render(**template_data)
            
            # === 步骤 5：保存数据库记录 ===
            document_id = f"doc_{uuid4().hex[:12]}"
            
            document = Document(
                document_id=document_id,
                user_id=user.id,
                document_type="arbitration_application",
                title="劳动仲裁申请书",
                content=html_content,
                status="completed",
                metadata=template_data
            )
            
            db.add(document)
            db.commit()
            db.refresh(document)
            
            logger.info(f"文书生成成功: {document_id}")
            
            return document
            
        except Exception as e:
            logger.error(f"文书生成失败: {e}", exc_info=True)
            raise Exception(f"文书生成失败: {str(e)}")
```

**Controller 实现**：

```python
# backend/app/plugin/module_ai/chat/controller.py
@router.post("/documents/arbitration-application", name="生成劳动仲裁申请书")
async def generate_arbitration_application_controller(
    data: ArbitrationApplicationData,
    current_user: CurrentUser,
    db: Session = Depends(get_db)
):
    """生成劳动仲裁申请书"""
    
    try:
        document = await DocumentService.generate_arbitration_application(
            db=db,
            user=current_user,
            data=data
        )
        
        return SuccessResponse(
            data={
                "document_id": document.document_id,
                "title": document.title,
                "status": document.status,
                "preview_url": f"/api/documents/{document.document_id}/preview"
            }
        )
        
    except Exception as e:
        logger.error(f"生成申请书失败: {e}", exc_info=True)
        raise ExceptResponse(msg=str(e))
```

---

### 第四部分：API 性能优化和项目总结（15:30-18:00，150分钟）

#### 4.1 响应压缩（20分钟）

**为什么需要压缩？**

```
原始 JSON 响应：50 KB
Gzip 压缩后：8 KB
节省：84% 带宽

优势：
✅ 减少传输时间
✅ 节省带宽成本
✅ 提升用户体验
```

**FastAPI 添加压缩中间件**：

```python
# main.py
from fastapi.middleware.gzip import GZipMiddleware

app = FastAPI()

# 添加 Gzip 压缩（超过 1KB 的响应会被压缩）
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

#### 4.2 数据库连接池优化（15分钟）

```python
# backend/app/core/database.py

# 优化前
engine = create_engine(database_url)

# 优化后
engine = create_engine(
    database_url,
    pool_size=10,          # 连接池大小
    max_overflow=20,       # 最大溢出连接数
    pool_pre_ping=True,    # 自动检测死连接
    pool_recycle=3600,     # 每小时回收连接
    echo=False             # 生产环境关闭 SQL 日志
)
```

#### 4.3 异常处理统一（15分钟）

```python
# core/exception.py

# 统一异常响应格式
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"全局异常: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "code": 500,
            "msg": "服务器内部错误",
            "data": None
        }
    )
```

#### 4.4 日志追踪（15分钟）

```python
# core/middlewares.py

# 请求日志中间件
@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = str(uuid4())
    
    logger.info(f"[{request_id}] {request.method} {request.url}")
    
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    logger.info(f"[{request_id}] 完成，耗时: {duration:.3f}s")
    
    response.headers["X-Request-ID"] = request_id
    return response
```

#### 4.5 项目演示和答辩准备（45分钟）

**演示要点**：
1. 项目整体介绍（2分钟）
2. 核心功能演示（5分钟）
   - AI 智能咨询
   - 维权诉求分析
   - 证据管理
   - 文书生成
3. 技术亮点讲解（3分钟）
   - RAG 检索边界
   - 提示词工程
   - WebSocket 流式响应
   - 异步任务处理

**常见答辩问题**：
1. RAG 和纯 LLM 的区别？
2. 为什么选择检索边界？
3. 如何保证 AI 输出的准确性？
4. 如何处理并发请求？
5. 如何保证数据安全？

#### 4.6 练习和总结（40分钟）

**练习**：
1. 完善文书模板样式
2. 添加更多文书类型
3. 优化 AI 提示词
4. 准备项目答辩 PPT

**三天总结**：
✅ Day 1: 环境搭建、向量知识库
✅ Day 2: RAG 检索、提示词、实时对话
✅ Day 3: 证据管理、文书生成

---

### 讲师备注

**Day 3 重点**：
- 文件上传和处理
- 后台异步任务
- 模板引擎使用

**教学建议**：
- 文件上传演示要清晰
- Jinja2 语法多举例
- 给学生充分实操时间

---

**Day 3 演讲稿完成！**

