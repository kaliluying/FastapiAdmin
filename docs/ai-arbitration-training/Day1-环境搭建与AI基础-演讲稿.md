# Day 1: 环境搭建 + AI 基础 - 详细演讲稿
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

### 开场白（9:00-9:10，10分钟）

大家早上好！欢迎来到 AI 劳动仲裁辅助系统的实训课程。我是你们的讲师 [讲师姓名]。

在接下来的四天时间里，我们将一起完成一个**企业级 AI 应用项目**的开发。这不是一个简单的增删改查项目，而是一个真正融合了**大模型、RAG技术、向量数据库**的现代化 AI 应用。

**课程目标**：
- 让大家真正掌握 AI 应用开发的核心技能
- 从零到一完成一个可以写进简历的项目
- 理解企业级 AI 项目的完整开发流程

**四天课程安排快速预览**：
- Day 1（今天）：环境搭建 + AI 基础理论
- Day 2：RAG 检索 + 提示词工程
- Day 3：证据管理 + 文书生成
- Day 4：安全认证 + 项目答辩

好，废话不多说，我们开始今天的课程。

---

### 第一部分：项目介绍和演示（9:10-9:40，30分钟）

#### 1.1 项目背景（5分钟）

首先，我想问大家一个问题：**有没有同学或者家人遇到过劳动纠纷？**

（互动：让学生举手）

对，很常见对吧。根据统计，中国每年有超过 100 万起劳动争议案件。但普通劳动者面临的问题是：

❌ **法律咨询贵**：请律师咨询一次要 500-1000 元  
❌ **维权流程复杂**：不知道该准备哪些证据  
❌ **文书写作难**：劳动仲裁申请书不会写  
❌ **判断不准**：不知道自己能不能赢

所以我们开发了 本系统，用 AI 技术解决这些痛点。

#### 1.2 系统核心功能演示（20分钟）

现在我给大家演示一下这个系统的核心功能。请大家注意观察，这些功能都是我们接下来四天要一起实现的。

**【打开系统，开始演示】**

**功能 1：AI 智能咨询（5分钟）**

我现在在聊天界面输入一个问题：

```
"公司突然通知我明天不用来上班了，说是业绩不好。
我在公司工作了3年，这样合法吗？能要求赔偿吗？"
```

（输入后回车，展示流式响应）

大家看到了吗？AI 在**逐字逐句**地回答，就像真人在打字一样。这叫做**流式响应**，是我们 Day 2 要重点讲的技术。

而且你们注意，AI 的回答不是空洞的，它引用了具体的法条：

- 《劳动合同法》第39条、第40条
- 提到了经济补偿金的计算方式
- 给出了具体的维权建议

**问题**：AI 是怎么知道这些法条的？

**答案**：这就是我们的核心技术 **RAG（检索增强生成）**。系统先在法律知识库里检索相关法条，然后把检索结果和问题一起发给 AI，AI 基于这些知识做出回答。

**功能 2：维权诉求分析（5分钟）**

现在我输入一段更详细的案情描述：

```
"我在某科技公司担任产品经理，月薪8000元，工作了5年。
上个月公司突然通知我被辞退，理由是我怀孕了影响工作。
公司没有给任何赔偿，只让我当天收拾东西走人。"
```

（点击"分析诉求"按钮）

系统自动提取了两个关键信息：

1. **权利主张**：要求公司支付违法解除劳动合同赔偿金，并认定公司存在就业歧视
2. **案件摘要**：劳动者怀孕期间被辞退，核心争议是公司是否构成违法解除...（展示完整内容）

**功能 3：成功率评估（5分钟）**

在刚才的基础上，点击"评估成功率"。

系统给出了：
- **胜诉概率：85%**（高）
- **法律依据**：劳动合同法第42条、第87条（具体展示）
- **下一步行动**：3条非常具体的建议（不是"收集证据"这种废话）

比如第一条建议：
```
"立即收集公司邮件、钉钉通知，证明公司知晓怀孕事实的时间"
```

这些建议都是 AI 基于法律知识和实际案例生成的。

**功能 4：证据管理（3分钟）**

（演示上传一份劳动合同 PDF）

上传后，系统自动分析：
- 识别证据类型：劳动合同
- 评估证据效力：高
- 提取关键信息：合同期限、工资金额、岗位

**功能 5：文书生成（2分钟）**

（演示生成劳动仲裁申请书）

点击生成，系统自动填充：
- 申请人信息
- 被申请人信息
- 仲裁请求
- 事实与理由
- 证据清单

生成的文书可以直接打印使用。

#### 1.3 技术栈介绍（5分钟）

刚才演示的这些功能，背后使用了哪些技术呢？

**后端技术栈**：
```
Python 3.12        ← 编程语言
FastAPI           ← Web 框架（异步、高性能）
LangChain         ← AI 编排框架（核心）
OpenAI OpenAI 兼容模型    ← 大语言模型
ChromaDB          ← 向量数据库（核心）
MySQL             ← 业务数据库
Redis             ← 缓存（可选）
```

**核心 AI 技术**：
```
RAG              ← 检索增强生成
Embedding        ← 文本向量化
Prompt Engineering ← 提示词工程
Streaming        ← 流式响应
```

**前端技术**：（简单提一下）
```
Vue3 + Element Plus
WebSocket 实时通信
```

好，演示到这里。大家对项目有个整体印象了吗？

（互动：询问学生是否有疑问）

---

### 第二部分：环境搭建（9:40-11:10，90分钟）

现在我们开始动手，把开发环境搭建起来。

#### 2.1 检查系统环境（10分钟）

首先，确认大家的电脑满足以下要求：

**硬件要求**：
- CPU：4核以上
- 内存：8GB 以上（推荐 16GB）
- 硬盘：至少 20GB 可用空间

**操作系统**：
- Windows 10/11
- macOS 10.15+
- Linux（Ubuntu 20.04+）

**必备软件**：
1. Python 3.12
2. MySQL 8.0
3. Git
4. VS Code 或 PyCharm

现在请大家打开终端（Windows 用 PowerShell，Mac/Linux 用 Terminal），输入以下命令检查：

