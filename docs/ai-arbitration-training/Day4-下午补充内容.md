# Day 4 下午课程 - 项目答辩与总结
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

### 第三部分：项目部署和联调（14:00-15:30，90分钟）

#### 3.1 项目部署准备（30分钟）

**生产环境配置检查清单**：

```bash
# .env 生产环境配置
DEBUG=False                                    # ✅ 必须关闭
SECRET_KEY=生成强随机密钥                       # ✅ 必须修改
OPENAI_API_KEY=生产环境的Key                    # ✅ 检查配额

# 数据库配置
MYSQL_HOST=生产服务器IP
MYSQL_PASSWORD=强密码                           # ✅ 必须强密码

# 日志级别
LOG_LEVEL=INFO                                 # ✅ 不要用DEBUG
```

**生成强随机密钥**：

```python
# generate_secret_key.py
import secrets

# 生成 256 位随机密钥
secret_key = secrets.token_urlsafe(32)
print(f"SECRET_KEY={secret_key}")

# 输出示例：
# SECRET_KEY=xKj9mP2nQ5rS8tU1vW4xY7zA0bC3dE6fG9hI2jK5lM8nO1pQ4rS7tU0vW3xY6z
```

**依赖锁定**：

```bash
# 确保依赖版本一致
uv lock

# 部署时使用锁定文件
uv sync --frozen

# 或使用 requirements.txt
uv pip freeze > requirements-lock.txt
```

**数据库迁移**：

```bash
# 生产环境首次部署
uv run main.py migrate --env=dev

# 后续更新
uv run alembic upgrade head
```

**创建知识库并上传文档**：

课堂验收不用看本地向量文件，直接验证接口和页面状态：

1. `POST /ai/knowledge/create`：创建知识库。
2. `POST /ai/knowledge/document/upload`：上传法律文档并触发解析、切片、索引。
3. `POST /ai/knowledge/document/{id}/reindex`：需要时重建单个文档索引。
4. `POST /ai/knowledge/retrieval/test`：输入劳动争议问题，确认能返回相关片段。

**启动服务（生产模式）**：

```bash
# 方式1：使用 uvicorn（单进程）
uv run uvicorn main:app --host 0.0.0.0 --port 8000

# 方式2：使用 gunicorn（多进程，推荐）
gunicorn main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --access-logfile logs/access.log \
    --error-logfile logs/error.log \
    --daemon

# 方式3：使用 systemd（自动重启）
# 创建服务文件 /etc/systemd/system/fastcloud.service
```

**Nginx 反向代理（可选）**：

```nginx
# /etc/nginx/sites-available/fastcloud
server {
    listen 80;
    server_name api.fastcloud.com;
    
    # 上传文件大小限制
    client_max_body_size 10M;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # WebSocket 支持
    location /api/chat/ws {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

#### 3.2 前后端联调（30分钟）

**API 文档测试**：

```bash
# 1. 访问 API 文档
http://localhost:8000/docs

# 2. 测试所有核心接口
- POST /api/login              ✅ 登录
- GET  /api/profile            ✅ 获取用户信息
- POST /api/claim/analyses     ✅ 诉求分析
- POST /api/claim/evaluations  ✅ 成功率评估
- POST /api/evidences          ✅ 证据上传
- POST /api/documents/...      ✅ 文书生成
- WS   /api/chat/ws            ✅ WebSocket 聊天
```

**前端集成示例（Vue3）**：

```javascript
// api/auth.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
})

// 请求拦截器（自动添加 Token）
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器（处理错误）
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      // Token 过期，跳转登录
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

```javascript
// 使用示例
import api from './api/auth'

// 登录
async function login(username, password) {
  const res = await api.post('/login', { username, password })
  localStorage.setItem('token', res.data.access_token)
}

// 获取用户信息
async function getProfile() {
  const res = await api.get('/profile')
  return res.data
}

// WebSocket 聊天
function connectChat() {
  const token = localStorage.getItem('token')
  const ws = new WebSocket(`ws://localhost:8000/api/chat/ws?token=${token}`)
  
  ws.onopen = () => {
    console.log('WebSocket 连接成功')
  }
  
  ws.onmessage = (event) => {
    console.log('收到消息:', event.data)
    // 逐字显示
    appendMessage(event.data)
  }
  
  ws.onerror = (error) => {
    console.error('WebSocket 错误:', error)
  }
  
  return ws
}
```

#### 3.3 常见联调问题（30分钟）

**问题 1：跨域错误（CORS）**

```
错误：
Access to fetch at 'http://localhost:8000/api/login' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**解决**：

