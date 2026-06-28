# AI 劳动仲裁辅助系统 - 完整讲解文档
> 当前版本更新说明（2026-06-27）：
> - 课堂主线以 `courseware/index.html` 和 `完整四天授课执行脚本.md` 为准。
> - 当前讲课顺序调整为：从零实现主线 → 四天逐日节奏 → 技术地图 → 答辩准备。
> - “从零实现”已补充前端最小页面路径：先静态、再 mock、再接接口。
> - Day4 中密码安全、第三方登录、接口限流作为扩展了解，不再作为学生必须完整实现的主任务。
> - 旧路径已统一迁移到当前骨架表达：`backend/app/plugin/module_ai/chat/*`、`backend/app/plugin/module_ai/knowledge/*`、`backend/app/core/*`。
> - 旧稿中较深的实现细节仅供讲师备课参考，课堂投屏优先使用网页课件。

---

## 📚 文档说明

本文档基于 AI 劳动仲裁辅助系统项目，结合四天实训方案，提供详细的技术讲解、架构剖析和实战指导。适用于项目演示、技术答辩和教学培训。

**文档版本**: v1.0  
**更新时间**: 2026-06-13  
**适用人群**: AI 开发学员、项目实训讲师、技术评审专家

---

## 🎯 项目概览

### 项目定位

AI 劳动仲裁辅助系统 是一个**企业级 AI 赋能的劳动仲裁辅助平台**，专注于解决劳动者维权难、法律咨询贵、文书制作复杂等实际问题。项目采用前后端分离架构，核心亮点在于：

- ✅ **AI 智能问答**: 基于 RAG 技术的法律咨询对话系统
- ✅ **智能风险评估**: AI 分析维权诉求，预测胜诉概率
- ✅ **文书自动生成**: 一键生成劳动仲裁申请书等法律文书
- ✅ **证据智能管理**: 自动分析证据效力，生成证据清单
- ✅ **向量知识库**: 语义检索劳动法规，精准匹配法条

### 技术特色

1. **AI 原生设计**: 全流程 AI 赋能，非传统 CRUD 项目
2. **企业级架构**: 分层设计、依赖注入、统一异常处理
3. **现代化技术栈**: Python 3.12、FastAPI、LangChain、ChromaDB
4. **生产级部署**: JWT 认证、扩展了解：接口限流、日志追踪、异步处理

---

## 🏗️ 系统架构详解

### 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                    客户端层                              │
│         Vue3 前端页面 / 管理后台 / H5 页面                │
└─────────────────────────────────────────────────────────┘
                        ↓ HTTPS / WebSocket
┌─────────────────────────────────────────────────────────┐
│                   API 网关层                             │
│  • 扩展了解：接口限流（60秒/30次）                                  │
│  • 请求日志追踪（Request ID）                             │
│  • CORS 跨域处理                                         │
│  • 响应压缩（GZip）                                       │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                   业务逻辑层                             │
│  ┌─────────────┬─────────────┬─────────────────────┐   │
│  │  用户服务   │  AI 服务    │  证据/文书服务       │   │
│  │  UserService│ AIService   │ EvidenceService      │   │
│  └─────────────┴─────────────┴─────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                   AI 引擎层（核心）                       │
│  ┌────────────────────────────────────────────────┐    │
│  │  LangChain 编排引擎                             │    │
│  │  • RAG 检索增强生成                              │    │
│  │  • 提示词工程（Prompt Engineering）             │    │
│  │  • 会话记忆管理（Memory）                        │    │
│  │  • 流式响应（Streaming）                        │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                   数据存储层                             │
│  ┌──────────┬──────────┬──────────┬─────────────────┐  │
│  │  MySQL   │ ChromaDB │  Redis   │  文件存储        │  │
│  │ 业务数据 │ 向量索引 │  缓存    │ 证据/文书文件     │  │
│  └──────────┴──────────┴──────────┴─────────────────┘  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                   外部服务层                             │
│  • 大模型 API                                            │
│  • Embedding 服务                                        │
│  • 可选：第三方登录平台                                  │
└─────────────────────────────────────────────────────────┘
```

### 核心分层说明

#### 1. **Controller 层（控制器）**
- **文件**: `backend/app/plugin/module_ai/chat/controller.py`
- **职责**: 
  - 接收 HTTP 请求，解析参数
  - 参数验证（基于 Pydantic）
  - 调用 Service 层处理业务
  - 返回统一格式响应
- **特点**: 
  - 使用依赖注入（Depends）
  - 自动生成 OpenAPI 文档
  - 支持 WebSocket 长连接

#### 2. **Service 层（业务逻辑）**
- **文件**: `backend/app/plugin/module_ai/chat/service.py` (155KB，核心业务)
- **职责**:
  - 封装复杂业务逻辑
  - 调用 AI 引擎、数据库
  - 处理事务和异常
- **核心服务**:
  - `UserService`: 用户认证、扩展了解：第三方登录
  - `EvidenceService`: 证据上传、分析、管理
  - `DocumentService`: 文书生成
  - `AssessmentProfileService`: 评估资料管理
  - `ConsultationService`: 咨询问答管理

#### 3. **AI 引擎层（项目核心）**
- **文件**: `backend/app/plugin/module_ai/chat/rag.py`, `backend/app/plugin/module_ai/chat/rag.py`, `backend/app/plugin/module_ai/chat/rag.py`
- **职责**:
  - 大模型调用和响应处理
  - 向量检索和结果排序
  - 提示词构建和优化
  - 会话记忆管理

#### 4. **Model 层（数据模型）**
- **文件**: `backend/app/plugin/module_ai/chat/schema.py` (49KB)
- **职责**:
  - 定义数据库表结构
  - 定义 API 请求/响应模型
  - 数据验证规则
- **核心实体**:
  - `User`: 用户信息
  - `Evidence`: 证据记录
  - `Document`: 文书记录
  - `Consultation`: 咨询问答
  - `Answer`: 回答记录
  - `Review`: 用户评价

#### 5. **Infrastructure 层（基础设施）**
- **文件**: `core/` 目录下的所有模块
- **职责**:
  - 数据库连接管理
  - JWT 认证和加密
  - 日志记录
  - 异常处理
  - 中间件管理

---

## 🤖 AI 核心技术深度解析

### 1. RAG 检索增强生成架构

**什么是 RAG？**

RAG（Retrieval-Augmented Generation）是一种结合检索和生成的 AI 技术，流程如下：

```
用户提问
    ↓
【检索阶段】
    ↓
1. 向量检索（语义匹配）
   - 将问题转为向量
   - 在 ChromaDB 中检索相似文档
   - 返回 Top-K 候选（K=4）
    ↓
2. 关键词检索（BM25）
   - jieba 中文分词
   - 计算 TF-IDF 分数
   - 返回 Top-N 候选（N=12）
    ↓