```bash
# 检查 Python 版本
python --version
# 应该输出：Python 3.12.x

# 检查 pip
pip --version

# 检查 Git
git --version

# 检查 MySQL
mysql --version
```

（讲师巡视，帮助遇到问题的学生）

#### 2.2 克隆项目代码（5分钟）

```bash
# 1. 克隆项目
git clone https://github.com/your-repo/AI 劳动仲裁辅助系统.git

# 2. 进入项目目录
cd AI 劳动仲裁辅助系统

# 3. 查看项目结构
ls -la    # Mac/Linux
dir       # Windows
```

**项目目录结构讲解**（边看边讲）：

```
AI 劳动仲裁辅助系统/
├── backend/
│   ├── alembic/          # 数据库迁移脚本
│   ├── main.py           # 后端启动和 Typer 命令入口
│   └── app/
│       ├── api/          # 通用系统接口
│       ├── plugin/       # AI 插件等业务扩展模块
│       │   └── module_ai/
│       │       ├── chat/      # AI 对话、RAG、会话历史
│       │       └── knowledge/ # 知识库、文档上传、切片索引
│       ├── core/         # 依赖、权限、路由发现等基础能力
│       └── config/       # 环境变量和服务配置
├── frontend/web/         # 前端页面
├── courseware/           # 课堂投屏课件
└── docs/ai-arbitration-training/ # 讲师备课资料
```

#### 2.3 安装 uv 包管理器（5分钟）

**什么是 uv？**

uv 是一个超快速的 Python 包管理器，由 Astral 开发（Ruff 的作者）。

**为什么用 uv？**

✅ **极速安装**：比 pip 快 10-100 倍  
✅ **统一工具**：同时管理虚拟环境和依赖  
✅ **现代化**：支持 pyproject.toml  
✅ **兼容性好**：完全兼容 requirements.txt

**安装 uv**：

```bash
# Windows (PowerShell)
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# 或者使用 pip 安装
pip install uv

# 验证安装
uv --version
# 应该输出：uv 0.4.x
```

（讲师巡视，帮助学生安装 uv）

#### 2.4 创建虚拟环境（5分钟）

使用 uv 创建虚拟环境：

```bash
# 创建虚拟环境（自动检测 Python 版本）
uv venv

# 激活虚拟环境
# Windows:
.venv\Scripts\activate

# Mac/Linux:
source .venv/bin/activate

# 激活后，命令行前面会出现 (.venv) 标识
```

**uv venv 的优势**：
- 比 python -m venv 快 10 倍
- 自动选择合适的 Python 版本
- 更小的虚拟环境体积

#### 2.5 安装依赖包（10分钟）

**方式 1：使用 uv sync（推荐，官方方式）**

```bash
# 一条命令搞定！自动读取 pyproject.toml 并安装所有依赖
uv sync

# uv sync 会做什么：
# 1. 读取 pyproject.toml 中的 dependencies
# 2. 解析所有依赖关系
# 3. 安装所有需要的包
# 4. 自动生成 uv.lock 锁定文件
# 5. 确保团队环境完全一致

# 总耗时：约 5-10 秒！⚡
```

**方式 2：兼容旧项目（如果项目只有 requirements.txt）**

```bash
# 如果项目还没有完善的 pyproject.toml
uv pip install -r requirements.txt

# 耗时：约 8-10 秒
```

**为什么 uv 这么快？**

```
传统 pip 的流程：
1. 下载包 → 解压 → 编译（如果需要）→ 安装
2. 串行处理，一个接一个
3. 每次都重新解析依赖

uv 的优化：
1. 并行下载和安装
2. 本地缓存（第二次安装秒完成）
3. Rust 编写，性能极致
4. 智能依赖解析

结果：快 10-100 倍！⚡
```


**依赖包讲解**（在安装过程中讲解核心包）：

```python
# AI 核心包
langchain==1.2.0              # AI 编排框架
langchain-openai==1.1.6       # OpenAI 集成
chromadb>=1.0.0               # 向量数据库

# Web 框架
fastapi[standard]>=0.135.1    # Web 框架
uvicorn[standard]>=0.41.0     # ASGI 服务器

# 数据库
sqlalchemy>=2.0.41            # ORM 框架
alembic>=1.15.1               # 数据库迁移
pymysql>=1.1.2                # MySQL 驱动

# 认证加密
pyjwt>=2.10.1                 # JWT 令牌
密码哈希>=4.0.1                 # 密码安全

# 文件处理
pypdf>=5.1.0,<6                # PDF 解析
openpyxl>=3.1.0               # Excel 处理

# 工具
loguru>=0.7.0                 # 日志框架
python-dotenv>=1.0.0          # 环境变量
```

（等待安装完成，期间可以解答学生问题）

**安装速度对比**：

```
传统 pip：2-3 分钟 ⏱️
现代 uv：5-10 秒 ⚡ ← 快 20-30 倍！
```

安装完成后验证：

```bash
# 查看已安装的包
uv pip list

# 验证关键包
python -c "import fastapi; print(fastapi.__version__)"
python -c "import langchain; print(langchain.__version__)"
```

**uv 核心命令**（重点介绍）：

```bash
# === 官方推荐方式（使用 pyproject.toml）===

# 1. 同步依赖（最常用）
uv sync
# 根据 pyproject.toml 安装所有依赖，生成 uv.lock

# 2. 添加新依赖
uv add redis
# 自动添加到 pyproject.toml 并安装

# 3. 添加开发依赖
uv add --dev pytest black ruff
# 添加到 [project.optional-dependencies.dev]

# 4. 移除依赖
uv remove redis
# 从 pyproject.toml 移除并卸载

# 5. 升级依赖
uv lock --upgrade-package fastapi
# 升级特定包并更新 uv.lock

# 6. 运行脚本（无需激活虚拟环境）
uv run main.py --help
uv run pytest

# === 兼容方式（使用 requirements.txt）===

# 安装
uv pip install -r requirements.txt

# 导出
uv pip freeze > requirements.txt
```

**重点讲解 uv sync**：