```python
# main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",    # 前端开发地址
        "https://fastcloud.com",    # 生产域名
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**问题 2：WebSocket 握手失败**

```
错误：
WebSocket connection to 'ws://localhost:8000/api/chat/ws' failed: 
Error during WebSocket handshake
```

**排查步骤**：

```javascript
// 1. 检查 token 是否传递
const token = localStorage.getItem('token')
console.log('Token:', token)  // 不应该是 null

// 2. 检查 URL 格式
const url = `ws://localhost:8000/api/chat/ws?token=${token}`
console.log('WebSocket URL:', url)

// 3. 检查后端日志
// 查看是否有鉴权失败的日志
```

**问题 3：文件上传失败**

```
错误：
413 Payload Too Large
```

**解决**：

```python
# 检查文件大小限制
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# 增加限制（如果需要）
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

# Nginx 配置也需要调整
client_max_body_size 50M;
```

---

### 第四部分：项目答辩准备（15:40-17:30，110分钟）

#### 4.1 答辩 PPT 准备（40分钟）

**PPT 结构建议**（10-15 页）：

```
第1页：标题页
- 项目名称：AI 劳动仲裁辅助系统
- 团队成员
- 日期

第2页：项目背景
- 劳动纠纷现状数据
- 用户痛点分析
- 项目价值

第3页：核心功能
- AI 智能咨询（配截图）
- 维权诉求分析（配截图）
- 证据智能管理（配截图）
- 文书自动生成（配截图）

第4页：技术架构
- 系统架构图
- 技术栈列表

第5页：AI 核心技术
- RAG 检索增强生成
- 检索边界（向量 + BM25）
- 提示词工程

第6页：关键技术实现
- WebSocket 流式响应
- 后台异步任务
- JWT 认证

第7页：数据流程
- 用户提问 → RAG 检索 → AI 生成 → 流式返回

第8页：项目亮点
- AI 原生设计
- 企业级架构
- 生产就绪

第9页：演示视频/截图
- 实际使用效果

第10页：技术难点和解决方案
- 问题1：检索不准确 → 检索边界
- 问题2：AI 输出空泛 → 提示词优化
- 问题3：响应慢 → 异步 + 流式

第11页：项目收获
- 掌握的技术
- 遇到的挑战
- 个人成长

第12页：展望和优化
- 功能扩展
- 性能优化
- 部署上线

第13页：Q&A
- 感谢观看
```

**核心页面内容示例**：

```
【第5页：AI 核心技术】

RAG 检索增强生成
━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────┐
│  用户提问                    │
│  "公司辞退孕妇合法吗？"       │
└─────────────────────────────┘
            ↓
┌─────────────────────────────┐
│  向量检索 + BM25 检索         │
│  召回相关法条（Top-4）        │
└─────────────────────────────┘
            ↓
┌─────────────────────────────┐
│  构建 Prompt                 │
│  系统提示词 + 法条 + 问题     │
└─────────────────────────────┘
            ↓
┌─────────────────────────────┐
│  LLM 生成（流式输出）         │
│  逐字返回答案                 │
└─────────────────────────────┘

核心优势：
✓ 提高准确性（基于真实法条）
✓ 可追溯来源（知识有依据）
✓ 实时更新（更新文档即可）
```

#### 4.2 答辩演讲准备（30分钟）

**时间分配（总共 10 分钟）**：

```
1. 项目介绍（2分钟）
   - 背景和痛点
   - 核心功能概览

2. 功能演示（5分钟）
   - AI 智能咨询（1分钟）
   - 维权分析（2分钟）
   - 证据管理（1分钟）
   - 文书生成（1分钟）

3. 技术讲解（2分钟）
   - RAG 技术
   - 提示词工程
   - 技术亮点