3. 结果排序（Rerank）
   - 向量分数 + BM25 分数融合
   - 来源权重加分
   - 法条匹配加分
   - 输出最终 Top-K（K=4）
    ↓
【生成阶段】
    ↓
4. 构建 Prompt
   - 系统提示词
   - 检索到的知识片段
   - 用户问题
   - 历史对话（可选）
    ↓
5. 调用大模型
   - LangChain 统一接口
   - 流式输出（WebSocket）
   - 结构化解析
    ↓
最终答案返回给用户
```

**核心代码实现**：

```python
# backend/app/plugin/module_ai/chat/rag.py - RAG 链路核心
class RagChatChain:
    async def ainvoke(self, query, user_id, dept_id, session_id=None,
                      knowledge_base_ids=None, files=None):
        documents = await self.retriever.retrieve(
            query=query,
            user_id=user_id,
            dept_id=dept_id,
            session_id=session_id,
            knowledge_base_ids=knowledge_base_ids,
            files=files,
        )
        prompt = self.prompt_builder.build(query=query, documents=documents)
        return await self.chat_model.complete(prompt)


class RagChainFactory:
    def create_chain(self, db=None) -> RagChatChain:
        return RagChatChain(
            retriever=ChromaKnowledgeRetriever(),
            prompt_builder=RagPromptBuilder(),
            chat_model=LangChainChatModel(),
        )
```

**向量化处理流程**：

```python
# backend/app/plugin/module_ai/knowledge/embedding.py - Embedding 处理
class OpenAICompatibleEmbeddingClient:
    """OpenAI 兼容 Embedding 客户端"""
    
    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        """文档向量化
        
        批处理配置：
        - batch_size: 8 条/批
        - pause_seconds: 0.6 秒（避免 API 限流）
        """
        embeddings = []
        for i in range(0, len(texts), self.batch_size):
            batch = texts[i:i + self.batch_size]
            # 调用 OpenAI API
            result = self.openai_embeddings.embed_documents(batch)
            embeddings.extend(result)
            time.sleep(self.pause_seconds)
        return embeddings
```

### 2. 提示词工程（Prompt Engineering）

**核心提示词设计**：

项目中设计了多个专业提示词，针对不同业务场景：

#### 提示词 1: 诉求分析（Claim Analysis）

```python
CLAIM_ANALYSIS_SYSTEM_PROMPT = """
你目前是一位资深劳动法实务专家，负责拆解劳动争议叙述。
从用户的文本中提取明确的权利主张，并进行核心事实的穿透性归纳（案件摘要）。
务必从实务操作角度，将模糊事实提炼为法律事实，挖掘隐藏的法律关系和潜在的举证难点。
仅返回一个JSON对象，不输出markdown、解释、思考步骤或任何额外文本。
JSON格式必须为{"rights_claim": string, "case_summary": string}。
如果信息不足，两个字段都返回空字符串。
rights_claim应正式且专业。case_summary应突出与主张直接相关的核心事实、举证责任划分及关键时间节点。
"""
```

**设计要点**：
- ✅ 明确角色定位（资深劳动法专家）
- ✅ 具体任务描述（提取权利主张、归纳案件摘要）
- ✅ 输出格式约束（JSON Schema）
- ✅ 异常处理（信息不足返回空字符串）

#### 提示词 2: 成功率评估（Claim Evaluation）

```python
CLAIM_EVALUATION_SYSTEM_PROMPT = """
你是一名经验丰富的劳动法诉讼律师，负责沙盘推演并评估劳动争议索赔。
请利用权利主张、案件摘要、个人资料和佐证材料来估算仲裁胜诉率，不能只做简单的法条背诵或文字复述。
你的分析必须遵循实战的逻辑：
1. 寻找劳方的核心软肋和举证底线
2. 预判资方最有可能提出的抗辩理由
3. 根据现实司法实践剖析真实胜算
4. 给出具体、场景化的操作反制策略

仅返回一个JSON对象，不要输出markdown格式、解释说明、思考步骤或任何额外文本。
JSON格式必须为{
  "success_rate": integer,
  "evaluation_summary": string,
  "legal_basis": [{"law_name": string, "article": string, "article_text": string}],
  "next_steps": [string, string, string]
}

success_rate是0到100之间的整数。
evaluation_summary必须包含基于实务经验的判决走势推测和优劣剖析。
legal_basis保留最核心的法律条款。
next_steps必须给出3条极具实战价值的行动方案（如：如何应对HR谈话、如何补充关键聊天记录等），禁止空泛使用"收集证据"或"起诉"等废话。
"""
```

**设计要点**：
- ✅ 强化专业性（诉讼律师、沙盘推演）
- ✅ 避免空泛输出（禁止"收集证据"等模糊建议）
- ✅ 结构化输出（胜诉率、法律依据、具体行动方案）
- ✅ 实战导向（预判抗辩、反制策略）

### 3. WebSocket 流式响应

**为什么需要流式响应？**

- ✅ **用户体验**: 逐字显示，类似 ChatGPT 效果
- ✅ **降低等待感**: 用户不需要等待完整响应
- ✅ **处理长文本**: AI 生成长文本时，边生成边展示

**技术实现**：

```python
# backend/app/plugin/module_ai/chat/controller.py - WebSocket 路由
@router.websocket("/chat/ws", name="WebSocket聊天")
async def websocket_chat_controller(
    websocket: WebSocket,
    token: str = Query(None, description="JWT访问令牌"),
):
    # 1. 鉴权
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    # 2. 建立连接
    session_id = uuid4().hex
    await websocket.accept()
    
    try:
        while True:
            # 3. 接收用户消息
            data = await websocket.receive_text()
            
            # 4. 流式响应
            async for chunk in UserService.user_chat(
                query=ChatQuerySchema(message=data),
                session_id=session_id,
            ):
                if chunk:
                    await websocket.send_text(chunk)
                    
    except Exception as exc:
        logger.error(f"WebSocket 聊天出错: {exc}")
    finally:
        # 5. 清理会话记忆
        CASE_MEMORY_STORE.delete(session_id)
        await websocket.close()
```

**LangChain 流式调用**：

```python
# backend/app/plugin/module_ai/chat/rag.py - 流式对话
async def chat_stream(
    query: str,
    session_id: str,
    user_id: str,
    dept_id: str,
) -> AsyncGenerator[str, None]:
    """AI 流式对话。"""
    chain = RagChainFactory().create_chain()
    async for chunk in chain.astream(
        query=query,
        user_id=user_id,
        dept_id=dept_id,
        session_id=session_id,
    ):
        yield chunk