```bash
# uv sync 是 uv 的核心命令
# 它会确保你的环境和 pyproject.toml 完全一致

# 场景 1：首次克隆项目
git clone xxx
cd project
uv sync  # 一条命令，环境就绪！

# 场景 2：拉取最新代码后
git pull
uv sync  # 自动安装新依赖，删除废弃依赖

# 场景 3：切换分支后
git checkout feature-branch
uv sync  # 环境自动同步到该分支的依赖
```

**uv.lock 文件的作用**：

```
uv.lock 是什么？
- 锁定所有依赖的精确版本
- 包括间接依赖（依赖的依赖）
- 确保团队环境完全一致

类比：
- pyproject.toml = "我要 fastapi >= 0.110"（范围）
- uv.lock = "我要 fastapi 0.110.3"（精确版本）

好处：
- 避免"在我机器上能跑"的问题
- CI/CD 构建可复现
- 部署环境一致
```

#### 2.5 配置数据库（20分钟）

**Step 1: 启动 MySQL 服务**

```bash
# Windows
net start MySQL80

# Mac
brew services start mysql

# Linux
sudo systemctl start mysql
```

**Step 2: 创建数据库**

```bash
# 登录 MySQL
mysql -u root -p
# 输入密码

# 创建数据库
CREATE DATABASE fastapi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 查看数据库
SHOW DATABASES;

# 退出
EXIT;
```

**Step 3: 配置环境变量**

```bash
# 复制配置模板
cp .env.example .env

# 编辑配置文件
# Windows: notepad .env
# Mac/Linux: vim .env 或 nano .env
```

**关键配置项讲解**（一个一个讲解）：

```ini
# ========== MySQL 配置（必须修改）==========
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=你的MySQL密码    # ← 改成你自己的密码
MYSQL_DATABASE=fastapi_db

# ========== OpenAI 配置（暂时可以不配置）==========
OPENAI_API_KEY=sk-proj-xxxxx    # ← 暂时留空，下午配置
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=<按 .env 或 /ai/chat/model-config 配置>

# ========== JWT 配置（生产环境必须改）==========
SECRET_KEY=your-secret-key-change-in-production
# 这个 SECRET_KEY 在生产环境一定要改成复杂的随机字符串
```

#### 2.6 初始化数据库（10分钟）

```bash
# 运行数据库迁移
uv run main.py upgrade --env=dev

# 输出示例：
# INFO  [alembic.runtime.migration] Context impl MySQLImpl.
# INFO  [alembic.autogenerate.compare] Detected added table 'users'
# INFO  [alembic.autogenerate.compare] Detected added table 'evidence'
# ...
# [INFO] 数据库表创建成功
# [INFO] 默认用户创建成功
# 已生成新的 Alembic 迁移脚本
# 已应用最新迁移
```

**验证数据库**：

```bash
# 重新登录 MySQL
mysql -u root -p fastapi_db

# 查看创建的表
SHOW TABLES;

# 应该看到：
# users
# evidence
# document
# consultation
# answer
# review
# ...

# 查看用户表
SELECT id, username, name, is_superuser FROM users;

# 应该看到默认管理员账号：admin

# 退出
EXIT;
```

#### 2.7 启动项目验证（15分钟）

```bash
# 启动开发服务器
uv run main.py run --env=dev

# 输出示例：
# INFO:     Will watch for changes in these directories: ['D:\\AI 劳动仲裁辅助系统']
# INFO:     Uvicorn running on http://0.0.0.0:8004 (Press CTRL+C to quit)
# INFO:     Started reloader process [12345] using WatchFiles
# [INFO] 服务启动: AI 劳动仲裁辅助系统劳动仲裁系统
# [INFO] 数据库表创建成功
# INFO:     Application startup complete.
```

**验证服务**：

1. 打开浏览器，访问实际启动端口的 `/docs`，当前骨架默认示例为：http://localhost:8004/docs
2. 应该看到 FastAPI 自动生成的 API 文档界面

（讲师展示 API 文档界面，讲解几个关键接口）

3. 测试健康检查接口：
   - 在文档中找到 `GET /api/health-check`
   - 点击 "Try it out"
   - 点击 "Execute"
   - 应该返回 `true`

4. 测试登录接口：
   - 找到 `POST /api/login`
   - 点击 "Try it out"
   - 输入用户名：`admin`
   - 输入密码：`123456`
   - 点击 "Execute"
   - 应该返回 JWT token

**常见问题排查**（提前准备）：

❌ **问题 1**：ImportError: No module named 'xxx'
✅ **解决**：检查虚拟环境是否激活，重新安装依赖

❌ **问题 2**：Can't connect to MySQL server
✅ **解决**：检查 MySQL 服务是否启动，检查 .env 配置

❌ **问题 3**：服务端口被占用
✅ **解决**：修改 `.env` 或 `backend/app/config/setting.py` 中的 `SERVER_PORT`，再重启服务

#### 2.8 环境搭建总结（10分钟）

好，到这里我们的环境搭建就完成了。让我们回顾一下：

✅ **完成的工作**：
1. 克隆了项目代码
2. 创建了虚拟环境
3. 安装了所有依赖包
4. 配置了 MySQL 数据库
5. 初始化了数据库表
6. 成功启动了服务

✅ **验证清单**：
- [ ] 实际端口的 `/docs` 可以访问，当前骨架默认示例为 http://localhost:8004/docs
- [ ] 能够成功登录（admin/123456）
- [ ] 数据库中有默认用户

如果大家都完成了，我们休息 10 分钟，11:20 继续。

---

### 🕚 中场休息（11:10-11:20，10分钟）

---

### 第三部分：AI 基础理论（11:20-12:00，40分钟）

休息回来，我们来讲一讲 AI 的基础理论。这部分内容很重要，是后面三天实战的理论基础。

#### 3.1 大模型基本原理（10分钟）

**什么是大语言模型（LLM）？**

简单来说，大语言模型就是一个**超级智能的"文字接龙"程序**。

（在白板上画图）

```
输入："今天天气"
模型思考：根据前面的词预测下一个词
输出："很好" 或 "不错" 或 "真糟糕"
```

