# Day 2: RAG 检索 + 提示词工程 - 详细演讲稿
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

大家早上好！欢迎来到第二天的课程。

昨天我们完成了环境搭建和向量知识库的构建，今天我们要深入 AI 的核心技术——**RAG 检索和提示词工程**。

#### 9:00-9:15 练习检查（15分钟）

首先检查大家的练习完成情况。

**练习 1 完成情况统计**：

请完成以下练习的同学举手：
- ✅ 环境搭建完成（`uv sync` 成功）：请举手
- ✅ 项目能正常启动（`uv run main.py run --env=dev`）：请举手
- ✅ 知识库上传与索引成功：请举手
- ✅ 测试了知识库检索：请举手

（讲师记录完成情况，表扬完成好的同学）

**练习 2 优秀案例展示**：

（选择 2-3 个做得好的同学，邀请他们分享）

"同学，能和大家分享一下你准备的法律文档吗？为什么选择这些文档？检索效果怎么样？"

#### 9:15-9:25 常见问题讲解（10分钟）

我收集了昨天大家遇到的主要问题，现在统一讲解。

**问题 1：uv sync 速度慢或失败**

**现象**：
```bash
uv sync
# 卡住不动或报错 "Failed to download package"
```

**原因和解决方案**：

```bash
# 原因 1：网络问题（访问 pypi.org 慢）
# 解决：使用国内镜像
uv sync --index-url https://pypi.tuna.tsinghua.edu.cn/simple

# 原因 2：代理设置问题
# 解决：临时关闭代理或正确配置代理

# 原因 3：某个包下载失败
# 解决：查看错误信息，单独安装有问题的包
uv pip install problematic-package
```

**问题 2：向量化速度慢**

**现象**：
上传文档后，文档状态长时间停留在解析中或索引中，说明 Embedding 调用或切片入库比较慢。

**优化方案**：

```python
# backend/app/config/setting.py
# 调整批处理参数（需要重启服务）

# 增大批次大小（默认 8，可以改到 16）
OPENAI_EMBEDDING_BATCH_SIZE = 16

# 减少暂停时间（默认 0.6秒，可以改到 0.3秒）
OPENAI_EMBEDDING_BATCH_PAUSE_SECONDS = 0.3
```

注意：批次太大可能触发 OpenAI 的 rate limit，根据你的 API 等级调整。

**问题 3：检索结果不准确**

**现象**：
```python
query = "怀孕期间能被辞退吗？"
# 检索结果都是不相关的内容
```

**原因分析**：

1. **文档切片太大**：语义被稀释
2. **文档切片太小**：上下文不完整
3. **检索数量不够**：top_k 太小

**优化方案**：

```python
# backend/app/config/setting.py

# 调整切片大小
VECTOR_CHUNK_SIZE = 800  # 增大（默认 700）
VECTOR_CHUNK_OVERLAP = 150  # 增大重叠（默认 120）

# 调整检索数量
VECTOR_SEARCH_TOP_K = 6  # 增加返回数量（默认 4）

# 调整相似度阈值
VECTOR_MIN_SCORE = 0.15  # 降低阈值（默认 0.2）
```

调整后需要调用 `POST /ai/knowledge/document/{id}/reindex` 重建对应文档索引。

#### 9:25-9:30 今日课程预览（5分钟）

**上午内容**：
1. RAG 技术深入（检索边界、结果排序）
2. 提示词工程实战
3. 结构化输出（JSON Schema）

**下午内容**：
1. WebSocket 实时通信
2. 实现 AI 咨询对话功能
3. 实现维权诉求分析功能

**今天的目标**：
完成项目的**两个核心 AI 功能**，让你的系统真正能够智能对话和案件分析！

（展示今天要实现的功能效果图或演示）

好，我们正式开始今天的课程。

---

### 第一部分：RAG 技术深入（9:30-10:50，80分钟）

#### 1.1 回顾：纯向量检索的局限（10分钟）

昨天我们实现了基于向量的语义检索。但它有局限性。

**场景演示 1：专业术语查询**

我现在在终端测试：

```http
POST /ai/knowledge/retrieval/test
Content-Type: application/json

{
  "query": "第47条怎么规定的？",
  "knowledge_base_ids": [1],
  "top_k": 3
}
```

（演示运行，展示结果）

大家看到了吗？向量检索可能效果不好，因为：
- "47" 是数字，语义特征不明显
- 需要**精确匹配**"第47条"或"第四十七条"
- 纯语义理解可能匹配到其他条款