```

### 4. 向量数据库 ChromaDB

**为什么选择 ChromaDB？**

- ✅ **嵌入式部署**: 无需单独部署服务，适合中小规模应用
- ✅ **Python 原生**: 与 FastAPI 完美集成
- ✅ **持久化存储**: 支持磁盘存储，重启不丢失
- ✅ **简单易用**: API 简洁，学习曲线平缓

**核心配置**：

```python
# backend/app/config/setting.py
VECTOR_COLLECTION_NAME: str = "arbitration_kb"
VECTOR_CHUNK_SIZE: int = 700        # 文本切片大小
VECTOR_CHUNK_OVERLAP: int = 120     # 切片重叠大小
VECTOR_SEARCH_TOP_K: int = 4        # 检索返回数量
VECTOR_MIN_SCORE: float = 0.2       # 最小相似度阈值
```

**数据存储结构**：

当前骨架通过 `KnowledgeService` 维护知识库和文档状态，通过 `ChromaKnowledgeStore` 管理向量索引。课堂上不要求学生直接查看本地 Chroma 文件，只验证页面状态和检索测试结果。

**上传并索引流程**：

1. `POST /ai/knowledge/create` 创建知识库。
2. `POST /ai/knowledge/document/upload` 上传法律文档。
3. `KnowledgeService.upload_document()` 保存文档并触发解析。
4. `KnowledgeService.index_document()` 切片、向量化并写入 Chroma。
5. `POST /ai/knowledge/retrieval/test` 用问题验证召回效果。

---

## 💼 核心业务功能详解

### 功能 1: AI 智能咨询（WebSocket 实时对话）

**业务场景**：
用户通过小程序提问劳动法问题，AI 基于法律知识库实时回答。

**技术流程**：

```
用户: "公司辞退我需要赔偿吗？"
    ↓
【前端】WebSocket 发送消息
    ↓
【后端】/chat/ws 路由接收
    ↓
【AI 引擎】
    1. 向量检索: 查找相关法条（劳动合同法第47条、第87条）
    2. 构建 Prompt: 系统提示词 + 检索内容 + 用户问题
    3. 调用 LLM: OpenAI GPT-3.5-turbo（流式）
    ↓
【后端】逐片段发送响应
    ↓
【前端】逐字显示 AI 回答
```

**API 接口**：

```
WebSocket URL: ws://localhost:8000/api/chat/ws?token=<JWT_TOKEN>

请求:
{
  "message": "公司辞退我需要赔偿吗？我工作了3年。"
}

响应（流式）:
"根据您的情况，公司"
"辞退您确实需要支付经济"
"补偿金。根据《劳动合同法》"
"第47条规定，经济补偿按劳动者"
"在本单位工作的年限，每满一年"
"支付一个月工资的标准向劳动者支付..."
```

**核心代码**：

```python
# backend/app/plugin/module_ai/chat/service.py - UserService
class UserService:
    @staticmethod
    async def user_chat(
        query: ChatQuerySchema,
        session_id: str
    ) -> AsyncGenerator[str, None]:
        """用户聊天（流式响应）"""
        
        # 调用 AI 工具
        async for chunk in ai_util.chat_stream(
            query=query.message,
            session_id=session_id,
            system_prompt=ai_util.DEFAULT_SYSTEM_PROMPT
        ):
            yield chunk
```

### 功能 2: 维权诉求分析

**业务场景**：
用户描述劳动纠纷情况，AI 自动提取权利主张和案件摘要。

**技术流程**：

```
用户输入:
"我在公司工作了5年，上个月突然被通知辞退，没有任何赔偿。
公司说是因为业绩不好，但我觉得是因为我怀孕了。"

    ↓
【AI 分析】
    1. 结构化提示词: CLAIM_ANALYSIS_SYSTEM_PROMPT
    2. 调用 LLM: 非流式，返回 JSON
    3. JSON Schema 验证
    ↓
【输出结果】
{
  "rights_claim": "要求公司支付违法解除劳动合同赔偿金，并认定公司存在就业歧视",
  "case_summary": "劳动者在单位工作满5年，怀孕期间被以业绩不佳为由辞退。
                  核心争议：1) 公司是否构成违法解除；2) 是否存在孕期就业歧视。
                  举证要点：需证明怀孕事实、公司知情时间、解除通知书内容、
                  业绩考核标准及历史记录。潜在风险：若无法证明公司知晓怀孕
                  事实或业绩确实不达标，主张可能被削弱。"
}
```

**API 接口**：

```http
POST /api/claim/analyses
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "content": "我在公司工作了5年，上个月突然被通知辞退..."
}

Response:
{
  "code": 200,
  "msg": "分析成功",
  "data": {
    "rights_claim": "...",
    "case_summary": "..."
  }
}
```

**核心代码**：

```python
# backend/app/plugin/module_ai/chat/service.py - UserService
@staticmethod
async def analyze_claim(data: ClaimAnalysisRequestSchema):
    """分析维权诉求"""
    
    result = await ai_util.analyze_claim_with_llm(
        content=data.content
    )
    
    return ClaimAnalysisResponseSchema(
        rights_claim=result["rights_claim"],
        case_summary=result["case_summary"]
    )
```

```python
# backend/app/plugin/module_ai/chat/rag.py
async def analyze_claim_with_llm(content: str) -> dict:
    """调用 LLM 分析诉求"""
    
    llm = ChatOpenAI(
        model=settings.OPENAI_MODEL,
        temperature=0.3,  # 降低随机性
        max_tokens=1000
    )
    
    prompt = f"{CLAIM_ANALYSIS_SYSTEM_PROMPT}\n\n用户描述：\n{content}"
    
    response = await llm.ainvoke(prompt)
    
    # 解析 JSON 响应
    result = json.loads(response.content)
    
    return result
```

### 功能 3: 维权成功率评估

**业务场景**：
基于用户提供的诉求、证据、个人资料，AI 评估仲裁胜诉概率。

**技术流程**：

```
输入数据:
{
  "rights_claim": "要求支付违法解除劳动合同赔偿金",
  "case_summary": "劳动者怀孕期间被辞退...",
  "personal_info": {
    "monthly_salary": 8000,
    "work_years": 5,
    "position": "产品经理"
  },
  "evidence_list": [
    "劳动合同",
    "工资流水",
    "解除通知书",
    "孕检报告"
  ]
}

    ↓
【AI 评估】
    1. RAG 检索: 查找相关判例、法条
    2. 构建 Prompt: 系统提示词 + 检索内容 + 案件信息
    3. 调用 LLM: 结构化输出
    ↓
【输出结果】
{
  "success_rate": 75,
  "evaluation_summary": "该案件胜诉概率较高（75%）。核心优势：
                        1) 劳动者处于孕期，受特殊保护；
                        2) 证据较为完整，能证明劳动关系和解除事实。
                        风险点：公司可能抗辩业绩确实不达标，需进一步证明
                        业绩考核不合理或未履行合法程序。",
  "legal_basis": [
    {
      "law_name": "劳动合同法",
      "article": "第42条",
      "article_text": "女职工在孕期、产期、哺乳期的，用人单位不得解除劳动合同。"
    },
    {
      "law_name": "劳动合同法",
      "article": "第87条",
      "article_text": "违法解除劳动合同的，应当按照经济补偿标准的二倍支付赔偿金。"
    }
  ],
  "next_steps": [
    "立即收集公司邮件、钉钉等通知记录，证明公司知晓怀孕事实的时间",
    "调取过往绩效考核记录，对比同岗位员工业绩，证明考核标准不合理",
    "准备劳动仲裁申请书，重点论述孕期特殊保护和公司程序违法"
  ]
}
```

**API 接口**：

```http
POST /api/claim/evaluations
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "rights_claim": "...",
  "case_summary": "...",
  "personal_info": {...},
  "evidence_list": [...]
}