**工作原理**：
1. **训练阶段**：喂给模型海量文本（几TB的网页、书籍、代码）
2. **学习过程**：模型学会了语言的规律和知识
3. **推理阶段**：给它一个开头，它预测后续内容

**常见大模型**：
- OpenAI OpenAI 兼容模型 / GPT-4
- Anthropic Claude
- Google Gemini
- 国产：文心一言、通义千问、讯飞星火

**大模型的能力**：
✅ 文本生成：写文章、写代码、写诗
✅ 问答对话：像专家一样回答问题
✅ 文本分类：判断情感、主题
✅ 信息提取：从文本中提取结构化信息
✅ 翻译：多语言翻译

**大模型的局限**：
❌ 知识有截止日期（OpenAI 兼容模型 的知识截止到 2021年）
❌ 会"一本正经地胡说八道"（幻觉问题）
❌ 不知道自己不知道
❌ 无法访问实时数据

这些局限怎么解决？→ **RAG 技术**（下午重点讲）

#### 3.2 Prompt Engineering 入门（10分钟）

**什么是 Prompt？**

Prompt 就是你给 AI 的指令。好的 Prompt = 好的输出。

**差的 Prompt 示例**：

```
"帮我写一份劳动仲裁申请书"
```

AI 可能会：
- 不知道具体情况，写得很泛泛
- 格式不标准
- 内容不专业

**好的 Prompt 示例**：

```
你是一位资深劳动法律师，拥有10年从业经验。
请帮我撰写一份劳动仲裁申请书，要求：

1. 申请人信息：张三，身份证110...，北京市朝阳区...
2. 被申请人：XX科技有限公司
3. 仲裁请求：要求支付违法解除劳动合同赔偿金 80,000 元
4. 事实与理由：
   - 我在公司工作5年，担任产品经理，月薪8000元
   - 2024年1月，我怀孕后告知公司
   - 2024年2月，公司以"业绩不佳"为由辞退我
   - 公司未支付任何补偿
5. 法律依据：引用《劳动合同法》相关条款
6. 格式：标准的仲裁申请书格式

请生成完整的申请书内容。
```

**好 Prompt 的特点**：
1. **明确角色**：你是一位资深律师
2. **具体任务**：撰写劳动仲裁申请书
3. **详细信息**：提供所有必要信息
4. **格式要求**：明确输出格式
5. **约束条件**：引用法条、使用标准格式

**Prompt 设计原则**：
```
1. 角色定位 → 让 AI 进入专业角色
2. 任务描述 → 说清楚要做什么
3. 输入数据 → 提供必要信息
4. 输出格式 → 明确返回格式（JSON/Markdown/纯文本）
5. 示例引导 → 给出示例（Few-shot Learning）
```

我们项目中的 Prompt 都是精心设计的，后面会一一讲解。

#### 3.3 RAG 技术介绍（10分钟）

**什么是 RAG？**

RAG = Retrieval-Augmented Generation（检索增强生成）

**核心思想**：
在生成答案之前，先从知识库检索相关信息，然后基于这些信息生成答案。

**为什么需要 RAG？**

❌ **纯大模型的问题**：
- 知识有截止日期
- 没有专业领域知识
- 容易产生幻觉

✅ **RAG 的优势**：
- 提供最新的、私有的知识
- 提高回答的准确性
- 答案可追溯（知道来源）

**RAG 工作流程**（在白板上画图）：

```
用户提问："公司辞退我需要赔偿吗？"
    ↓
【检索阶段】
    ↓
1. 将问题转为向量（Embedding）
    ↓
2. 在向量数据库中检索相似文档
    向量数据库包含：
    - 劳动合同法
    - 劳动争议调解仲裁法
    - 工伤保险条例
    - 历史案例
    ↓
3. 检索结果（Top 4）：
    - 劳动合同法第47条（经济补偿）
    - 劳动合同法第87条（违法解除）
    - ...
    ↓
【生成阶段】
    ↓
4. 构建完整 Prompt：
   系统提示词 + 检索到的法条 + 用户问题
    ↓
5. 调用大模型生成答案
    ↓
6. 返回答案 + 引用来源
```

**RAG 的关键技术**：
1. **Embedding（向量化）**：把文本转为数字向量
2. **向量数据库**：存储和检索向量（我们用 ChromaDB）
3. **相似度计算**：找到最相关的文档
4. **Prompt 构建**：把检索结果整合到 Prompt 中

下午我们会详细讲解和实操这些技术。

#### 3.4 向量数据库概念（10分钟）

**什么是向量？**

向量就是一串数字，用来表示文本的语义。

```python
# 示例（实际向量有 1536 维）
"劳动合同" → [0.23, -0.45, 0.67, 0.12, ...]
"劳动协议" → [0.25, -0.43, 0.65, 0.14, ...]  # 很相似！

"苹果手机" → [-0.78, 0.32, -0.15, 0.89, ...]  # 完全不同
```

**相似的文本，向量也相似**。这就是语义检索的基础。

**传统搜索 vs 向量检索**：

传统关键词搜索：
```
查询："公司辞退"
只能匹配包含"公司"和"辞退"的文档
```

向量语义检索：
```
查询："公司辞退"
能匹配到：
- "用人单位解除劳动合同"  ← 语义相同！
- "被公司开除"            ← 语义相同！
- "单位终止合同"          ← 语义相关！
```

**向量数据库**：

就是专门用来存储和检索向量的数据库。

常见的向量数据库：
- ChromaDB（我们用的，适合中小规模）
- Pinecone（云服务，按量付费）
- Milvus（开源，适合大规模）
- Weaviate（开源，功能强大）

**为什么选择 ChromaDB？**
✅ 嵌入式，无需单独部署
✅ Python 原生，易于集成
✅ 免费开源
✅ 适合我们的项目规模（几千到几万个文档）

---

### 上午总结（12:00，5分钟）

好，上午的课程到这里就结束了。我们来总结一下：