**场景演示 2：关键词密集查询**

```python
query = "女职工 孕期 产期 哺乳期 解除劳动合同"
# 同样通过 /ai/knowledge/retrieval/test 观察返回片段
```

（演示运行）

这种查询包含多个关键词，传统的 **BM25 算法**可能更有效，因为它基于词频匹配。

**结论**：

```
向量检索优势：
✅ 语义理解（"辞退" = "解除劳动合同"）
✅ 模糊匹配
✅ 跨语言（理论上）

向量检索劣势：
❌ 精确匹配弱（"第47条"）
❌ 关键词密集查询效果差
❌ 稀有词匹配不准

结论：单一检索方法不够，需要检索边界（Hybrid Search）！
```

#### 1.2 BM25 关键词检索原理（15分钟）

**什么是 BM25？**

BM25（Best Matching 25）是一种基于词频的检索算法，是 TF-IDF 的改进版。

**核心思想**（在白板上画图）：

```
文档评分 = Σ (每个查询词的得分)

单个词的得分 = IDF(词) × TF(词, 文档) × 调整因子

其中：
- IDF：逆文档频率（词越稀有，权重越大）
- TF：词频（词出现越多，分数越高，但有上限）
- 调整因子：考虑文档长度
```

**通俗解释**：

假设查询是"孕期 解除 劳动合同"，有三个文档：

```
文档A："劳动合同法第42条规定，女职工在孕期、产期、哺乳期的，用人单位不得解除劳动合同。"
文档B："劳动合同法第39条规定了用人单位可以解除劳动合同的情形。"
文档C："工伤保险条例第33条规定了工伤待遇。"

BM25 评分：
文档A：
- "孕期" 出现 1 次（稀有词，高分）
- "解除" 出现 1 次
- "劳动合同" 出现 2 次
- 总分：约 3.8

文档B：
- "孕期" 未出现
- "解除" 出现 1 次
- "劳动合同" 出现 2 次
- 总分：约 1.2

文档C：
- 都未出现
- 总分：0

排序：A > B > C ✅ 正确！
```

**中文分词（jieba）演示**：

```python
# 演示 jieba 分词
import jieba

text = "劳动者在本单位工作的年限，每满一年支付一个月工资"
words = list(jieba.cut(text))
print(words)
# ['劳动者', '在', '本', '单位', '工作', '的', '年限', '，', '每', '满', '一年', '支付', '一个', '月', '工资']

# 去除停用词后
stopwords = {'在', '的', '，', '每', '一个'}
keywords = [w for w in words if w not in stopwords and len(w) > 1]
print(keywords)
# ['劳动者', '本', '单位', '工作', '年限', '满', '一年', '支付', '月', '工资']
```

**BM25 代码示例**（快速演示）：

```python
# test_bm25.py
from rank_bm25 import BM25Okapi
import jieba

# 准备文档（已分词）
documents = [
    "劳动合同法 第42条 女职工 孕期 产期 哺乳期 不得 解除 劳动合同",
    "劳动合同法 第47条 经济补偿 按 劳动者 工作 年限 计算",
    "劳动合同法 第87条 违法 解除 劳动合同 支付 赔偿金 二倍"
]

# 分词
tokenized_docs = [list(jieba.cut(doc)) for doc in documents]

# 创建 BM25 索引
bm25 = BM25Okapi(tokenized_docs)

# 查询
query = "孕期可以解除劳动合同吗"
tokenized_query = list(jieba.cut(query))

# 获取分数
scores = bm25.get_scores(tokenized_query)
print("BM25 分数:", scores)
# [2.15, 0.31, 0.85]  ← 第1个文档分数最高！

# 获取 Top-K
top_docs = bm25.get_top_n(tokenized_query, documents, n=2)
for doc in top_docs:
    print(doc)
```

（实际运行展示）

看到了吗？BM25 准确地找到了第42条关于孕期的规定！

#### 1.3 检索边界实现（30分钟）

现在我们把向量检索和 BM25 结合起来。

**检索边界策略**（在白板上画流程图）：

```
用户查询："孕期可以被辞退吗？"
    ↓
【阶段1：并行检索】
    ├─→ 向量检索：召回 Top-12
    └─→ BM25 检索：召回 Top-12
    ↓
【阶段2：结果排序（Rerank）】
    ↓
融合策略：
1. 分数归一化（0-1）
2. 加权融合（α × 向量分数 + β × BM25分数）
3. 考虑文档来源权重
4. 考虑法条标签匹配
    ↓
【阶段3：输出】
最终 Top-4 结果
```