Response:
{
  "code": 200,
  "msg": "评估成功",
  "data": {
    "success_rate": 75,
    "evaluation_summary": "...",
    "legal_basis": [...],
    "next_steps": [...]
  }
}
```

### 功能 4: 证据智能管理

**业务场景**：
用户上传证据文件（图片、PDF、Excel），系统自动分析证据效力。

**技术流程**：

```
用户上传: 劳动合同.pdf
    ↓
【文件处理】
    1. 保存到 data/evidence_uploads/{user_id}/{evidence_id}/
    2. 提取文件元数据（文件名、大小、类型）
    3. 记录到数据库（evidence 表）
    ↓
【后台任务】BackgroundTasks.add_task()
    1. 文件解析:
       - PDF → pypdfium2 提取文本
       - 图片 → OCR 识别（可选）
       - Excel → openpyxl 读取数据
    2. AI 分析:
       - 识别证据类型（劳动合同/工资流水/解除通知等）
       - 评估证据效力（高/中/低）
       - 提取关键信息（合同期限、工资金额等）
    3. 更新数据库: 
       - status: uploading → processing → completed
       - analysis_result: JSON 存储分析结果
    ↓
【返回结果】
{
  "evidence_id": "evt_xxx",
  "file_name": "劳动合同.pdf",
  "status": "processing",
  "analysis": {
    "evidence_type": "劳动合同",
    "effectiveness": "高",
    "key_info": {
      "contract_period": "2019-01-01 至 2024-01-01",
      "monthly_salary": "8000元",
      "position": "产品经理"
    },
    "suggestions": [
      "该证据可证明劳动关系存在",
      "建议补充工资流水作为佐证"
    ]
  }
}
```

**API 接口**：

```http
POST /api/evidences
Content-Type: multipart/form-data
Authorization: Bearer <JWT_TOKEN>

Form Data:
- category_code: LABOR_CONTRACT
- evidence_code: LABOR_CONTRACT
- file: (binary)
- context_note: 这是我的劳动合同原件
- occurred_at: 2019-01-01

Response:
{
  "code": 200,
  "msg": "证据上传成功，分析任务已创建",
  "data": {
    "evidence_id": "evt_xxx",
    "status": "processing",
    "requires_context_note": false
  }
}
```

**核心代码**：

```python
# backend/app/plugin/module_ai/chat/service.py - EvidenceService
class EvidenceService:
    @staticmethod
    def create_evidence(
        db: Session,
        user: User,
        category_code: str,
        evidence_code: str,
        upload_file: UploadFile,
        **kwargs
    ):
        """创建证据记录"""
        
        # 1. 生成唯一 ID
        evidence_id = f"evt_{uuid4().hex[:12]}"
        
        # 2. 保存文件
        file_path = save_uploaded_file(
            upload_file,
            f"data/evidence_uploads/{user.id}/{evidence_id}/"
        )
        
        # 3. 创建数据库记录
        evidence = Evidence(
            evidence_id=evidence_id,
            user_id=user.id,
            category_code=category_code,
            evidence_code=evidence_code,
            file_name=upload_file.filename,
            file_path=str(file_path),
            status="uploading",
            **kwargs
        )
        db.add(evidence)
        db.commit()
        
        return evidence
    
    @staticmethod
    async def process_evidence(evidence_id: str):
        """后台处理证据（异步任务）"""
        
        # 1. 查询证据
        evidence = db.query(Evidence).filter_by(evidence_id=evidence_id).first()
        
        # 2. 更新状态
        evidence.status = "processing"
        db.commit()
        
        try:
            # 3. 文件解析
            text = extract_text_from_file(evidence.file_path)
            
            # 4. AI 分析
            analysis = await ai_util.analyze_evidence(
                evidence_type=evidence.evidence_code,
                content=text
            )
            
            # 5. 保存结果
            evidence.status = "completed"
            evidence.analysis_result = json.dumps(analysis, ensure_ascii=False)
            db.commit()
            
        except Exception as e:
            evidence.status = "failed"
            evidence.error_message = str(e)
            db.commit()
            logger.error(f"证据分析失败: {e}")
```

### 功能 5: 文书自动生成

**业务场景**：
基于用户信息和案件分析，自动生成劳动仲裁申请书等法律文书。

**技术流程**：

```
输入数据:
{
  "user_info": {
    "name": "张三",
    "id_card": "110***",
    "phone": "138****"
  },
  "company_info": {
    "name": "XX科技有限公司",
    "address": "北京市朝阳区..."
  },
  "case_info": {
    "rights_claim": "要求支付违法解除劳动合同赔偿金",
    "case_summary": "...",
    "evidence_list": [...]
  }
}

    ↓
【文书生成】
    1. 选择模板: arbitration_application.jinja2
    2. AI 补充内容:
       - 事实与理由段落扩写
       - 法律依据自动匹配
       - 赔偿金额自动计算
    3. 模板渲染: Jinja2
    4. 格式化输出: 
       - 段落格式
       - 项目符号
       - 页眉页脚
    ↓
【生成文书】保存为 PDF/Word
```

**核心代码**：

```python
# backend/app/plugin/module_ai/chat/document_service.py
class DocumentService:
    @staticmethod
    async def generate_arbitration_application(
        db: Session,
        user: User,
        data: ArbitrationApplicationData
    ):
        """生成劳动仲裁申请书"""
        
        # 1. AI 生成文书内容
        content = await ai_util.generate_document_content(
            template_type="arbitration_application",
            user_info=data.user_info,
            company_info=data.company_info,
            case_info=data.case_info
        )
        
        # 2. 渲染 Jinja2 模板
        template = jinja_env.get_template("arbitration_application.jinja2")
        html_content = template.render(**content)
        
        # 3. 生成 PDF（可选）
        pdf_path = generate_pdf_from_html(html_content)
        
        # 4. 保存记录
        document = Document(
            document_id=f"doc_{uuid4().hex[:12]}",
            user_id=user.id,
            document_type="arbitration_application",
            title="劳动仲裁申请书",
            content=html_content,
            file_path=str(pdf_path),
            status="completed"
        )
        db.add(document)
        db.commit()
        
        return document
```

---

## 🔐 安全与认证机制

### JWT 身份认证流程

```
【登录流程】
用户提交: username + password
    ↓