**上午完成的内容**：
✅ 了解了项目的整体功能和技术栈
✅ 成功搭建了开发环境
✅ 学习了 AI 基础理论（大模型、Prompt、RAG、向量数据库）

**上午的重点**：
1. 环境搭建完成，能够启动项目
2. 理解 RAG 的核心思想（检索 + 生成）
3. 理解向量检索的基本原理

**下午预告**：
- LangChain 框架入门
- 动手创建知识库并上传文档
- 实现第一个 AI 对话功能

大家有什么问题吗？

（回答学生问题）

好，我们中午休息，下午 14:00 准时开始。

---

## 🌆 下午课程（14:00-18:00）

---

### 第四部分：LangChain 框架入门（14:00-15:30，90分钟）

#### 4.1 LangChain 核心概念（20分钟）

欢迎回来！下午我们开始动手写代码。

**什么是 LangChain？**

LangChain 是一个用于开发 AI 应用的框架，它把调用大模型、管理 Prompt、处理记忆等常见操作封装成了简单易用的组件。

**核心组件**（在白板上画图）：

```
1. LLM（大语言模型）
   - OpenAI、Anthropic、本地模型
   
2. Prompt Templates（提示词模板）
   - 动态构建 Prompt
   
3. Chains（链）
   - 组合多个步骤
   
4. Memory（记忆）
   - 管理对话历史
   
5. Embeddings（向量化）
   - 文本转向量
   
6. Vector Stores（向量存储）
   - ChromaDB、Pinecone
```

**LangChain 的优势**：
✅ 统一接口，切换模型只需改一行代码
✅ 丰富的组件，开箱即用
✅ 活跃的社区，大量示例

#### 4.2 第一个 LangChain 程序（30分钟）

现在我们来写第一个 LangChain 程序。

**Step 1：配置 OpenAI API Key**

首先，大家需要一个 OpenAI API Key。

（讲师展示如何获取 API Key）

1. 访问：https://platform.openai.com/api-keys
2. 注册/登录账号
3. 创建 API Key
4. 复制 Key

然后在 `.env` 文件中配置：

```ini
OPENAI_API_KEY=sk-proj-你的密钥
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=<按 .env 或 /ai/chat/model-config 配置>
```

**注意**：
- API Key 不要泄露
- 使用会产生费用（OpenAI 兼容模型 很便宜，1000次调用约1美元）
- 如果没有 Key，可以用讲师提供的测试 Key

**Step 2：创建测试文件**

这一步只作为讲师临时演示，不作为学生修改骨架项目的主线。可以在临时目录创建一个 LangChain 调用脚本：

```python
from langchain_openai import ChatOpenAI
from app.config.setting import settings

# 1. 创建 LLM 实例
llm = ChatOpenAI(
    api_key=settings.OPENAI_API_KEY,
    base_url=settings.OPENAI_BASE_URL,
    model=settings.OPENAI_MODEL,
    temperature=0.7  # 温度：0-2，越高越随机
)

# 2. 简单调用
response = llm.invoke("你好，请用一句话介绍劳动合同法")
print(response.content)
```

**Step 3：运行测试**

```bash
python 临时演示脚本.py
```

应该输出类似：
```
劳动合同法是中国规范用人单位与劳动者建立、变更和解除劳动关系的基本法律，
旨在保护劳动者的合法权益，构建和谐稳定的劳动关系。
```

**代码讲解**：

```python
# temperature 参数说明
temperature=0.0   # 输出最确定，适合需要精确答案的场景
temperature=0.7   # 平衡创造性和准确性（推荐）
temperature=1.5   # 输出更有创造性，但可能不准确
```

**Step 4：带上下文的对话**

修改代码，实现多轮对话：

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from app.config.setting import settings

llm = ChatOpenAI(
    api_key=settings.OPENAI_API_KEY,
    base_url=settings.OPENAI_BASE_URL,
    model=settings.OPENAI_MODEL,
    temperature=0.7
)

# 构建对话历史
messages = [
    SystemMessage(content="你是一位专业的劳动法律师"),
    HumanMessage(content="公司可以随意辞退员工吗？"),
]

# 调用
response = llm.invoke(messages)
print("AI:", response.content)

# 继续对话
messages.append(AIMessage(content=response.content))
messages.append(HumanMessage(content="那怀孕期间呢？"))

response = llm.invoke(messages)
print("AI:", response.content)
```

运行后，AI 会记住上一轮的对话内容。

#### 4.3 Prompt Templates 使用（20分钟）

**为什么需要 Prompt Templates？**

实际开发中，Prompt 往往需要动态生成：

```python
# 不好的做法：字符串拼接
prompt = f"分析以下案件：{case_description}"

# 好的做法：使用模板
template = """
你是一位资深劳动法律师。
请分析以下案件并给出专业意见：

案件描述：{case_description}
用户职位：{position}
工作年限：{work_years}

请从以下角度分析：
1. 法律关系判断
2. 胜诉概率评估
3. 维权建议
"""
```

**实践：创建 Prompt Template**

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from app.config.setting import settings

# 1. 定义模板
template = ChatPromptTemplate.from_messages([
    ("system", "你是一位资深劳动法律师，拥有{years}年从业经验。"),
    ("human", """
    请分析以下劳动纠纷案件：
    
    案件描述：{case_description}
    劳动者信息：
    - 职位：{position}
    - 工作年限：{work_years}
    - 月薪：{monthly_salary}
    
    请给出专业分析和建议。
    """)
])

# 2. 创建 LLM
llm = ChatOpenAI(
    api_key=settings.OPENAI_API_KEY,
    model=settings.OPENAI_MODEL
)

# 3. 创建 Chain（模板 + LLM）
chain = template | llm

# 4. 调用（自动填充模板）
response = chain.invoke({
    "years": 10,
    "case_description": "公司突然通知我明天不用来了，说业绩不好",
    "position": "产品经理",
    "work_years": 5,
    "monthly_salary": 8000
})

print(response.content)
```

**代码讲解**：

```python
# | 是管道操作符，表示数据流
chain = template | llm
# 等价于：
# 1. template.format() → 生成完整 Prompt
# 2. llm.invoke(prompt) → 调用模型
```