4. 总结（1分钟）
   - 项目价值
   - 技术收获
```

**开场白示例**：

```
各位老师、各位同学，大家好！

我是 XXX，今天为大家展示的项目是《AI 劳动仲裁辅助系统》。

【展示第1页 PPT】

根据统计，中国每年有超过 100 万起劳动争议案件，但普通劳动者面临三大痛点：
1. 法律咨询贵（一次 500-1000 元）
2. 不知道该准备哪些证据
3. 不会写劳动仲裁申请书

为了解决这些问题，我们开发了这个 AI 赋能的劳动仲裁辅助系统。

【展示第2页 PPT】

接下来我将通过实际演示，为大家展示系统的核心功能...
```

**功能演示脚本**：

```
【AI 智能咨询演示】

现在我演示第一个功能：AI 智能咨询。

（打开系统，展示聊天界面）

我输入一个问题："公司可以辞退孕妇吗？"

（输入并回车）

大家看到，AI 在逐字逐句地回答，就像真人在打字。
这是我们实现的 WebSocket 流式响应。

（等待回答完成）

AI 不仅给出了答案，还引用了具体的法条——
《劳动合同法》第42条：女职工在孕期、产期、哺乳期的，
用人单位不得解除劳动合同。

这就是我们的核心技术 RAG（检索增强生成）的效果。
系统先从法律知识库检索相关法条，然后基于这些法条生成答案。

【维权分析演示】

接下来演示维权分析功能...
（继续演示其他功能）
```

#### 4.3 常见答辩问题准备（40分钟）

**技术类问题**：

**Q1：你们的 RAG 和纯 LLM 有什么区别？**

```
A：主要有三个区别：

1. 准确性：
   纯 LLM：容易产生"幻觉"，可能编造法条
   RAG：基于真实法条，准确性高

2. 时效性：
   纯 LLM：知识截止到训练时间（如2021年）
   RAG：更新文档即可，实时性强

3. 可追溯性：
   纯 LLM：不知道答案来源
   RAG：可以追溯到具体法条

举例：
如果问"2023年新修订的劳动合同法第XX条"
纯 LLM：无法回答（训练数据没有）
RAG：只要更新文档，就能回答
```

**Q2：为什么用检索边界，不只用向量检索？**

```
A：单一检索方法有局限性。

向量检索：
✓ 优势：语义理解好（"辞退"="解除劳动合同"）
✗ 劣势：精确匹配弱（"第47条"匹配不准）

BM25 关键词检索：
✓ 优势：精确匹配强（"第47条"能精确找到）
✗ 劣势：语义理解弱（"辞退"和"解除"匹配不上）

检索边界：
✓ 结合两者优势
✓ 检索准确率提升约 25%

实测数据：
- 纯向量检索：准确率 72%
- 纯 BM25：准确率 68%
- 检索边界：准确率 89%
```

**Q3：如何保证 AI 输出的质量？**

```
A：我们采用了多种措施：

1. 提示词工程：
   - 明确角色定位（资深律师）
   - 严格输出格式（JSON Schema）
   - 禁止空泛建议（不能说"收集证据"）

2. RAG 知识增强：
   - 提供真实法条作为依据
   - 限制 AI 的发挥空间

3. 结构化输出：
   - JSON 格式便于验证
   - 关键字段类型检查

4. 测试验证：
   - 准备了 50+ 个测试案例
   - 人工评估输出质量
```

**Q4：WebSocket 的优势是什么？**

```
A：相比 HTTP，WebSocket 有三大优势：

1. 实时双向通信：
   HTTP：客户端请求 → 服务器响应
   WebSocket：双向推送，服务器可主动发送

2. 长连接：
   HTTP：每次请求都要建立连接
   WebSocket：一次连接，持续通信

3. 流式传输：
   HTTP：必须等待完整响应（10-30秒）
   WebSocket：边生成边推送（实时显示）

用户体验对比：
HTTP：等待 20 秒 → 一次性显示全部内容
WebSocket：逐字显示，类似 ChatGPT 效果

这对 AI 对话场景非常重要。
```

**业务类问题**：

**Q5：这个系统的商业价值在哪里？**

```
A：主要有三个方向：