1. 验证密码: 密码哈希.checkpw()
    ↓
2. 生成 JWT Token:
   Payload: {
     "sub": "admin",           # 用户名
     "exp": 1234567890,        # 过期时间（30分钟后）
     "iat": 1234567800         # 签发时间
   }
   Secret: settings.SECRET_KEY
   Algorithm: HS256
    ↓
3. 返回 Token:
   {
     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "token_type": "bearer",
     "expires_in": 1800
   }

【访问受保护接口】
请求头: Authorization: Bearer <token>
    ↓
1. 提取 Token: OAuth2PasswordBearer
    ↓
2. 解码验证: jwt.decode()
   - 签名验证
   - 过期时间检查
    ↓
3. 查询用户: db.query(User).filter_by(username=sub)
    ↓
4. 注入依赖: CurrentUser = User 对象
    ↓
5. 业务处理
```

**核心代码**：

```python
# backend/app/core/security.py
def create_access_token(payload: JWTPayloadSchema) -> str:
    """创建 JWT 访问令牌"""
    to_encode = payload.model_dump()
    if not payload.exp:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
        to_encode["exp"] = expire
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt

def decode_access_token(token: str) -> JWTPayloadSchema:
    """解码 JWT 访问令牌"""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return JWTPayloadSchema(**payload)
    except ExpiredSignatureError as exc:
        raise TokenExpiredError("登录已过期，请重新登录") from exc
    except JWTError as exc:
        raise InvalidTokenError("无效的令牌") from exc

def set_password_hash(password: str) -> str:
    """扩展了解：密码安全"""
    password_bytes = password[:72].encode("utf-8")
    salt = 密码哈希.gensalt(rounds=12)  # 12轮加盐
    hashed = 密码哈希.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    plain_bytes = plain_password[:72].encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")
    return 密码哈希.checkpw(plain_bytes, hashed_bytes)
```

```python
# backend/app/core/dependencies.py
async def get_current_user(
    request: Request,
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """获取当前登录用户（依赖注入）"""
    
    # 1. 检查 Token 是否存在
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="未登录，请先登录"
        )
    
    # 2. 解码 Token
    try:
        payload = decode_access_token(token)
    except (TokenExpiredError, InvalidTokenError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc)
        )
    
    # 3. 查询用户
    username = payload.sub
    user = db.exec(select(User).where(User.username == username)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在"
        )
    
    return user

# 类型别名（方便使用）
CurrentUser = Annotated[User, Depends(get_current_user)]
```

### 扩展了解：接口限流机制

**为什么需要扩展了解：接口限流？**
- ✅ 防止 DDoS 攻击
- ✅ 防止恶意刷接口
- ✅ 保护 AI API 配额
- ✅ 保证服务稳定性

**实现机制**：

```python
# backend/app/core/http_limit.py
class RateLimiter:
    """简单的内存扩展了解：接口限流器"""
    
    def __init__(self):
        # {client_key: (last_reset_time, request_count)}
        self._cache: Dict[str, Tuple[float, int]] = {}
        # {client_key: block_until_time}
        self._blocked: Dict[str, float] = {}
    
    def is_allowed(
        self,
        client_key: str,
        max_requests: int = 30,      # 最大请求数
        window_seconds: int = 60,    # 时间窗口（秒）
        block_seconds: int = 300,    # 封禁时长（秒）
    ) -> Tuple[bool, str]:
        """检查是否允许请求"""
        
        current_time = time()
        
        # 1. 检查是否在封禁期
        if client_key in self._blocked:
            block_until = self._blocked[client_key]
            if current_time < block_until:
                remaining = int(block_until - current_time)
                return False, f"请求过于频繁，请在 {remaining} 秒后重试"
            else:
                del self._blocked[client_key]
        
        # 2. 检查时间窗口内请求数
        if client_key in self._cache:
            last_reset, count = self._cache[client_key]
            
            # 时间窗口内
            if current_time - last_reset < window_seconds:
                if count >= max_requests:
                    # 超过限制，封禁
                    self._blocked[client_key] = current_time + block_seconds
                    return False, f"请求过于频繁，已封禁 {block_seconds} 秒"
                else:
                    # 增加计数
                    self._cache[client_key] = (last_reset, count + 1)
            else:
                # 时间窗口过期，重置
                self._cache[client_key] = (current_time, 1)
        else:
            # 首次请求
            self._cache[client_key] = (current_time, 1)
        
        return True, ""

# 全局限制器
rate_limiter = RateLimiter()

class RateLimitMiddleware(BaseHTTPMiddleware):
    """扩展了解：接口限流中间件"""
    
    async def dispatch(self, request: Request, call_next):
        # 获取客户端 IP
        client_ip = request.client.host if request.client else "unknown"
        
        # 检查是否允许
        allowed, message = rate_limiter.is_allowed(
            client_key=client_ip,
            max_requests=30,
            window_seconds=60
        )
        
        if not allowed:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": message}
            )
        
        response = await call_next(request)
        return response
```

### 扩展了解：第三方登录

**业务场景**：
第三方登录常用于移动端和小程序场景。课堂中只需要让学生理解“外部平台确认身份，本系统仍然签发自己的 JWT”这条链路，不要求接入真实平台账号。

**技术流程**：

```
【客户端】
用户点击"第三方登录"
    ↓
获取临时授权 code
    ↓
发送 code 到后端: POST /api/auth/oauth/login

【后端】
1. 调用第三方平台接口换取用户身份
    ↓
2. 获取外部用户唯一标识
    ↓
3. 查询或创建用户:
   - 如果外部标识已绑定 → 返回已有用户
   - 如果外部标识不存在 → 创建或绑定用户
    ↓
4. 生成 JWT Token
    ↓
5. 返回 Token 和用户信息

【小程序端】
存储 Token 到本地: wx.setStorageSync('token', token)
后续请求携带: header['Authorization'] = 'Bearer ' + token
```

**核心代码**：

```python
def exchange_code_for_identity(code: str) -> dict:
    """扩展了解：用授权 code 换取第三方用户身份。

    课堂中使用 mock provider 讲流程，不要求接真实平台。
    """
    return {
        "external_id": "provider_user_001",
        "provider": "mock_provider"
    }
