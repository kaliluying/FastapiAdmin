# Day 2 下午课程补充内容
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

### 第三部分：WebSocket 实时通信（14:00-15:20，80分钟）

本部分内容请参考以下要点：

#### 核心知识点

1. **WebSocket 基础**
   - HTTP vs WebSocket 对比
   - 双向通信原理
   - 长连接管理

2. **FastAPI WebSocket 实现**
   - 路由定义：`@router.websocket("/chat/ws")`
   - 连接管理：accept/close
   - 消息收发：receive_text/send_text
   - 异常处理：WebSocketDisconnect

3. **流式 AI 响应**
   - LangChain 流式调用：`streaming=True`
   - 异步生成器：`AsyncGenerator`
   - 对话历史管理：`CASE_MEMORY_STORE`

#### 实战代码示例

```python
# WebSocket 路由（简化版）
@router.websocket("/chat/ws")
async def websocket_chat(websocket: WebSocket, token: str = Query(None)):
    if not token:
        await websocket.close(code=1008)
        return
    
    session_id = uuid4().hex
    await websocket.accept()
    
    try:
        while True:
            data = await websocket.receive_text()
            async for chunk in chat_stream(data, session_id):
                await websocket.send_text(chunk)
    except WebSocketDisconnect:
        logger.info("客户端断开")
    finally:
        del CASE_MEMORY_STORE[session_id]
        await websocket.close()

# 流式响应（简化版）
async def chat_stream(query: str, session_id: str):
    # 1. 用当前 RAG 链路检索上下文、组装 Prompt、调用模型
    chain = RagChainFactory().create_chain()
    
    # 2. 流式返回
    async for chunk in chain.astream(query=query, session_id=session_id):
        if chunk:
            yield chunk
```

---

### 第四部分：实现维权诉求分析（15:30-17:00，90分钟）

#### 4.1 功能需求分析（10分钟）

**功能描述**：
用户输入案情描述，AI 自动提取：
1. 权利主张（要求什么赔偿）
2. 案件摘要（核心事实 + 举证要点）

**API 设计**：
```
POST /api/claim/analyses（设计接口，当前骨架未内置）
Body: {"content": "案情描述..."}
Response: {
  "rights_claim": "要求支付违法解除赔偿金",
  "case_summary": "劳动者在单位工作5年..."
}
```

#### 4.2 实现诉求分析接口（40分钟）

**步骤 1：创建数据模型**

```python
# backend/app/plugin/module_ai/chat/schema.py（已有）
class ClaimAnalysisRequestSchema(SQLModel):
    """诉求分析请求"""
    content: str = Field(..., max_length=2000, description="案情描述")

class ClaimAnalysisResponseSchema(SQLModel):
    """诉求分析响应"""
    rights_claim: str = Field(..., description="权利主张")
    case_summary: str = Field(..., description="案件摘要")
```

**步骤 2：实现 Service 方法**

```python
# backend/app/plugin/module_ai/chat/service.py
class UserService:
    @staticmethod
    async def analyze_claim(data: ClaimAnalysisRequestSchema):
        """分析维权诉求"""
        result = await ai_util.analyze_claim_with_llm(content=data.content)
        return ClaimAnalysisResponseSchema(
            rights_claim=result["rights_claim"],
            case_summary=result["case_summary"]
        )
```

**步骤 3：实现 AI 工具方法**

```python
# backend/app/plugin/module_ai/chat/rag.py
async def analyze_claim_with_llm(content: str) -> dict:
    """调用 LLM 分析诉求"""
    
    llm = ChatOpenAI(
        api_key=settings.OPENAI_API_KEY,
        model=settings.OPENAI_MODEL,
        temperature=0.3
    )
    
    messages = [
        SystemMessage(content=CLAIM_ANALYSIS_SYSTEM_PROMPT),
        HumanMessage(content=f"案情描述：\n{content}")
    ]
    
    response = await llm.ainvoke(messages)
    
    # 解析 JSON
    result = parse_llm_json_response(response.content)
    
    return result
```

**步骤 4：创建 Controller 路由**

```python
# backend/app/plugin/module_ai/chat/controller.py
@router.post("/claim/analyses", name="分析维权诉求")
async def analyze_claim_controller(
    data: ClaimAnalysisRequestSchema,
    current_user: CurrentUser
):
    """分析维权诉求
    
    从用户描述中提取：
    1. 权利主张
    2. 案件摘要
    """
    try:
        result = await UserService.analyze_claim(data)
        return SuccessResponse(data=result)
    except Exception as e:
        logger.error(f"诉求分析失败: {e}", exc_info=True)
        raise ExceptResponse(msg="分析失败，请稍后重试")
```