#### 4.4 实现简单问答（20分钟）

现在我们把刚才学的整合起来，实现一个简单的法律问答函数。

如果需要演示“最小 AI 问答函数”，建议仍放在临时演示脚本中，不要让学生把它作为骨架主线代码提交：

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from app.config.setting import settings

def simple_legal_qa(question: str) -> str:
    """简单法律问答
    
    Args:
        question: 用户问题
        
    Returns:
        AI 回答
    """
    # 1. 定义系统提示词
    system_prompt = """
    你是一名专业的劳动法律师，拥有10年从业经验。
    在回答问题时，请：
    1. 引用具体法条
    2. 给出可操作的建议
    3. 用通俗易懂的语言解释
    """
    
    # 2. 创建 Prompt 模板
    template = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{question}")
    ])
    
    # 3. 创建 LLM
    llm = ChatOpenAI(
        api_key=settings.OPENAI_API_KEY,
        model=settings.OPENAI_MODEL,
        temperature=0.7
    )
    
    # 4. 创建 Chain
    chain = template | llm
    
    # 5. 调用
    response = chain.invoke({"question": question})
    
    return response.content

# 测试
if __name__ == "__main__":
    question = "公司辞退我需要赔偿吗？我工作了3年。"
    answer = simple_legal_qa(question)
    print(f"问题：{question}")
    print(f"回答：{answer}")
```

运行测试：

```bash
python 临时演示脚本.py
```

恭喜！你已经实现了第一个 AI 问答功能。

---

### 🕒 休息（15:30-15:40，10分钟）

---

### 第五部分：知识库上传与索引（15:40-17:20，100分钟）

#### 5.1 文本向量化原理（15分钟）

**什么是 Embedding？**

Embedding 就是把文本转换为向量（一串数字）的过程。

**示例**（简化版，实际是1536维）：

```python
"劳动合同" → [0.2, -0.4, 0.6, 0.1, -0.3]
"劳动协议" → [0.2, -0.4, 0.6, 0.1, -0.3]  # 几乎一样
"苹果手机" → [-0.7, 0.3, -0.1, 0.8, 0.5]  # 完全不同
```

**相似度计算**（余弦相似度）：

```python
similarity("劳动合同", "劳动协议") = 0.95  # 很相似
similarity("劳动合同", "苹果手机") = 0.12  # 不相似
```

**OpenAI Embedding API**：

```python
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(
    api_key=settings.OPENAI_API_KEY,
    model="text-embedding-3-small"  # 1536 维
)

# 单个文本
vector = embeddings.embed_query("劳动合同")
print(len(vector))  # 1536
print(vector[:5])   # [0.234, -0.456, 0.678, ...]

# 批量文本
vectors = embeddings.embed_documents([
    "劳动合同法",
    "劳动争议调解",
    "工伤保险条例"
])
print(len(vectors))  # 3
```

#### 5.2 ChromaDB 使用（25分钟）

**安装和初始化**（已经安装过了）

这一步同样是讲师临时演示。当前骨架实际通过 `ChromaKnowledgeStore` 和 `chromadb.HttpClient` 连接 Chroma 服务，课堂主线应回到 `/ai/knowledge` 上传、索引和检索测试：

```python
import chromadb
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from app.config.setting import settings

# 1. 创建 Embedding 实例
embeddings = OpenAIEmbeddings(
    api_key=settings.OPENAI_API_KEY,
    model=settings.OPENAI_EMBEDDING_MODEL
)

# 2. 准备文档
documents = [
    "劳动合同法第47条规定：经济补偿按劳动者在本单位工作的年限，每满一年支付一个月工资的标准向劳动者支付。",
    "劳动合同法第87条规定：用人单位违法解除劳动合同的，应当按照第47条规定的经济补偿标准的二倍向劳动者支付赔偿金。",
    "劳动合同法第42条规定：女职工在孕期、产期、哺乳期的，用人单位不得解除劳动合同。"
]

# 3. 创建向量存储
vectorstore = Chroma.from_texts(
    texts=documents,
    embedding=embeddings,
    persist_directory="./test_chroma_db",  # 持久化目录
    collection_name="test_collection"
)

print("向量数据库创建成功！")

# 4. 测试检索
query = "公司辞退孕妇违法吗？"
results = vectorstore.similarity_search(query, k=2)

print(f"\n查询：{query}")
print(f"\n检索结果：")
for i, doc in enumerate(results, 1):
    print(f"{i}. {doc.page_content}")
```

运行：

```bash
python 临时 Chroma 演示脚本.py
```

应该输出：
```
向量数据库创建成功！

查询：公司辞退孕妇违法吗？

检索结果：
1. 劳动合同法第42条规定：女职工在孕期、产期、哺乳期的，用人单位不得解除劳动合同。
2. 劳动合同法第87条规定：用人单位违法解除劳动合同的...
```

看到了吗？虽然查询里没有"孕期"这个词，但通过语义检索找到了相关法条！
#### 5.3 准备法律文档（15分钟）

现在我们准备一些真实的法律文档来构建知识库。

**Step 1：准备法律文档**

（讲师提前准备好几份法律文档，让学生通过知识库页面上传，或使用接口 `POST /ai/knowledge/document/upload` 上传）

建议准备的文档：
1. 劳动合同法.txt
2. 劳动争议调解仲裁法.txt
3. 工伤保险条例.txt

**文档格式示例**（`劳动合同法.txt`）：

```
中华人民共和国劳动合同法

第一章 总则

第一条 为了完善劳动合同制度，明确劳动合同双方当事人的权利和义务，保护劳动者的合法权益，构建和发展和谐稳定的劳动关系，制定本法。

第二条 中华人民共和国境内的企业、个体经济组织、民办非企业单位等组织（以下称用人单位）与劳动者建立劳动关系，订立、履行、变更、解除或者终止劳动合同，适用本法。

...

第四章 劳动合同的解除和终止

第四十七条 经济补偿按劳动者在本单位工作的年限，每满一年支付一个月工资的标准向劳动者支付。六个月以上不满一年的，按一年计算；不满六个月的，向劳动者支付半个月工资的经济补偿。