```

```python
# backend/app/plugin/module_ai/chat/service.py - UserService
@staticmethod
def third_party_login(db: Session, code: str) -> JWTOutSchema:
    """扩展了解：第三方登录"""
    
    # 1. 用授权 code 换取外部身份
    identity = exchange_code_for_identity(code)
    external_id = identity["external_id"]
    
    # 2. 查询或创建本系统用户
    user = db.exec(select(User).where(User.username == external_id)).first()
    if not user:
        user = User(
            name=f"外部用户_{external_id[-6:]}",
            username=external_id,
            password=set_password_hash(uuid4().hex),  # 随机密码
            status=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # 3. 生成 Token
    payload = JWTPayloadSchema(
        sub=user.username,
        exp=datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )
    access_token = create_access_token(payload)
    
    token = JWTOutSchema(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    return token
```

---

## 📊 数据库设计

### 核心表结构

#### 1. users（用户表）

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT '姓名',
    username VARCHAR(255) UNIQUE NOT NULL COMMENT '账号（手机号/外部账号ID）',
    password VARCHAR(255) NOT NULL COMMENT '密码（密码哈希加密）',
    status BOOLEAN DEFAULT TRUE COMMENT '状态（启用/禁用）',
    is_superuser BOOLEAN DEFAULT FALSE COMMENT '是否超级管理员',
    description VARCHAR(255) COMMENT '备注',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_username (username),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

#### 2. evidence（证据表）

```sql
CREATE TABLE evidence (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evidence_id VARCHAR(64) UNIQUE NOT NULL COMMENT '证据唯一标识',
    user_id INT NOT NULL COMMENT '用户ID',
    category_code VARCHAR(64) NOT NULL COMMENT '证据分类代码',
    evidence_code VARCHAR(64) NOT NULL COMMENT '证据类型代码',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_path VARCHAR(512) NOT NULL COMMENT '文件路径',
    file_size BIGINT COMMENT '文件大小（字节）',
    status VARCHAR(32) DEFAULT 'uploading' COMMENT '状态（uploading/processing/completed/failed）',
    context_note TEXT COMMENT '上下文说明',
    occurred_at DATE COMMENT '发生日期',
    source_type VARCHAR(64) COMMENT '来源类型',
    uploader_remark TEXT COMMENT '上传备注',
    analysis_result JSON COMMENT 'AI分析结果',
    error_message TEXT COMMENT '错误信息',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_evidence_id (evidence_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='证据表';
```

#### 3. document（文书表）

```sql
CREATE TABLE document (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id VARCHAR(64) UNIQUE NOT NULL COMMENT '文书唯一标识',
    user_id INT NOT NULL COMMENT '用户ID',
    document_type VARCHAR(64) NOT NULL COMMENT '文书类型',
    title VARCHAR(255) NOT NULL COMMENT '文书标题',
    content LONGTEXT COMMENT '文书内容（HTML）',
    file_path VARCHAR(512) COMMENT '文件路径（PDF/Word）',
    status VARCHAR(32) DEFAULT 'draft' COMMENT '状态（draft/completed）',
    metadata JSON COMMENT '元数据',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_document_id (document_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文书表';
```

#### 4. consultation（咨询表）

```sql
CREATE TABLE consultation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL COMMENT '咨询标题',
    content TEXT NOT NULL COMMENT '咨询内容',
    tag VARCHAR(64) COMMENT '标签（工资/加班/解雇等）',
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    like_count INT DEFAULT 0 COMMENT '点赞次数',
    status INT DEFAULT 1 COMMENT '状态（1-显示 0-隐藏）',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tag (tag),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='咨询表';
```

#### 5. answer（回答表）

```sql
CREATE TABLE answer (
    id INT AUTO_INCREMENT PRIMARY KEY,
    consultation_id INT NOT NULL COMMENT '咨询ID',
    content TEXT NOT NULL COMMENT '回答内容',
    identity_display VARCHAR(64) COMMENT '身份显示（律师/法律顾问）',
    respondent_type VARCHAR(32) DEFAULT 'lawyer' COMMENT '回答者类型',
    is_lawyer_top BOOLEAN DEFAULT FALSE COMMENT '律师置顶',
    like_count INT DEFAULT 0 COMMENT '点赞次数',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (consultation_id) REFERENCES consultation(id) ON DELETE CASCADE,
    INDEX idx_consultation_id (consultation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='回答表';
```

#### 6. review（好评表）

```sql
CREATE TABLE review (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reviewer_name VARCHAR(64) COMMENT '评价人姓名',
    avatar_url VARCHAR(512) COMMENT '头像URL',
    rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5) COMMENT '评分（0-5）',
    content TEXT NOT NULL COMMENT '评价内容',
    case_type VARCHAR(64) COMMENT '案件类型',
    amount DECIMAL(12,2) COMMENT '赔付金额',
    review_date DATE COMMENT '评价日期',
    status INT DEFAULT 1 COMMENT '状态（1-显示 0-隐藏）',
    created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='好评表';
```

### 数据库迁移

使用 Alembic 进行数据库版本管理：

```bash
# 1. 生成迁移脚本（自动检测模型变更）
uv run main.py migrate --env=dev "添加用户评估资料表"

# 输出：
# INFO  [alembic.runtime.migration] Context impl MySQLImpl.
# INFO  [alembic.autogenerate.compare] Detected added table 'assessment_profile'
# Generating migration script...
# 已生成新的 Alembic 迁移脚本
# 已应用最新迁移

# 2. 手动执行迁移（可选）
alembic upgrade head

# 3. 回退迁移
alembic downgrade -1
```

---

## 🚀 项目部署和运行

### 环境准备

**系统要求**：
- Python ≥ 3.12
- MySQL ≥ 8.0
- Redis ≥ 5.0（可选）
- 操作系统：Linux / macOS / Windows

**安装依赖**：

```bash
# 1. 克隆项目
git clone https://github.com/your-repo/AI 劳动仲裁辅助系统.git
cd AI 劳动仲裁辅助系统

# 2. 安装 uv（推荐，比 pip 快 10-100 倍）
# Windows (PowerShell)
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# 3. 初始化项目（一条命令搞定！）
uv sync

# uv sync 会自动：
# - 创建虚拟环境（如果不存在）
# - 读取 pyproject.toml
# - 安装所有依赖
# - 生成 uv.lock 锁定文件

# 总耗时：约 5-10 秒！⚡

# 4. 激活虚拟环境（可选，使用 uv run 可以跳过这步）
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows

# 5. 或者直接使用 uv run 运行命令（推荐）
uv run main.py run --env=dev
```

**为什么选择 uv？**

| 特性 | pip | uv |
|------|-----|-----|
| 安装速度 | 2-3 分钟 | 5-10 秒 |
| 依赖锁定 | 需要 pip-tools | 内置 uv.lock |
| 环境管理 | 需要 virtualenv | 内置 |
| 跨平台 | ✅ | ✅ |
| Python 版本 | 手动管理 | 自动检测 |

**uv 核心命令速查**：

```bash
# 同步依赖（最常用）
uv sync

# 添加新包
uv add redis

# 移除包
uv remove redis

# 升级包
uv lock --upgrade-package fastapi

# 运行脚本（无需激活环境）
uv run python script.py
uv run pytest

# 查看已安装的包
uv pip list

# 运行项目
uv run main.py run --env=dev
```

### 配置文件

复制 `.env.example` 并修改配置：

```bash
cp .env.example .env
```

**核心配置项**：

```ini
# .env 配置文件

# ========== 服务配置 ==========
DEBUG=False                          # 生产环境设为 False
SERVICE_NAME=AI 劳动仲裁辅助系统劳动仲裁系统
SERVICE_VERSION=v1.0
SERVICE_HOST=0.0.0.0                # 0.0.0.0 监听所有网卡
SERVICE_PORT=8000

# ========== JWT 配置 ==========
SECRET_KEY=your-secret-key-change-in-production-123456
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_MINUTES=1440

# ========== MySQL 配置 ==========
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=fastapi_db

# ========== OpenAI 配置（核心）==========
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-3.5-turbo          # 或 gpt-4
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# ========== 向量检索配置 ==========
VECTOR_CHUNK_SIZE=700                # 文本切片大小
VECTOR_CHUNK_OVERLAP=120            # 切片重叠大小
VECTOR_SEARCH_TOP_K=4               # 检索返回数量
VECTOR_MIN_SCORE=0.2                # 最小相似度阈值

# ========== 第三方登录扩展配置（选讲）==========
OAUTH_PROVIDER=mock_provider
OAUTH_CLIENT_ID=your_client_id
OAUTH_CLIENT_SECRET=your_client_secret

# ========== Redis 配置（可选）==========
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# ========== 日志配置 ==========
LOG_LEVEL=INFO                      # DEBUG/INFO/WARNING/ERROR
```

### 数据库初始化

```bash
# 1. 创建数据库
mysql -u root -p
CREATE DATABASE fastapi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# 2. 运行迁移（自动创建表）
uv run main.py migrate --env=dev

# 输出：
# [INFO] 数据库表创建成功
# [INFO] 默认用户创建成功
# 已生成新的 Alembic 迁移脚本
# 已应用最新迁移
```

### 创建知识库并上传文档（核心步骤）

1. 准备 `劳动合同法.txt`、`劳动争议调解仲裁法.txt`、`工伤保险条例.txt` 等法律文档。
2. 调用 `POST /ai/knowledge/create` 创建“劳动仲裁法规知识库”。
3. 调用 `POST /ai/knowledge/document/upload` 上传文档，后端完成解析、切片、向量化和索引入库。
4. 如需重建索引，调用 `POST /ai/knowledge/document/{id}/reindex`。
5. 调用 `POST /ai/knowledge/retrieval/test` 输入劳动争议问题，检查返回片段是否准确。

### 启动服务

```bash
# 开发模式（热重载）
uv run main.py run --env=dev

# 输出：
# INFO:     Will watch for changes in these directories: ['D:\\AI 劳动仲裁辅助系统']
# INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
# INFO:     Started reloader process [12345] using WatchFiles
# INFO:     Started server process [12346]
# INFO:     Waiting for application startup.
# [INFO] 服务启动: AI 劳动仲裁辅助系统劳动仲裁系统
# [INFO] 数据库表创建成功
# INFO:     Application startup complete.

# 生产模式（多进程）
gunicorn main:create_app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --access-logfile logs/access.log \
    --error-logfile logs/error.log
```

### 访问项目

- **API 文档**: http://localhost:8000/docs
- **ReDoc 文档**: http://localhost:8000/redoc
- **健康检查**: http://localhost:8000/api/health-check
- **调试路由**: http://localhost:8000/debug/routes

**默认管理员账号**：
- 用户名: `admin`
- 密码: `123456`

---

## 📖 四天实训课程安排

### Day 1: 环境搭建 + AI 基础

**上午（9:00-12:00）**

1. **项目介绍和演示**（30分钟）
   - 项目背景和业务场景
   - 核心功能演示
   - 技术栈介绍

2. **环境搭建**（90分钟）
   - Python 3.12 安装
   - MySQL 8.0 配置
   - 项目依赖安装
   - 数据库初始化
   - 启动项目验证

3. **AI 基础理论**（60分钟）
   - 大模型基本原理
   - Prompt Engineering 入门
   - RAG 技术介绍
   - 向量数据库概念

**下午（14:00-18:00）**

1. **LangChain 框架入门**（90分钟）
   - LangChain 核心概念
   - 调用 OpenAI API
   - 实现简单问答
   - 练习：编写第一个 AI 对话

2. **知识库上传与索引**（120分钟）
   - ChromaDB 使用
   - 文本切片和向量化
   - 构建法律知识库
   - 练习：添加自定义文档并构建索引

3. **练习**：
   - 完成环境搭建
   - 成功创建知识库并上传文档
   - 实现简单 AI 问答接口

---

### Day 2: RAG 检索 + 提示词工程

**上午（9:00-12:00）**

1. **练习复盘**（30分钟）

2. **RAG 技术深入**（90分钟）
   - 语义检索原理
   - BM25 关键词检索
   - 检索边界和结果排序
   - 代码实战：实现完整 RAG 流程

3. **提示词工程**（60分钟）
   - 提示词设计原则
   - 结构化输出（JSON Schema）
   - Few-shot Learning
   - 练习：设计诉求分析提示词

**下午（14:00-18:00）**

1. **AI 咨询功能实现**（120分钟）
   - WebSocket 实时通信
   - 流式响应实现
   - 会话记忆管理
   - 练习：完成 AI 咨询对话功能

2. **维权分析功能**（90分钟）
   - 诉求提取（Claim Analysis）
   - 成功率评估（Evaluation）
   - 结构化输出处理
   - 练习：实现维权分析接口

3. **练习**：
   - 完成 AI 咨询功能
   - 实现维权诉求分析
   - 优化提示词，提升分析准确率

---

### Day 3: 证据管理 + 文书生成

**上午（9:00-12:00）**

1. **练习复盘**（30分钟）

2. **证据管理功能**（120分钟）
   - 文件上传处理
   - 后台任务（BackgroundTasks）
   - 文件解析（PDF/Excel/图片）
   - AI 证据分析
   - 练习：实现证据上传和分析

3. **异常处理和日志**（30分钟）
   - 统一异常处理机制
   - 日志记录和追踪
   - 调试技巧

**下午（14:00-18:00）**

1. **文书生成功能**（120分钟）
   - Jinja2 模板引擎
   - AI 辅助内容生成
   - PDF/Word 导出
   - 练习：生成劳动仲裁申请书

2. **API 优化**（60分钟）
   - 异步处理优化
   - 缓存策略（Redis）
   - 性能监控

3. **练习**：
   - 完成证据管理功能
   - 实现文书自动生成
   - 测试完整业务流程

---

### Day 4: 安全认证 + 项目总结

**上午（9:00-12:00）**

1. **练习复盘**（30分钟）

2. **安全认证实现**（90分钟）
   - JWT 身份认证
   - 扩展了解：第三方登录
   - 扩展了解：接口限流
   - 练习：实现 JWT 认证主链路

3. **前后端联调**（60分钟）
   - API 接口对接
   - WebSocket 连接
   - 错误处理
   - 练习：联调 AI 咨询功能

**下午（14:00-18:00）**

1. **项目部署**（60分钟）
   - 生产环境配置
   - Docker 容器化（可选）
   - Nginx 反向代理
   - HTTPS 配置

2. **项目答辩准备**（120分钟）
   - 功能演示准备
   - PPT 制作指导
   - 技术答辩要点
   - 分组模拟答辩

3. **项目答辩**（60分钟）
   - 每组 10 分钟演示
   - 5 分钟技术答辩
   - 评委点评

---

## 🎓 考核标准（总分100分）

### 1. AI 核心功能实现（50分）

| 功能模块 | 分值 | 考核要点 |
|---------|------|---------|
| **知识库上传与索引** | 10分 | • 成功构建索引（5分）<br>• 检索准确率 >70%（3分）<br>• 代码规范（2分） |
| **AI 智能咨询** | 15分 | • WebSocket 连接正常（5分）<br>• 流式响应正确（5分）<br>• RAG 检索有效（5分） |
| **维权分析** | 10分 | • 诉求提取准确（5分）<br>• 成功率评估合理（5分） |
| **证据管理** | 10分 | • 文件上传成功（3分）<br>• AI 分析有效（5分）<br>• 后台任务正常（2分） |
| **文书生成** | 5分 | • 模板渲染正确（3分）<br>• 内容完整（2分） |

### 2. 工程化能力（20分）

| 项目 | 分值 | 考核要点 |
|-----|------|---------|
| **安全认证** | 8分 | • JWT 认证正确（4分）<br>• 密码安全（2分）<br>• 权限控制（2分） |
| **异常处理** | 5分 | • 统一异常处理（3分）<br>• 日志记录完整（2分） |
| **代码质量** | 7分 | • 代码规范（3分）<br>• 注释完整（2分）<br>• 无明显 bug（2分） |

### 3. 项目答辩（20分）

| 项目 | 分值 | 考核要点 |
|-----|------|---------|
| **功能演示** | 10分 | • 演示流畅（5分）<br>• 功能完整（5分） |
| **技术答辩** | 10分 | • RAG 原理讲解（3分）<br>• 提示词设计思路（3分）<br>• 问题回答准确（4分） |

### 4. 综合能力（10分）

| 项目 | 分值 | 考核要点 |
|-----|------|---------|
| **团队协作** | 5分 | • Git 提交规范（2分）<br>• 分工合理（3分） |
| **创新亮点** | 5分 | • 功能创新（3分）<br>• 技术优化（2分） |

**评分等级**：
- 优秀（90-100分）：AI 功能全部实现，代码质量高，答辩出色
- 良好（80-89分）：核心 AI 功能实现，工程化完善
- 中等（70-79分）：基础 AI 功能实现，部分功能不完善
- 及格（60-69分）：部分 AI 功能实现，存在较多问题
- 不及格（<60分）：核心功能未实现

---

## 🔍 常见问题排查

### 问题 1: 知识库上传与索引失败

**现象**：
```
[ERROR] OpenAI API Error: 401 Unauthorized
```

**原因**：OpenAI API Key 未配置或无效

**解决方案**：
1. 检查 `.env` 文件中的 `OPENAI_API_KEY`
2. 确认 API Key 有效且有余额
3. 验证 API Base URL 是否正确

```bash
# 测试 API Key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

---

### 问题 2: WebSocket 连接失败

**现象**：
```
WebSocket connection failed: 1008 Policy Violation
```

**原因**：JWT Token 未传递或已过期

**解决方案**：
1. 检查前端是否正确传递 token 参数
2. 验证 token 是否在有效期内
3. 确认 token 格式正确

```javascript
// 前端正确连接方式
const token = localStorage.getItem('token');
const ws = new WebSocket(`ws://localhost:8000/api/chat/ws?token=${token}`);
```

---

### 问题 3: 数据库连接失败

**现象**：
```
sqlalchemy.exc.OperationalError: (2003, "Can't connect to MySQL server")
```

**原因**：MySQL 服务未启动或连接配置错误

**解决方案**：
1. 启动 MySQL 服务
2. 检查 `.env` 中的数据库配置
3. 验证数据库用户权限

---

### 问题 4: AI 响应质量差

**现象**：AI 回答不准确或答非所问

**解决方案**：
1. 优化检索参数（增加 TOP-K 数量）
2. 优化提示词（添加更多上下文）
3. 补充高质量法律文档到知识库

---

## 💡 项目亮点总结

### 技术亮点

1. **AI 原生架构** - 全流程 AI 赋能
2. **企业级工程化** - 分层架构、依赖注入、统一异常处理
3. **现代化技术栈** - Python 3.12、FastAPI、LangChain、ChromaDB
4. **生产就绪** - 完整的认证授权、异步任务、文件管理

### 业务亮点

1. **解决真实痛点** - 降低法律咨询门槛、提升维权效率
2. **用户体验优秀** - 实时对话、流式响应、移动端友好
3. **商业价值明确** - ToC/ToB 双模式，易于推广

---

## 📚 学习资源推荐

- **FastAPI**: https://fastapi.tiangolo.com/zh/
- **LangChain**: https://python.langchain.com/
- **ChromaDB**: https://docs.trychroma.com/
- **Pydantic**: https://docs.pydantic.dev/

---

## 🎯 进阶方向

### 功能扩展
1. 多模态支持（图片、语音、视频）
2. AI Agent 多智能体协作
3. 知识图谱构建
4. 个性化推荐

### 技术优化
1. 性能优化（Redis、Celery、读写分离）
2. 模型优化（Fine-tuning、本地部署）
3. 监控运维（Prometheus、Sentry、ELK）
4. 自动化测试（单元测试、集成测试、E2E）

---

## 📝 总结

本项目是一个**企业级 AI 赋能的劳动仲裁辅助系统**，具有以下特点：

✅ **技术先进**：基于最新的 AI 技术栈（LangChain、RAG、大模型）  
✅ **架构清晰**：分层设计，代码规范，易于维护  
✅ **功能完整**：覆盖咨询、分析、证据、文书全流程  
✅ **生产就绪**：安全、高性能、可扩展  
✅ **实战价值**：解决真实业务问题，具备商业价值  

通过四天的实训学习，学员可以：
- 掌握 AI 应用开发核心技能
- 理解 RAG 技术和向量数据库
- 熟悉企业级 Web 项目开发流程
- 具备独立开发 AI 项目的能力

---

## 📞 技术支持

- **API 文档**: http://localhost:8000/docs
- **项目仓库**: https://github.com/your-repo/AI 劳动仲裁辅助系统
- **问题反馈**: GitHub Issues

---

**文档版本**: v1.0  
**最后更新**: 2026-06-13  
**作者**: AI 劳动仲裁辅助系统 开发团队  

---

**本文档涵盖了项目的核心技术、架构设计、功能实现、部署运维、实训安排等全部内容，适用于项目讲解、技术答辩和教学培训。**