**查看项目代码**：

打开 `backend/app/plugin/module_ai/chat/rag.py`，看 `ChromaKnowledgeRetriever.retrieve()` 和 `RagChatChain`：

```python
# backend/app/plugin/module_ai/chat/rag.py（核心代码讲解）
class ChromaKnowledgeRetriever:
    async def retrieve(self, *, query, user_id, dept_id,
                       session_id=None, knowledge_base_ids=None, files=None):
        # 1. 从 Chroma 中检索知识库片段
        # 2. 把前端临时上传的文件也转成候选上下文
        # 3. 返回 RagDocument 列表给 Prompt Builder
        ...


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
```

（逐行讲解代码逻辑）

**向量检索方法**：

```python
def _vector_search(self, query: str, top_k: int):
    """调用 ChromaDB 进行向量检索"""
    
    # 查询 ChromaDB
    results = self.collection.query(
        query_texts=[query],
        n_results=top_k,
        include=['documents', 'metadatas', 'distances']
    )
    
    # 转换为统一格式
    chunks = []
    for i in range(len(results['ids'][0])):
        chunk = RetrievedChunk(
            chunk_id=results['ids'][0][i],
            source_name=results['metadatas'][0][i].get('source', ''),
            text=results['documents'][0][i],
            score=1 - results['distances'][0][i]  # 距离转相似度
        )
        chunks.append(chunk)
    
    return chunks
```

**BM25 检索方法**：

```python
def _bm25_search(self, query: str, top_k: int):
    """BM25 关键词检索"""
    
    if not JIEBA_AVAILABLE:
        logger.warning("jieba 未安装，跳过 BM25 检索")
        return []
    
    # 分词
    query_tokens = list(jieba.cut(query))
    query_tokens = [t for t in query_tokens if len(t) > 1]  # 过滤单字
    
    # 获取 BM25 分数
    scores = self.bm25.get_scores(query_tokens)
    
    # 排序并返回 Top-K
    top_indices = np.argsort(scores)[::-1][:top_k]
    
    results = []
    for idx in top_indices:
        if scores[idx] > 0:  # 过滤零分
            results.append(RetrievedChunk(
                chunk_id=f"bm25_{idx}",
                source_name=self.all_chunks[idx].source_name,
                text=self.all_chunks[idx].text,
                score=scores[idx]
            ))
    
    return results
```

**结果排序方法**（核心算法）：

```python
def _rerank(self, vector_results, bm25_results, query, top_k):
    """结果排序：融合两种检索结果"""
    
    # 1. 分数归一化（MinMax Normalization）
    vector_scores_norm = self._normalize_scores([r.score for r in vector_results])
    bm25_scores_norm = self._normalize_scores([r.score for r in bm25_results])
    
    # 2. 构建文档分数字典
    doc_scores = {}
    
    # 向量检索结果（权重 0.7）
    for i, result in enumerate(vector_results):
        doc_id = result.chunk_id
        doc_scores[doc_id] = {
            'chunk': result,
            'vector_score': vector_scores_norm[i],
            'bm25_score': 0.0,
            'combined_score': 0.0
        }
    
    # BM25 检索结果（权重 0.3）
    for i, result in enumerate(bm25_results):
        doc_id = result.chunk_id
        if doc_id in doc_scores:
            doc_scores[doc_id]['bm25_score'] = bm25_scores_norm[i]
        else:
            doc_scores[doc_id] = {
                'chunk': result,
                'vector_score': 0.0,
                'bm25_score': bm25_scores_norm[i],
                'combined_score': 0.0
            }
    
    # 3. 计算融合分数
    alpha = 0.7  # 向量权重
    beta = 0.3   # BM25 权重
    
    for doc_id, scores in doc_scores.items():
        scores['combined_score'] = (
            alpha * scores['vector_score'] +
            beta * scores['bm25_score']
        )
    
    # 4. 排序
    sorted_docs = sorted(
        doc_scores.items(),
        key=lambda x: x[1]['combined_score'],
        reverse=True
    )
    
    # 5. 返回 Top-K
    final_results = []
    for doc_id, scores in sorted_docs[:top_k]:
        chunk = scores['chunk']
        chunk.score = scores['combined_score']  # 更新为融合分数
        final_results.append(chunk)
    
    return final_results

def _normalize_scores(self, scores):
    """MinMax 归一化"""
    if not scores or max(scores) == min(scores):
        return [0.0] * len(scores)
    
    min_score = min(scores)
    max_score = max(scores)
    return [(s - min_score) / (max_score - min_score) for s in scores]
```