...
```

#### 5.4 创建知识库并上传文档（25分钟）

现在开始创建知识库并把法律文档索引进去。

**理解构建流程**：

```
1. 读取文档文件
   ↓
2. 文本切片（Chunking）
   - chunk_size=700 字
   - overlap=120 字（重叠，避免割裂语义）
   ↓
3. 向量化（Embedding）
   - 调用 OpenAI API
   - 批量处理（8条/批）
   ↓
4. 存储到 ChromaDB
   - 持久化到磁盘
   ↓
5. 完成！
```

**查看当前骨架中的关键文件**：

这部分不用让学生背代码，只要让他们知道每个文件负责什么。

```python
backend/app/plugin/module_ai/knowledge/controller.py
  - /ai/knowledge/create
  - /ai/knowledge/document/upload
  - /ai/knowledge/document/{id}/reindex
  - /ai/knowledge/retrieval/test

backend/app/plugin/module_ai/knowledge/service.py
  - 保存文档记录
  - 解析文件内容
  - 切片
  - 写入 Chroma

backend/app/plugin/module_ai/chat/rag.py
  - ChromaKnowledgeRetriever
  - RagPromptBuilder
  - RagChainFactory
```

**课堂操作**：

1. 打开知识库页面，创建一个“劳动仲裁法规知识库”。
2. 上传 `劳动合同法.txt`、`劳动争议调解仲裁法.txt`、`工伤保险条例.txt`。
3. 查看文档状态，确认解析和索引完成。
4. 打开检索测试，输入“公司拖欠工资怎么办？”。
5. 观察返回片段是否来自刚上传的法律文档。

**输出示例**：

```
[INFO] 开始创建知识库并上传文档...
[INFO] 扫描到文档: 劳动合同法.txt (45.2 KB)
[INFO] 扫描到文档: 劳动争议调解仲裁法.txt (28.7 KB)
[INFO] 扫描到文档: 工伤保险条例.txt (15.3 KB)
[INFO] 文本切片处理中...
[INFO] 总切片数: 156
[INFO] 向量化处理: 批次 1/20 (8 条)
[INFO] 向量化处理: 批次 2/20 (8 条)
...
[INFO] 向量化处理: 批次 20/20 (4 条)
[INFO] 存储到 ChromaDB...
[SUCCESS] 知识库上传与索引完成，切片数: 156
```

**验证结果**：

- 文档列表能看到上传的文件。
- 文档状态显示解析成功、索引成功。
- 检索测试能返回与劳动合同、工资、仲裁相关的片段。

**常见问题**：

❌ **问题**：OpenAI API 超时
✅ **解决**：检查网络，或配置代理

❌ **问题**：API 额度不足
✅ **解决**：充值或使用讲师提供的 Key

❌ **问题**：文档编码错误
✅ **解决**：确保文档是 UTF-8 编码

#### 5.5 测试知识库检索（20分钟）

知识库构建完成后，我们来测试一下检索效果。

使用知识库检索测试接口：

```http
POST /ai/knowledge/retrieval/test
Content-Type: application/json