1. ToC（面向劳动者）：
   - 免费/低价法律咨询
   - 降低维权门槛
   - 广告或增值服务变现

2. ToB（面向律所）：
   - 辅助律师提升效率
   - SaaS 订阅模式
   - 按使用量收费

3. 数据价值：
   - 积累劳动纠纷案例库
   - 法律知识图谱
   - 司法大数据分析

市场规模：
中国每年 100 万+ 劳动争议案件
潜在用户数千万
```

**Q6：如何保证数据安全和隐私？**

```
A：我们采取了多层安全措施：

1. 认证授权：
   - JWT Token 认证
   - 用户数据隔离
   - 权限细粒度控制

2. 数据加密：
   - 密码 密码哈希 加密
   - HTTPS 传输加密
   - 敏感字段脱敏

3. 访问控制：
   - 扩展了解：接口限流（防止爬虫）
   - IP 黑名单
   - 异常访问监控

4. 合规性：
   - 用户协议（数据使用说明）
   - 数据保留期限
   - 用户可删除数据

符合《网络安全法》和《个人信息保护法》要求。
```

**Q7：遇到的最大技术难点是什么？**

```
A：最大的难点是 RAG 检索的准确性。

问题：
刚开始时，向量检索经常召回不相关的内容。
例如查询"孕期辞退"，返回的是"试用期"相关内容。

原因分析：
1. 文档切片太大（1000字），语义稀释
2. 单一检索方法局限性
3. 没有考虑业务规则（法条优先级）

解决方案：
1. 优化切片参数（700字 + 120字重叠）
2. 实现检索边界（向量 + BM25）
3. 添加结果排序逻辑（法条标签加分）

结果：
准确率从 65% 提升到 89%

这个过程让我深刻理解了：
AI 应用不只是调用 API，更重要的是工程化和优化。
```

---

### 第五部分：模拟答辩和总结（17:30-18:00，30分钟）

#### 5.1 分组模拟答辩（20分钟）

每组 5 分钟演示 + 2 分钟提问：
1. 演示核心功能
2. 讲解技术亮点
3. 回答提问

（讲师点评每组的表现）

#### 5.2 四天课程总结（10分钟）

**技术收获**：
✅ AI 应用开发（LangChain、RAG、Prompt Engineering）
✅ 向量数据库（ChromaDB）
✅ 异步编程（async/await、WebSocket）
✅ 企业级工程实践（认证、限流、日志）

**项目亮点**：
✅ AI 原生设计
✅ 检索边界技术
✅ 流式响应体验
✅ 生产级代码质量

**能力提升**：
✅ 从 0 到 1 完成企业级项目
✅ 理解 AI 应用完整流程
✅ 掌握现代化技术栈
✅ 具备项目答辩能力

---

### 结束语

**恭喜大家完成四天的实训！**

通过这四天，大家从零开始，完成了一个企业级的 AI 应用项目。

这个项目不是简单的 CRUD，而是真正融合了：
- 大模型技术
- RAG 检索
- 向量数据库
- 实时通信
- 企业级工程实践

**这些技能在就业市场上非常稀缺和抢手！**

希望大家：
1. 持续优化项目（写进简历）
2. 深入学习 AI 技术（长期发展）
3. 保持好奇心（技术更新快）

**最后，祝大家项目答辩顺利，求职成功！**

---

### 讲师备注

**Day 4 教学重点**：
- 安全认证机制
- 部署和联调
- 答辩准备和指导

**时间分配建议**：
- 上午：技术讲解（JWT、扩展了解：第三方登录、限流）
- 下午前半：部署和联调
- 下午后半：答辩准备和模拟

**教学建议**：
1. 答辩准备要充分（PPT + 演讲稿）
2. 多组织模拟答辩（发现问题）
3. 准备常见问题答案（提前演练）
4. 给予学生信心（鼓励为主）

**项目评估标准**：
- AI 功能实现度（50%）
- 代码质量（20%）
- 答辩表现（20%）
- 创新和亮点（10%）

---

**🎉 四天实训课程全部完成！**

**祝所有学员项目答辩成功！**