（逐步讲解结果排序算法的每一步）

**实战测试**：

使用 `POST /ai/knowledge/retrieval/test` 连续测试：

1. `第47条怎么规定的？`
2. `孕期产期哺乳期可以解除劳动合同吗？`
3. `公司辞退员工需要赔偿多少？`
4. `工作5年被辞退赔偿`

每个问题都看三件事：返回片段是否相关、来源文档是否正确、内容是否足够支撑最终回答。

（运行测试，展示结果）

大家对比一下，检索边界的效果是不是比纯向量检索好很多？

#### 1.4 结果排序优化策略（25分钟）

除了简单的分数融合，我们还可以根据业务规则进行结果排序优化。

**优化策略 1：来源权重加分**

不同来源的文档，权威性不同：

```python
# 定义来源权重
SOURCE_WEIGHTS = {
    "劳动合同法.txt": 1.3,          # 最权威，加 30%
    "劳动争议调解仲裁法.txt": 1.2,  # 次之，加 20%
    "工伤保险条例.txt": 1.1,        # 一般，加 10%
    "司法解释.txt": 1.15,
    "案例库.txt": 0.9,              # 参考价值较低，减 10%
}

# 在结果排序时应用
for doc_id, scores in doc_scores.items():
    source = scores['chunk'].source_name
    weight = SOURCE_WEIGHTS.get(source, 1.0)
    scores['combined_score'] *= weight
```

**优化策略 2：法条引用标签加分**

如果文档包含法条引用标签（如"第42条"、"第四十七条"），优先召回：

```python
# 检测法条标签
import re

def has_article_reference(text):
    """检测是否包含法条引用"""
    patterns = [
        r'第[一二三四五六七八九十百]+条',  # 第四十七条
        r'第\d+条',                         # 第47条
    ]
    for pattern in patterns:
        if re.search(pattern, text):
            return True
    return False

# 在结果排序时加分
REFERENCE_LABEL_BONUS = 0.2  # 加 20%

for doc_id, scores in doc_scores.items():
    text = scores['chunk'].text
    if has_article_reference(text):
        scores['combined_score'] += REFERENCE_LABEL_BONUS
```

**优化策略 3：查询词法条匹配**

如果查询中提到具体法条，精确匹配该法条：

```python
def extract_article_from_query(query):
    """从查询中提取法条号"""
    patterns = [
        r'第?(\d+)条',
        r'第([一二三四五六七八九十百]+)条',
    ]
    for pattern in patterns:
        match = re.search(pattern, query)
        if match:
            return match.group(0)
    return None

# 使用
article = extract_article_from_query("第47条怎么规定的？")
if article:
    # 大幅加分给包含该法条的文档
    for doc_id, scores in doc_scores.items():
        if article in scores['chunk'].text:
            scores['combined_score'] += 0.5  # 加 50%
```

**优化策略 4：章节关键词匹配**

识别查询的主题，优先召回相关章节：

```python
CHAPTER_KEYWORDS = {
    "解除": ["第四章", "解除和终止", "第39条", "第40条", "第41条", "第42条"],
    "赔偿": ["第八章", "法律责任", "第87条", "经济补偿"],
    "孕期": ["女职工", "孕期", "产期", "哺乳期", "第42条"],
}
```

课堂讲到这里就停，不要求学生现场手写完整排序算法。重点让他们理解：检索不是“把相似度最高的片段直接塞给模型”，而是要结合业务词、法条号、章节和上下文一起判断。

---

## 讲师增强版：Day2 完整讲授口径

Day2 的目标是把 Day1 的“能检索”推进到“检索得准、Prompt 约束得住、回答能解释来源”。不要把上午讲成算法课，也不要把下午讲成提示词口号课。全天主线是：法律辅助回答的质量，首先取决于检索依据，其次取决于 Prompt 约束，最后才是模型表达。

### 1. 今日开场话术

> 昨天我们证明了材料能上传、能切片、能进入检索。今天要解决更关键的问题：系统召回的片段是不是真的能支撑回答？如果召回错了，模型再强也只能基于错误上下文生成一个看起来很像真的答案。

板书：

```text
问题质量 -> 检索质量 -> Prompt 质量 -> 回答质量 -> 人工复核
```