{
  "query": "公司辞退员工需要赔偿吗？",
  "knowledge_base_ids": [1],
  "top_k": 3
}
```

课堂上连续测试 4 个问题：

1. 公司辞退员工需要赔偿吗？
2. 怀孕期间可以被辞退吗？
3. 经济补偿金怎么计算？
4. 劳动仲裁在哪里申请？

**分析检索结果**：

1. 检查相似度分数（一般 > 0.3 就是相关的）
2. 检查召回的法条是否准确
3. 检查是否有语义理解（同义词匹配）

---

### 第六部分：课堂验收说明和答疑（17:20-18:00，40分钟）

#### 6.1 今日总结（10分钟）

好，今天的课程到这里就结束了。我们来回顾一下今天的内容：

**上午**：
✅ 项目演示和技术栈介绍
✅ 环境搭建（Python、MySQL、项目依赖）
✅ AI 基础理论（大模型、Prompt、RAG、向量数据库）

**下午**：
✅ LangChain 框架入门
✅ 实现第一个 AI 问答功能
✅ ChromaDB 向量数据库使用
✅ 创建知识库并完成文档索引

**今天的重点**：
1. 环境搭建完成 ← 必须完成
2. 理解 RAG 原理 ← 核心概念
3. 知识库上传与索引 ← 核心技能

#### 6.2 课堂验收说明（10分钟）

**练习 1：环境验证（必做）**

确保以下功能正常：
- [ ] 项目能正常启动（uv run main.py run --env=dev）
- [ ] API 文档可以访问（以实际 `SERVER_PORT` 为准，当前骨架默认示例为 http://localhost:8004/docs）
- [ ] 能够成功登录（admin/123456）
- [ ] 知识库上传与索引成功

**练习 2：实践练习（必做）**

1. 修改 `simple_qa.py`，添加你自己的系统提示词
2. 准备 1-2 份自己的法律文档，添加到知识库
3. 测试知识库检索效果，截图保存

**练习 3：思考题（选做）**

1. 如果向量检索结果不准确，可以怎么优化？
2. 除了法律领域，RAG 还可以应用在哪些场景？
3. 如何评估 AI 回答的质量？

**提交方式**：
- 截图发到群里
- 遇到问题随时在群里提问

#### 6.3 明日预告（5分钟）

**Day 2 课程内容**：

**上午**：
- 练习复盘
- RAG 技术深入（检索边界、结果排序）
- 提示词工程实战

**下午**：
- WebSocket 实时通信
- 实现 AI 咨询对话功能
- 实现维权诉求分析功能

**明天的目标**：
完成项目的两个核心 AI 功能！

#### 6.4 答疑时间（15分钟）

现在进入答疑环节，大家有什么问题可以提出来。

**常见问题预判**：

**Q1：没有 OpenAI API Key 怎么办？**
A1：可以使用讲师提供的测试 Key，或者注册一个账号充值（最低 5 美元）

**Q2：知识库上传与索引很慢，正常吗？**
A2：正常。156 个切片需要调用 20 次 API，每次有延迟。优化方法：
- 增加 batch_size
- 减少 pause_seconds
- 使用更快的模型

**Q3：如何判断检索结果是否准确？**
A3：
1. 看相似度分数（> 0.3 一般就是相关的）
2. 人工检查召回的法条是否匹配问题
3. 测试多个问题，统计准确率

**Q4：可以使用国产大模型吗？**
A4：可以！LangChain 支持很多模型：
- 文心一言
- 通义千问
- 讯飞星火
只需要修改配置即可

（回答学生的其他问题）

---

### 结束语（18:00）

好，今天的课程就到这里。

**今天大家辛苦了**！我看到很多同学都跟上了进度，环境搭建和知识库上传索引都完成了，非常棒！

**今晚的任务**：
1. 完成练习（截图发群）
2. 复习今天的代码
3. 预习明天的内容（可以看看 WebSocket 相关资料）

**明天见！**

---

## 📝 讲师备注

### 时间控制要点

- 上午演示不要超过 40 分钟，留足时间给环境搭建
- 环境搭建环节要巡视，及时帮助遇到问题的学生
- 下午实操环节让学生跟着敲代码，不要只是演示

### 互动要点

- 每个知识点讲完问一句"大家理解了吗"
- 鼓励学生提问
- 对完成快的学生给予表扬

### 常见问题准备

1. Python 版本问题（建议统一用 3.12）
2. MySQL 连接失败（检查服务、密码）
3. OpenAI API 超时（网络问题、代理设置）
4. 依赖安装失败（换源、用国内镜像）

### 教学资源

- 提前准备好法律文档（3-5份）
- 准备测试用的 OpenAI API Key
- 准备常见错误的截图和解决方案
- 准备 PPT（可选，主要靠实操）

### 课后跟进

- 晚上在群里收集练习截图
- 整理今天的常见问题，明天讲评
- 对进度落后的学生单独辅导

---

## 讲师增强版：Day1 现场讲授口径

这一节用于把 Day1 从“环境步骤清单”升级成“可讲、可演示、可验收”的课堂脚本。讲师可以按下面顺序穿插到原稿中，不需要逐字照读。

### 1. 今日主线一句话

今天不追求把 AI 系统全部写完，只完成三件事：

1. 项目能在本机启动，接口文档能打开。
2. 学生能说清楚这个系统为什么要服务劳动争议场景。
3. 学生能理解 AI 问答的最小链路：用户问题 -> 知识库检索 -> Prompt -> 模型回答 -> 人工复核。

讲师话术：

> 大家今天不要只盯着命令有没有敲对。更重要的是建立一张地图：前端页面在哪里，后端接口在哪里，数据库存什么，知识库怎么进入 AI 回答。只要这张地图建立起来，后面三天所有功能都能找到位置。

### 2. 贯穿案例

建议 Day1 统一使用一个案例，后续三天继续复用：

```text
张三，产品经理，入职 5 年，月工资 8000 元。
公司以“业绩不达标”为由口头通知明天不用来了，没有书面解除通知。
张三手里有劳动合同、工资流水、聊天通知截图和考勤记录。
他想知道：公司这样辞退是否合法？可以主张哪些赔偿？需要准备哪些证据？
```

讲师讲法：

- 上午用这个案例说明业务价值：普通劳动者不知道诉求、证据和文书怎么组织。
- 中午前用这个案例解释 RAG：系统不能只凭模型记忆回答，要先检索劳动合同法和相关材料。
- 下午用这个案例测试知识库：上传法条材料后，让检索结果能召回解除、经济补偿、违法解除相关片段。

### 3. 环境搭建讲法

不要把环境搭建讲成“机械安装”。每一步都要解释目的：

| 步骤 | 讲师解释 |
|---|---|
| Python | 后端和 AI 编排代码的运行环境。 |
| uv | 负责把后端依赖装成一致环境，避免每台机器包版本不同。 |
| MySQL | 保存用户、会话、知识库、文档、chunk 元数据等业务状态。 |
| Alembic | 管理数据库表结构版本，让代码和数据库一起演进。 |
| FastAPI | 提供后端接口，让前端和 `/docs` 能调用系统能力。 |
| Chroma | 保存向量和可召回文本片段，用于语义检索。 |

现场提醒：

> 如果一个同学环境失败，不要全班停住。先让他记录错误截图，继续跟着听架构和链路。环境问题课间集中处理。

### 4. AI 基础讲法

讲 LLM 时不要神化模型。建议使用三句话：

1. 大模型擅长理解和生成文本。
2. 大模型不知道我们上传的私有材料，除非我们把材料检索出来放进上下文。
3. 法律场景必须有依据、边界和人工复核。

对学生提问：

> 如果用户问“我被辞退能赔多少钱”，模型直接回答和系统先检索法条后回答，哪个更适合法律辅助系统？为什么？

期望学生答到：

- 直接回答可能编造。
- 检索后回答有依据。
- 还需要结合事实和证据。

### 5. 知识库演示讲法

演示知识库时按四层讲：

```text
文件上传：材料进入系统
文本解析：系统读出正文
文本切片：长文档变成可检索片段
向量索引：片段写入 Chroma，后续可召回
```

课堂案例：

> 我们上传一份劳动合同法材料，然后问“工作 5 年被辞退怎么补偿”。如果检索片段能召回经济补偿相关条款，说明知识库链路跑通；如果只返回无关内容，问题优先看切片、知识库选择和检索 query，而不是先怀疑模型。

### 6. Day1 课堂验收标准

Day1 结束前，学生至少要能交付以下证据：

- 后端启动日志截图。
- 实际端口 `/docs` 页面截图。
- 数据库迁移成功截图或表结构截图。
- 创建知识库截图。
- 上传文档并看到解析/索引状态截图。
- `retrieval/test` 返回相关片段截图。
- 用自己的话解释 RAG，不超过 3 句话。

验收话术：

> 今天不要求大家写复杂功能。只要你能证明“项目启动了、知识进入系统了、检索能返回依据了”，Day1 就达标。