**步骤 5：测试接口**

```bash
# 启动服务
uv run main.py run --env=dev

# 打开 http://localhost:<SERVER_PORT>/docs（当前骨架示例为 8004）
# 找到或设计 POST /api/claim/analyses（设计接口，当前骨架未内置）
# 点击 Try it out
# 输入测试数据并执行
```

测试数据：
```json
{
  "content": "我在公司工作了5年，担任产品经理，月薪8000元。上个月告诉公司我怀孕了，公司说恭喜。但这个月初，公司突然通知我被辞退，理由是业绩不好。公司没给任何赔偿，让我当天走人。"
}
```

期望输出：
```json
{
  "code": 200,
  "msg": "成功",
  "data": {
    "rights_claim": "要求公司支付违法解除劳动合同赔偿金",
    "case_summary": "劳动者在单位工作满5年..."
  }
}
```

#### 4.3 实现成功率评估接口（40分钟）

类似的步骤，实现 `/api/claim/evaluations` 设计接口。

**关键代码**：

```python
# Service 方法
@staticmethod
async def evaluate_claim(data: ClaimEvaluationRequestSchema):
    """评估成功率"""
    result = await ai_util.evaluate_claim_with_llm(
        rights_claim=data.rights_claim,
        case_summary=data.case_summary,
        personal_info=data.personal_info,
        evidence_list=data.evidence_list
    )
    return ClaimEvaluationResponseSchema(**result)

# AI 工具方法
async def evaluate_claim_with_llm(...) -> dict:
    llm = ChatOpenAI(model=settings.OPENAI_MODEL, temperature=0.3)
    
    # 构建详细的 Prompt
    prompt = f"""
{CLAIM_EVALUATION_SYSTEM_PROMPT}

权利主张：{rights_claim}
案件摘要：{case_summary}
个人资料：{json.dumps(personal_info, ensure_ascii=False)}
证据清单：{', '.join(evidence_list)}
"""
    
    messages = [
        SystemMessage(content=prompt)
    ]
    
    response = await llm.ainvoke(messages)
    result = parse_llm_json_response(response.content)
    
    return result
```

---

### 第五部分：课堂验收和答疑（17:00-18:00，60分钟）

#### 今日总结（10分钟）

**今天完成的内容**：
✅ 检索边界（向量 + BM25 + 结果排序）
✅ 提示词工程（7要素 + 2个核心提示词）
✅ WebSocket 实时通信
✅ 流式 AI 响应
✅ 维权诉求分析接口
✅ 成功率评估接口

**重点回顾**：
1. RAG 检索要混合多种方法
2. 提示词设计要严格约束
3. WebSocket 实现实时对话
4. 异步生成器实现流式响应

#### 课堂验收说明（10分钟）

**练习 1：测试功能（必做）**
- [ ] 测试 WebSocket 聊天功能
- [ ] 测试诉求分析接口
- [ ] 测试成功率评估接口
- [ ] 截图保存结果

**练习 2：优化提示词（选做）**
- 修改 `CLAIM_ANALYSIS_SYSTEM_PROMPT`
- 尝试让输出更详细或更简洁
- 对比优化前后的效果

**练习 3：思考题（选做）**
1. 如何防止 WebSocket 连接超时？
2. 对话历史如果太长怎么处理？
3. 如何评估 AI 输出的质量？

#### 明日预告（5分钟）

**Day 3 课程内容**：

**上午**：
- 证据上传和文件处理
- 后台异步任务（BackgroundTasks）
- AI 证据分析

**下午**：
- Jinja2 模板引擎
- 文书自动生成
- API 性能优化

#### 答疑时间（35分钟）

---

### 讲师备注

**时间控制**：
- 上午重点：RAG 和提示词（各 40 分钟）
- 下午重点：WebSocket 实现（60 分钟）

**常见问题**：
1. WebSocket 连接失败 → 检查 token
2. 流式响应不显示 → 检查 streaming=True
3. JSON 解析失败 → 检查提示词约束

**教学建议**：
- 多演示，少讲理论
- 让学生跟着敲代码
- 及时解决报错问题

---

**Day 2 演讲稿完成！**