### 2. 贯穿案例

继续使用张三被辞退案例，但今天要拆成四类问题：

| 问题 | 检索目标 | 讲解重点 |
|---|---|---|
| 公司口头辞退我合法吗？ | 解除劳动合同的程序和限制 | 语义检索 |
| 工作 5 年被辞退怎么补偿？ | 经济补偿年限和月工资标准 | 法条精确召回 |
| 第 47 条怎么规定？ | 明确法条编号 | 关键词/BM25 更可靠 |
| 孕期被辞退怎么办？ | 特殊保护条款 | 业务词和法条词映射 |

讲师提醒：

> 同一个案件，不同问法会触发不同检索策略。法律系统不能只靠“相似度最高”，还要理解法条号、业务关键词和用户表达之间的关系。

### 3. RAG 深入讲法

把 RAG 拆成五个可观察节点：

```text
用户问题
  -> query 改写或保留
  -> 选择知识库 knowledge_base_ids
  -> 检索 top_k 片段
  -> 组装 Prompt
  -> 模型生成回答
```

每讲一个节点，都问学生一个问题：

- query 是否太短或太口语？
- 有没有选错知识库？
- top_k 是不是过少或过多？
- Prompt 有没有要求“不得编造”？
- 回答有没有引用检索片段能支撑的内容？

### 4. BM25 与向量检索讲法

不要只讲公式。用对比案例讲：

```text
问题 A：第47条怎么规定？
问题 B：公司把我开了要赔几个月工资？
```

讲法：

- 问题 A 有明确法条编号，关键词检索更稳定。
- 问题 B 是口语表达，向量检索更容易匹配“解除劳动合同”“经济补偿”。
- 真正的法律 RAG 往往要混合两种能力。

课堂互动：

> 现在大家判断一下，“哺乳期被辞退”更适合关键词检索还是向量检索？如果材料里写的是“女职工在孕期、产期、哺乳期”，向量检索会有帮助；如果用户明确问“第42条”，关键词检索会更稳。

### 5. Prompt 工程讲法

Prompt 不只是“写得礼貌一点”。在法律辅助场景，Prompt 至少要约束四件事：

| 约束 | 示例 |
|---|---|
| 角色 | 你是劳动争议咨询助手，不替代律师。 |
| 依据 | 只能基于检索片段和用户事实回答。 |
| 输出结构 | 结论、依据、证据建议、风险提示。 |
| 不确定性 | 事实不足时标注“需补充”，不得自行编造。 |

推荐课堂模板：

```text
请基于以下检索材料回答用户问题。
如果材料不足，请明确说明需要补充哪些事实。
回答必须包含：
1. 初步判断
2. 依据片段
3. 还需要的证据
4. 风险提示
不得把 AI 输出表述为最终法律意见。
```

### 6. 检索调试演示流程

每次回答不准时，按这个顺序排查：

1. 看 `retrieval/test` 返回片段是否相关。
2. 看 `knowledge_base_ids` 是否选对。
3. 看文档解析和索引状态是否成功。
4. 看 query 是否需要更明确。
5. 看 Prompt 是否把依据和约束传给模型。
6. 最后再看模型参数和模型能力。

讲师话术：

> 不要一上来就说“模型不好”。AI 应用调试要先看输入证据。如果证据没进 Prompt，模型是在盲答。

### 7. Day2 下午练习建议

让学生围绕同一个案例完成三组对比：

| 练习 | 要求 |
|---|---|
| 检索对比 | 分别输入口语问题、法条编号问题、特殊人群问题，截图比较返回片段。 |
| Prompt 对比 | 用宽松 Prompt 和严格 Prompt 各问一次，比较是否出现无依据扩展。 |
| 回答验收 | 标出回答中哪一句由哪个检索片段支撑，哪一句需要人工复核。 |

### 8. Day2 课堂验收标准

学生结束前要能完成：

- 解释向量检索和关键词检索的差异。
- 用 `/ai/knowledge/retrieval/test` 验证至少 3 个问题。
- 判断一个召回片段是否能支撑回答。
- 写出一个带“依据、结构、边界”的 Prompt。
- 说明回答不准时的排查顺序。

Day2 收尾话术：

> 今天我们不是在追求让模型说得更像律师，而是在让系统回答更可追溯。一个成熟的 AI 法律辅助系统，必须能回答：依据从哪里来，为什么召回它，哪些结论需要人复核。

