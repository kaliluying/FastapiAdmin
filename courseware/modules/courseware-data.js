const coursewareSections = [
  {
    id: "overview",
    title: "AI 劳动仲裁辅助系统实训",
    subtitle: "四天完成一个可演示、可解释、可答辩的 AI 法律辅助项目。",
    tags: ["四天实训", "AI 应用开发", "FastAPI", "RAG", "项目答辩"],
    slides: [
      {
        title: "课程总目标",
        time: "全程",
        points: ["理解 AI 法律辅助系统的业务闭环。", "掌握从用户提问、资料检索、答案生成到结果展示的完整流程。", "能用一个劳动争议案例讲清系统价值和技术实现思路。", "形成能用于答辩的项目表达和演示脚本。"],
        teacherNotes: ["先告诉学生最终要做出什么，再讲每天怎么一步步达成。"],
        talkTrack: ["这门课不是让大家背框架名，而是用一个真实案例，把 AI 应用从想法一步步做成能演示的项目。", "四天结束后，学生要能讲清系统帮助谁、解决什么问题、核心流程怎么走。"],
        quickQuestions: ["这个项目帮助谁解决什么问题？", "为什么法律辅助系统不能只让大模型自由发挥？"],
        demoSteps: ["展示系统最终效果", "展示咨询、资料依据、结果输出三条主线"],
        keyTakeaway: "四天实训的成果不是堆功能，而是让学生能用一个案例讲清 AI 项目的完整闭环。",
        classroomFlow: ["先讲业务场景。", "再讲 AI 如何参与。", "最后落到四天学习路线和答辩表达。"],
        visual: { title: "课程主线", type: "flow", steps: ["业务问题", "AI 辅助", "项目实现", "答辩演示"] },
        practice: "让学生用一句话说出这个项目帮助谁、解决什么问题。",
      },
      {
        title: "四天学习路线",
        time: "导入",
        points: ["Day1 跑起来：环境、项目结构、AI 应用基础。", "Day2 变聪明：RAG、检索依据、Prompt 构建、流式问答。", "Day3 做业务：证据上传解析、AI 分析、文书生成。", "Day4 能展示：认证安全、部署联调、项目总结和答辩。"],
        teacherNotes: ["强调每天都有可交付成果，避免学生把课程当成零散知识点。"],
        talkTrack: ["四天路线要像一条工程路线，而不是知识点清单。", "每天都要有可验收结果：能启动、能问答、能走业务、能答辩。"],
        quickQuestions: ["哪一天最能体现 AI 工程能力？", "最终答辩为什么要用一个完整案例串起来？"],
        demoSteps: ["切换 Day1-Day4 导航"],
        keyTakeaway: "每天都围绕一个可验收成果推进，学生才不会迷失在框架和代码细节里。",
        classroomFlow: ["快速扫一遍四天成果。", "指出每天的代码入口。", "说明最终答辩如何串起四天内容。"],
        visual: { title: "四天交付路线", type: "flow", steps: ["跑起来", "接入 RAG", "走通业务", "能答辩"] },
        practice: "让学生标记自己最担心的一天，课中重点照顾。",
      },
    ],
    codeRefs: [
      ["backend/main.py", "FastAPI 后端启动入口。"],
      ["backend/app/plugin/module_ai/chat/service.py", "AI 问答服务主流程。"],
      ["backend/app/plugin/module_ai/chat/rag.py", "检索增强回答的实现入口。"],
      ["backend/app/api/v1/module_system/auth/service.py", "登录认证和安全边界。"],
    ],
    tasks: ["明确项目目标", "了解四天路线", "准备开发环境", "准备演示案例", "准备答辩表达"],
  },
  {
    id: "day1",
    title: "Day 1：环境搭建与 AI 基础",
    subtitle: "把项目跑起来，并建立 AI 应用开发的第一套心智模型。",
    tags: ["环境搭建", "uv", "FastAPI", "LangChain", "向量知识库"],
    slides: [
      {
        title: "开场：为什么做劳动仲裁辅助系统",
        time: "9:00-9:10",
        points: ["劳动者常见问题是不会判断诉求、不会准备证据、不会写文书。", "AI 的价值不是替代律师，而是降低信息整理和初步咨询门槛。", "本项目围绕咨询、分析、证据、文书四个环节展开。"],
        teacherNotes: ["用真实场景开场：被拖欠工资、不知道要准备什么材料。"],
        demoSteps: ["展示项目首页或接口文档", "讲清系统用户：劳动者、讲师、评审"],
        practice: "让学生举一个劳动争议场景。",
      },
      {
        title: "项目功能总览",
        time: "9:10-9:40",
        points: ["AI 智能咨询：根据法律知识库回答问题。", "诉求分析：提取权利主张和案件摘要。", "成功率评估：结合资料、证据和法律依据给出建议。", "证据管理与文书生成：把材料整理成可提交成果。"],
        teacherNotes: ["这里不要讲实现细节，先让学生知道后面代码为什么存在。"],
        demoSteps: ["展示 /docs 中的 claim、evidence、document、chat 接口"],
        practice: "让学生画出用户从提问到生成文书的流程。",
      },
      {
        title: "系统核心功能演示路线",
        time: "9:20-9:40",
        points: [
          "AI 智能咨询：用“公司突然辞退我是否合法”展示流式回答和法律依据。",
          "维权诉求分析：输入孕期被辞退案例，提取权利主张和案件摘要。",
          "成功率评估：给出胜诉概率、法律依据和下一步行动建议。",
          "证据管理与文书生成：上传劳动合同或工资流水，生成可提交的仲裁申请书草稿。",
        ],
        teacherNotes: ["这页来自 Day1 演讲稿的开场演示，目标是让学生先看到四天后要做成什么。"],
        talkTrack: ["先让学生看到最终效果，再进入环境和技术。", "演示时不要解释所有代码，只强调：这些功能会在四天里一步步实现。"],
        quickQuestions: ["AI 的回答为什么不能只靠模型记忆？", "从咨询到文书，中间哪一步最依赖证据？"],
        rescueTips: ["现场系统不稳定时，用接口截图或录屏继续讲业务流程，不要让开场卡在环境问题。"],
        demoSteps: ["输入劳动争议咨询问题", "展示诉求分析结果", "展示成功率评估", "上传证据并生成文书草稿"],
        keyTakeaway: "开场先建立终局画面：学生知道最终要做出什么，后面的环境、RAG、证据、文书才有意义。",
        classroomFlow: ["先演示咨询。", "再演示分析和评估。", "最后演示证据到文书。"],
        visual: { title: "项目演示链路", type: "flow", steps: ["AI 咨询", "诉求分析", "证据管理", "文书生成"] },
        practice: "让学生记录一个自己想用来贯穿四天课程的劳动争议案例。",
      },
      {
        title: "技术栈地图",
        time: "9:30-9:40",
        points: ["后端用 FastAPI、SQLModel、Alembic 组织 Web 服务和数据。", "AI 能力由 LangChain、Embedding、ChromaDB、Prompt 共同完成。", "安全和工程化由 JWT、日志、异常、限流、配置管理支撑。"],
        teacherNotes: ["用分层方式讲，不要一次列很多库名。"],
        demoSteps: ["打开项目目录", "指出 backend/app/api、backend/app/plugin、backend/app/core、backend/app/config、alembic"],
        practice: "让学生说出 core 和 plugin 的区别。",
      },
      {
        title: "环境检查",
        time: "9:40-9:50",
        points: ["确认 Python、Git、MySQL、uv 可用。", "环境问题优先解决，否则后续 AI 和接口都无法验证。", "讲师要准备常见安装失败处理方案。"],
        teacherNotes: ["这一页适合边讲边让学生执行命令。"],
        demoSteps: ["python --version", "git --version", "uv --version", "mysql --version"],
        practice: "学生截图提交版本检查结果。",
      },
      {
        title: "uv 与依赖安装",
        time: "9:50-10:20",
        points: ["uv 负责创建虚拟环境、同步依赖、锁定版本。", "`uv sync` 让团队环境更一致。", "依赖安装失败通常与网络、代理、镜像源有关。"],
        teacherNotes: ["强调 uv 是工具，不是课程重点；目标是把项目跑起来。"],
        demoSteps: ["uv venv", "uv sync", "uv run main.py --help"],
        practice: "学生完成依赖安装并记录耗时。",
      },
      {
        title: "数据库初始化",
        time: "10:20-10:50",
        points: ["MySQL 保存用户、证据、文书、咨询等业务数据。", "Alembic 管理表结构迁移。", ".env 决定数据库连接和服务配置。"],
        teacherNotes: ["提醒学生不要把生产密钥写死在代码里。"],
        demoSteps: ["复制 .env.example", "uv run main.py upgrade --env=dev", "查看数据库表"],
        practice: "确认 users、evidence、document 等表已创建。",
      },
      {
        title: "启动 FastAPI 项目",
        time: "10:50-11:10",
        points: ["`main.py` 创建应用、注册路由、中间件和静态资源。", "/docs 是接口调试和课堂演示入口。", "启动日志能帮助判断数据库、插件、路由是否正常。"],
        teacherNotes: ["让学生先学会看日志，比盲目复制报错更重要。"],
        demoSteps: ["uv run main.py run --env=dev", "打开 http://127.0.0.1:8000/docs"],
        practice: "学生访问健康检查接口。",
      },
      {
        title: "AI 应用基础",
        time: "11:20-12:00",
        points: ["大模型负责生成，但不应该凭记忆回答法律问题。", "Prompt 决定模型角色、任务和输出边界。", "RAG 用外部知识补充模型，提升可控性。", "Embedding 把文本变成可计算相似度的向量。"],
        teacherNotes: ["把 AI 讲成工程流程：输入、检索、组装、生成、校验。"],
        demoSteps: ["展示一条法律问题如何进入 RAG 流程"],
        practice: "让学生用自己的话解释 RAG。",
      },
      {
        title: "LangChain 入门",
        time: "14:00-15:30",
        points: ["LangChain 用于把 Prompt、模型调用、输出处理串起来。", "Prompt Template 比字符串拼接更清晰。", "Chain 表示数据从模板到模型再到结果的流动。"],
        teacherNotes: ["少讲概念，多用一个小问答例子解释。"],
        demoSteps: ["创建 ChatOpenAI", "写 PromptTemplate", "运行 chain.invoke"],
        practice: "学生改一个提示词，让回答变得更专业。",
      },
      {
        title: "创建知识库并上传文档",
        time: "15:40-17:20",
        points: ["知识库链路包括创建知识库、上传文档、解析切片、向量化和索引入库。", "切片大小和重叠会影响检索效果。", "ChromaDB 保存向量索引，聊天时通过 knowledge_base_ids 选择知识库。"],
        teacherNotes: ["先讲为什么切片，再讲知识库页面和接口如何触发索引。"],
        demoSteps: ["调用 POST /ai/knowledge/create 创建劳动法知识库", "调用 POST /ai/knowledge/document/upload 上传 txt/md/pdf/docx", "调用 POST /ai/knowledge/retrieval/test 测试检索"],
        practice: "新增一小段法律材料，上传到知识库并测试召回效果。",
      },
      {
        title: "Day1 总结与课堂验收",
        time: "17:20-18:00",
        points: ["今天完成项目运行、接口访问和 AI 基础理解。", "课堂验收重点是环境验证和一次知识库检索。", "明天会深入 RAG 检索和提示词工程。"],
        teacherNotes: ["检查每个学生至少能打开 /docs。"],
        demoSteps: ["复盘项目启动步骤"],
        practice: "提交启动截图、接口截图和一个检索问题。",
      },
    ],
    codeRefs: [
      ["backend/main.py", "应用创建、生命周期、run/revision/upgrade 命令。"],
      ["backend/app/config/setting.py", "环境变量和服务配置。"],
      ["backend/app/plugin/module_ai/chat/rag.py", "教学版 RAG 链路和检索边界。"],
      ["backend/app/plugin/module_ai/knowledge/service.py", "知识库文档上传、切片、向量化和索引入库。"],
    ],
    tasks: ["检查 Python/uv/MySQL/Git", "启动 FastAPI 服务", "打开 /docs", "创建知识库并上传文档", "完成一次 AI 问答"],
  },
  {
    id: "day2",
    title: "Day 2：RAG 检索与提示词工程",
    subtitle: "让 AI 回答更准确、更稳定、更像一个可交付功能。",
    tags: ["RAG", "BM25", "混合检索", "Prompt", "WebSocket"],
    slides: [
      {
        title: "问题复盘与今日目标",
        time: "9:00-9:30",
        points: ["先检查 Day1 环境、项目启动和知识库检索练习结果。", "集中处理 uv sync 慢、向量化慢、检索结果不准三个共性问题。", "今日目标是完成更稳定的 RAG 检索、结构化 Prompt 和实时 AI 对话。"],
        teacherNotes: ["不要逐个排查所有学生电脑，先讲共性问题，再给学生自查清单。"],
        talkTrack: ["Day2 的开场要把昨天的问题收束掉，否则后面 RAG 深入会跟不上。", "今天的目标很明确：让系统不只是能回答，而是更准确、更稳定、更像一个产品功能。"],
        quickQuestions: ["检索结果不准时，应该先怀疑模型还是知识库？", "为什么向量化慢不一定是代码错了？"],
        demoSteps: ["检查 uv sync", "检查知识库构建输出", "演示一个检索不准的案例"],
        keyTakeaway: "RAG 质量问题通常先从数据、切片、召回数量和阈值排查，不要一上来怪模型。",
        classroomFlow: ["统计 Day1 完成情况。", "讲三个共性问题。", "展示 Day2 要实现的 AI 功能。"],
        visual: { title: "Day2 开场复盘", type: "flow", steps: ["环境结果", "检索问题", "Prompt 约束", "实时对话"] },
        practice: "学生记录自己遇到的问题类型，并写出一个待优化的检索问题。",
      },
      {
        title: "为什么纯向量检索不够",
        time: "9:30-9:45",
        points: ["向量检索擅长语义相似，但对法条编号、精确关键词不总是稳定。", "法律场景既要语义理解，也要精确匹配。", "检索质量直接影响后续模型回答质量。"],
        teacherNotes: ["用“第47条”和“经济补偿”对比说明。"],
        demoSteps: ["查询一个口语问题", "查询一个法条编号问题"],
        practice: "学生设计两个容易检索失败的问题。",
      },
      {
        title: "BM25 关键词检索",
        time: "9:45-10:10",
        points: ["BM25 根据关键词、词频和文档长度计算相关性。", "中文需要先分词，常用 jieba。", "BM25 可以补足向量检索对精确词的不足。"],
        teacherNotes: ["不用展开公式，把 k1 和 b 讲成调节参数即可。"],
        demoSteps: ["演示 jieba 分词", "对比 BM25 Top-K"],
        practice: "学生解释为什么停用词要过滤。",
      },
      {
        title: "检索边界与结果排序",
        time: "10:10-10:50",
        points: ["教学版先把检索做成清楚的边界：输入问题，输出候选资料。", "文件上下文和内置知识会合并成候选片段，再按命中程度排序。", "后续要升级向量库或 BM25 时，只替换检索部分，不破坏问答主流程。"],
        teacherNotes: ["这是 Day2 核心：先讲清检索边界，再讲未来可以替换成向量检索或 BM25。"],
        demoSteps: ["打开 RAG 代码入口", "讲检索函数的输入和输出", "说明未来如何替换为向量检索"],
        practice: "让学生为“经济补偿”和“工资拖欠”设计关键词命中规则。",
      },
      {
        title: "Prompt 结构化设计",
        time: "11:00-12:00",
        points: ["Prompt 要明确角色、任务、输入、输出格式和约束。", "法律辅助输出要专业、谨慎、可执行。", "JSON 输出必须在提示词和代码解析两侧同时约束。"],
        teacherNotes: ["用诉求分析 Prompt 做主例子。"],
        demoSteps: ["打开 backend/app/plugin/module_ai/chat/rag.py", "查看 RagPromptBuilder 的角色、上下文和边界约束"],
        practice: "学生把一个模糊提示词改成结构化提示词。",
      },
      {
        title: "WebSocket 流式响应",
        time: "14:00-15:20",
        points: ["HTTP 适合一次性响应，WebSocket 适合长连接和流式输出。", "AI 生成长文本时，流式响应能降低等待感。", "实现关键是连接管理、鉴权、异常处理和异步发送。"],
        teacherNotes: ["强调流式体验是用户感知最强的部分。"],
        demoSteps: ["打开 backend/app/plugin/module_ai/chat/ws.py", "演示 send_text", "说明流式片段如何回到前端"],
        practice: "学生说出 WebSocket 和 HTTP 的区别。",
      },
      {
        title: "维权诉求分析接口",
        time: "15:30-16:15",
        points: ["输入用户叙述，输出权利主张和案件摘要。", "Service 层负责组织业务逻辑，AI 工具负责生成结构化结果。", "接口要处理信息不足、JSON 解析失败和异常兜底。"],
        teacherNotes: ["把接口讲成一条数据流：Controller -> Service -> AI -> Schema。"],
        demoSteps: ["POST /api/claim/analyses", "输入拖欠工资案例"],
        practice: "学生准备一个案情文本测试接口。",
      },
      {
        title: "成功率评估接口",
        time: "16:15-17:00",
        points: ["评估不是给绝对结论，而是结合证据和法律依据给行动建议。", "输出包括胜诉率、评估摘要、法律依据、下一步建议。", "提示词要禁止空泛建议，要求具体可执行。"],
        teacherNotes: ["提醒学生法律场景不能过度承诺。"],
        demoSteps: ["测试 claim evaluation", "观察 legal_basis 和 next_steps"],
        practice: "让学生判断哪些证据会提升成功率。",
      },
      {
        title: "Day2 总结与课堂验收",
        time: "17:00-18:00",
        points: ["今天完成检索增强、提示词约束和流式交互。", "课堂验收重点是测试诉求分析并优化一个 Prompt。", "明天进入证据管理和文书生成。"],
        teacherNotes: ["验收时重点看学生是否能解释检索结果为什么相关。"],
        demoSteps: ["复盘 RAG 流程图"],
        practice: "提交一次接口测试截图和一个 Prompt 优化说明。",
      },
    ],
    codeRefs: [
      ["backend/app/plugin/module_ai/chat/rag.py", "检索、Prompt 构建和模型调用。"],
      ["backend/app/plugin/module_ai/chat/schema.py", "ChatQuerySchema.files 将请求文件上下文传给 RAG。"],
      ["backend/app/plugin/module_ai/chat/ws.py", "WebSocket 流式聊天入口。"],
      ["backend/app/plugin/module_ai/chat/service.py", "ChatService 组织查询、流式输出和历史保存。"],
    ],
    tasks: ["讲清检索边界", "演示文件上下文进入 RAG", "优化 Prompt", "演示 WebSocket", "测试聊天接口"],
  },
  {
    id: "day3",
    title: "Day 3：证据管理与文书生成",
    subtitle: "把 AI 能力落到真实业务工作流：上传、解析、分析、生成。",
    tags: ["文件上传", "后台任务", "证据分析", "Jinja2", "文书生成"],
    slides: [
      {
        title: "练习复盘与今日目标",
        time: "9:00-9:30",
        points: ["复盘 Day2 的 WebSocket、诉求分析和 JSON 输出问题。", "集中处理连接失败、流式消息收不到、AI 输出无法解析三个常见问题。", "今日目标是走通证据上传、后台分析、文书模板和导出链路。"],
        teacherNotes: ["把学生注意力从 AI 问答转到业务流程，同时先处理 Day2 留下的接口问题。"],
        talkTrack: ["Day3 开始，项目从 AI 问答进入真实业务流。", "证据和文书决定这个系统是不是像一个真实劳动仲裁辅助工具。"],
        quickQuestions: ["WebSocket 连接失败时优先检查什么？", "为什么 AI 输出 JSON 时要强约束格式？"],
        demoSteps: ["展示 WebSocket token 连接方式", "展示 JSON 解析失败示例", "展示证据接口和文书接口"],
        keyTakeaway: "证据和文书把 AI 能力落到业务结果上，不能只停留在聊天回答。",
        classroomFlow: ["复盘 Day2 问题。", "说明今日业务闭环。", "准备示例证据材料。"],
        visual: { title: "Day3 业务闭环", type: "flow", steps: ["上传材料", "后台分析", "模板填充", "文书输出"] },
        practice: "学生准备一份示例证据材料，并说明它能证明什么事实。",
      },
      {
        title: "文件上传基础",
        time: "9:30-9:50",
        points: ["文件上传使用 multipart/form-data。", "后端接收 UploadFile，同时保存元数据。", "上传接口要考虑大小、类型、路径和用户隔离。"],
        teacherNotes: ["强调文件上传首先是安全问题，其次才是功能问题。"],
        demoSteps: ["打开 evidence upload 接口", "上传 PDF 或文本文件"],
        practice: "学生说明为什么不能直接信任文件名。",
      },
      {
        title: "文件校验与存储设计",
        time: "9:50-10:10",
        points: ["校验包括扩展名、MIME、文件头和大小限制。", "存储路径要按用户和证据 ID 隔离。", "保留原始文件名用于展示，内部文件名要安全生成。"],
        teacherNotes: ["用路径穿越举例说明安全风险。"],
        demoSteps: ["展示 EvidenceRecord 字段", "讲安全文件名生成"],
        practice: "学生设计一个安全存储路径。",
      },
      {
        title: "后台异步任务",
        time: "10:10-10:30",
        points: ["上传后不应让用户一直等待解析和 AI 分析。", "BackgroundTasks 适合短任务。", "后台任务里不能复用已关闭的数据库会话。"],
        teacherNotes: ["这是常见坑，必须单独强调。"],
        demoSteps: ["展示 add_task", "讲任务状态 processing/success/failed"],
        practice: "学生画出上传响应和后台分析的时序。",
      },
      {
        title: "文件解析：PDF、Excel、OCR",
        time: "10:40-11:20",
        points: ["文本型 PDF 可以直接提取文本。", "Excel 适合工资流水等结构化材料。", "扫描件需要 OCR，但识别率和速度要权衡。"],
        teacherNotes: ["讲清不同文件类型的技术边界。"],
        demoSteps: ["展示 PDF/Excel 解析函数", "说明 OCR 可选方案"],
        practice: "学生判断三种证据分别用什么解析方式。",
      },
      {
        title: "AI 证据分析",
        time: "11:20-12:00",
        points: ["AI 要判断证据类型、证明目的、关联事实和风险。", "输出要能反哺证据清单和文书生成。", "分析结果要尽量引用材料内容，避免空泛判断。"],
        teacherNotes: ["强调证据分析是把非结构化材料变成可操作信息。"],
        demoSteps: ["上传材料后查看分析结果", "展示证据详情"],
        practice: "学生为工资流水写证明目的。",
      },
      {
        title: "Jinja2 模板引擎",
        time: "14:00-15:20",
        points: ["模板把固定文书格式和动态数据分离。", "变量、循环、条件是文书生成的核心语法。", "模板比硬编码更容易维护和扩展。"],
        teacherNotes: ["让学生先看最终文书，再看模板。"],
        demoSteps: ["展示申请书模板", "渲染用户和证据数据"],
        practice: "学生给模板增加一个证据清单循环。",
      },
      {
        title: "仲裁申请书生成",
        time: "15:20-16:20",
        points: ["文书数据来自用户资料、诉求分析、证据分析和法律依据。", "生成过程要校验必填字段。", "结果应支持预览、保存和下载。"],
        teacherNotes: ["把文书生成讲成数据汇总，不是单纯拼字符串。"],
        demoSteps: ["调用 document create", "查看生成详情"],
        practice: "学生根据示例案情生成一份申请书。",
      },
      {
        title: "性能与工程优化",
        time: "16:20-17:20",
        points: ["响应压缩减少传输体积。", "数据库连接池提升并发稳定性。", "统一异常和日志方便排查问题。"],
        teacherNotes: ["不要深挖性能参数，讲工程意识。"],
        demoSteps: ["查看 core/middlewares.py", "查看 core/database.py"],
        practice: "学生说出一个生产环境需要的优化点。",
      },
      {
        title: "Day3 总结与课堂验收",
        time: "17:20-18:00",
        points: ["今天完成从材料到文书的业务闭环。", "课堂验收重点是上传证据、查看分析、生成文书。", "明天补齐认证、安全、部署和答辩。"],
        teacherNotes: ["检查学生是否真的走通业务链路。"],
        demoSteps: ["用一个案例复盘上传到生成文书"],
        practice: "提交证据分析结果和文书截图。",
      },
    ],
    codeRefs: [
      ["backend/app/api/v1/module_common/file/controller.py", "通用文件上传接口。"],
      ["backend/app/api/v1/module_common/file/service.py", "文件保存、校验和访问服务。"],
      ["backend/app/plugin/module_ai/chat/rag.py", "文件上下文进入 RAG 检索链路。"],
      ["backend/app/plugin/module_ai/chat/schema.py", "ChatQuerySchema.files 承载请求文件信息。"],
    ],
    tasks: ["演示文件上传", "讲解后台任务", "完成 AI 证据分析", "渲染文书模板", "生成仲裁申请书"],
  },
  {
    id: "day4",
    title: "Day 4：安全认证与项目总结",
    subtitle: "让项目具备基本安全边界，并准备好展示与答辩。",
    tags: ["登录保护", "权限边界", "部署检查", "答辩演示"],
    slides: [
      {
        title: "练习复盘与收束目标",
        time: "9:00-9:30",
        points: ["检查证据上传、分析、文书生成和模板优化结果。", "集中处理文件路径、后台任务数据库会话、模板变量未定义三个常见问题。", "今天重点是登录保护、部署检查、演示脚本和答辩表达。"],
        teacherNotes: ["把最后一天讲成项目交付日：系统要能展示，也要能说清安全边界。"],
        talkTrack: ["Day4 要把项目从能跑变成能交付。", "安全、部署和答辩不是附加题，而是项目能被评审认可的最后一段。"],
        quickQuestions: ["后台任务为什么不能直接复用响应里的数据库会话？", "答辩时为什么要主动说明系统边界？"],
        demoSteps: ["展示学生文书结果", "演示文件路径问题", "列出今日交付检查清单"],
        keyTakeaway: "最后一天的核心是收束：安全边界、部署检查、演示脚本和答辩表达。",
        classroomFlow: ["复盘 Day3 结果。", "讲三个常见问题。", "进入认证和答辩准备。"],
        visual: { title: "Day4 收束路线", type: "flow", steps: ["登录保护", "部署检查", "演示脚本", "答辩问答"] },
        practice: "学生准备最终演示案例，并写出 60 秒项目介绍。",
      },
      {
        title: "认证和授权基础",
        time: "9:30-9:45",
        points: ["认证回答“你是谁”，授权回答“你能访问什么”。", "法律辅助系统涉及个人资料和证据，必须有用户隔离。", "接口保护要落到依赖和服务查询条件里。"],
        teacherNotes: ["用“不能看别人的证据”说明授权。"],
        demoSteps: ["访问受保护接口", "观察未登录响应"],
        practice: "学生区分认证和授权。",
      },
      {
        title: "JWT 工作流程",
        time: "9:45-10:20",
        points: ["登录成功后服务端签发 Token。", "客户端后续请求携带 Token。", "服务端解码、验签、检查过期，再取当前用户。"],
        teacherNotes: ["画 Header/Payload/Signature，不要只背概念。"],
        demoSteps: ["查看 backend/app/core/security.py", "演示 create_access_token"],
        practice: "学生说明 Token 为什么需要签名。",
      },
      {
        title: "扩展了解：密码安全",
        time: "10:20-10:40",
        points: ["密码不能明文存储，这是项目安全底线。", "课堂只要求理解哈希和盐值，不要求手写完整密码模块。", "登录接口要能说明：提交密码、校验身份、返回登录状态。"],
        teacherNotes: ["把这一页作为扩展理解，不占用太多实现时间。"],
        demoSteps: ["展示密码校验流程", "说明为什么不能存明文密码"],
        practice: "学生用一句话说明为什么不能明文保存密码。",
      },
      {
        title: "扩展了解：第三方登录",
        time: "10:50-11:20",
        points: ["第三方登录本质是外部平台确认身份，项目系统再建立自己的用户。", "实训课不要求完整接入，只讲清 code、后端换取身份、创建用户三步。", "如果没有真实小程序环境，用流程图讲清即可。"],
        teacherNotes: ["这页不作为课堂主实现，避免学生卡在平台配置。"],
        demoSteps: ["画第三方登录流程", "说明 code 换身份的作用"],
        practice: "学生说出第三方登录和普通账号密码登录的区别。",
      },
      {
        title: "扩展了解：接口限流",
        time: "11:20-12:00",
        points: ["限流用于防止刷接口、暴力登录和模型成本失控。", "课堂只要求知道可以按用户、IP、接口统计请求次数。", "触发限制时要给出清晰提示，而不是让用户以为系统坏了。"],
        teacherNotes: ["把限流作为项目完整性的补充，不作为主要编码任务。"],
        demoSteps: ["展示限流返回效果", "说明为什么 AI 接口更需要成本保护"],
        practice: "学生设计一个简单的登录失败限制规则。",
      },
      {
        title: "生产环境配置",
        time: "14:00-14:30",
        points: ["生产环境要关闭 debug。", "SECRET_KEY、数据库密码、模型 Key 必须来自环境变量。", "依赖版本要锁定，数据库迁移要可重复执行。"],
        teacherNotes: ["强调不要把 .env 上传到公开仓库。"],
        demoSteps: ["查看 .env.example", "生成随机 SECRET_KEY"],
        practice: "学生列出三个不能提交到 Git 的配置。",
      },
      {
        title: "部署与联调",
        time: "14:30-15:30",
        points: ["后端服务、数据库、静态资源、反向代理需要逐项检查。", "先验证 API，再验证前端页面。", "联调问题要从网络、路径、鉴权、数据四个方向排查。"],
        teacherNotes: ["讲排查顺序，避免学生只盯代码。"],
        demoSteps: ["打开 /docs", "测试登录、咨询、证据、文书接口"],
        practice: "学生写一份部署检查清单。",
      },
      {
        title: "答辩 PPT 结构",
        time: "15:40-16:20",
        points: ["背景：劳动仲裁辅助的实际痛点。", "方案：AI + RAG + 证据管理 + 文书生成。", "架构：前端、API、业务服务、AI 引擎、数据层。", "亮点：混合检索、结构化 Prompt、后台任务、安全认证。"],
        teacherNotes: ["提醒学生不要把答辩做成代码流水账。"],
        demoSteps: ["展示 10 分钟答辩结构"],
        practice: "学生写项目介绍 100 字。",
      },
      {
        title: "功能演示脚本",
        time: "16:20-17:00",
        points: ["用一个劳动争议案例贯穿演示。", "先问答，再诉求分析，再证据建议，最后生成文书。", "每一步都说明输入、处理和输出。"],
        teacherNotes: ["演示失败时要有截图或录屏备份。"],
        demoSteps: ["准备拖欠工资案例", "走完整业务链路"],
        practice: "学生排练 5 分钟功能演示。",
      },
      {
        title: "常见答辩问题",
        time: "17:00-17:30",
        points: ["为什么用 RAG，而不是直接问大模型？", "混合检索如何提升准确性？", "系统是否能替代律师？", "如何保护用户隐私？", "后续如何扩展？"],
        teacherNotes: ["训练学生回答边界，不要过度承诺。"],
        demoSteps: ["模拟提问与回答"],
        practice: "每组准备 3 个问答。",
      },
      {
        title: "四天课程总结",
        time: "17:30-18:00",
        points: ["Day1 建环境和 AI 基础。", "Day2 做检索、提示词和流式问答。", "Day3 做证据和文书业务闭环。", "Day4 做安全、部署和答辩。", "最终目标是能讲清楚、能演示、能迭代。"],
        teacherNotes: ["用成果感收尾，提醒学生项目还可以继续扩展。"],
        demoSteps: ["展示最终系统路线图"],
        practice: "学生提交最终演示清单。",
      },
    ],
    codeRefs: [
      ["backend/app/core/security.py", "JWT 和密码工具。"],
      ["backend/app/core/dependencies.py", "当前用户和权限依赖。"],
      ["backend/app/api/v1/module_system/auth/service.py", "登录、Token 签发和认证服务。"],
      ["backend/app/core/http_limit.py", "接口频率限制。"],
    ],
    tasks: ["测试登录和 Token", "访问受保护接口", "完成部署检查", "整理演示脚本", "彩排答辩"],
  },

];

const [overviewSection, ...programDays] = coursewareSections;

export const teachingPlaybook = {
  rescueTips: [
    "环境报错集中出现时，先让已跑通的小组支援相邻小组，讲师只处理共性问题。",
    "API Key 或网络不稳定时，先切到已准备的截图或接口结果，保证课堂节奏不断。",
    "学生卡在概念上时，用一条劳动争议案例贯穿解释，不要临时扩展太多术语。",
    "演示失败时按顺序排查：服务是否启动、配置是否正确、Token 是否有效、日志是否有异常。",
  ],
  dayDefaults: {
    day1: {
      talkTrack: [
        "今天先不急着讲复杂概念，目标很明确：把项目跑起来，并让 AI 回答一个真实劳动法问题。",
        "每讲一个工具都要回到项目目标：它是为了让系统能运行、能检索、能回答。",
      ],
      quickQuestions: ["这个项目服务的用户是谁？", "如果只做普通增删改查，解决不了什么问题？"],
      rescueTips: ["装环境时先看版本、路径和 .env；不要让全班一起卡在同一个报错上。"],
    },
    day2: {
      talkTrack: [
        "今天的核心不是让模型更会说话，而是让它有依据地说话。",
        "讲 RAG 时一直追问学生：检索结果错了，后面生成还可能正确吗？",
      ],
      quickQuestions: ["为什么第47条这种问题纯向量检索可能不稳？", "Prompt 约束和代码解析为什么要两边同时做？"],
      rescueTips: ["检索效果不准时先检查文档切片和 top_k，再谈模型能力。"],
    },
    day3: {
      talkTrack: [
        "今天把 AI 能力落到业务闭环：用户上传材料，系统解析、分析，再生成可提交文书。",
        "强调文件上传先是安全问题，其次才是功能问题。",
      ],
      quickQuestions: ["为什么不能直接相信用户上传的文件名？", "后台任务里为什么不能复用已经关闭的数据库会话？"],
      rescueTips: ["证据分析失败时先看文件是否能被解析，再看 AI 输出和 JSON 结构。"],
    },
    day4: {
      talkTrack: [
        "最后一天要把项目从能跑变成能交付：安全边界、部署检查、答辩表达都要收束。",
        "答辩时不要把项目讲成代码流水账，要讲用户痛点、系统方案和技术亮点。",
      ],
      quickQuestions: ["认证和授权分别回答什么问题？", "系统能不能替代律师，边界应该怎么说？"],
      rescueTips: ["演示前准备截图或录屏备份，现场失败时仍能讲清业务链路。"],
    },
  },
};

const slideEnhancements = {
  "开场：为什么做劳动仲裁辅助系统": {
    talkTrack: ["可以先问学生有没有见过拖欠工资、违法解除或加班费争议，把项目从真实痛点带出来。", "金句：AI 不是替代律师，而是帮助普通人把问题说清楚、材料理清楚。"],
    quickQuestions: ["普通劳动者遇到纠纷时最缺的是什么？", "AI 在这个项目里负责判断、整理，还是最终裁决？"],
    keyTakeaway: "开场要把项目从真实劳动争议痛点带出来，让学生知道 AI 是辅助整理和解释，不是替代裁决。",
    classroomFlow: ["先抛出拖欠工资或违法解除场景。", "再说明普通劳动者缺材料、缺路径、缺表达。", "最后引出四天要做出的系统能力。"],
    visual: { title: "业务痛点", type: "flow", steps: ["劳动争议", "材料混乱", "AI 辅助", "系统交付"] },
  },
  "项目功能总览": {
    talkTrack: ["这里先不讲代码，先让学生知道系统最终要服务哪条业务链路。", "四个功能按用户路径讲：先咨询，再分析诉求，再整理证据，最后生成文书。"],
    quickQuestions: ["如果只做 AI 咨询，为什么还不算完整项目？", "哪一个功能最能体现劳动仲裁业务价值？"],
    keyTakeaway: "功能总览要建立业务地图：后面所有代码都服务于咨询、分析、证据、文书这条链路。",
    classroomFlow: ["先展示四个核心功能。", "再把功能放到一个劳动争议案例里。", "最后说明四天课程如何逐段实现。"],
    visual: { title: "功能闭环", type: "flow", steps: ["咨询问答", "诉求分析", "证据整理", "文书生成"] },
  },
  "环境检查": {
    talkTrack: ["这一页适合全班同步执行，讲师观察常见报错，不要逐台电脑深挖。", "检查环境的目标不是完成命令，而是确认后续项目能启动。"],
    quickQuestions: ["为什么 Python 版本不一致会影响项目？", "环境检查失败时应该先看版本还是先改代码？"],
    keyTakeaway: "环境检查是后续所有实操的地基，先确认工具可用，再进入项目代码。",
    classroomFlow: ["全班执行版本命令。", "收集共性错误。", "用统一清单处理路径、权限和版本问题。"],
    visual: { title: "环境四件套", type: "checklist", steps: ["Python", "Git", "MySQL", "uv"] },
  },
  "uv 与依赖安装": {
    talkTrack: ["把 uv 讲成团队协作工具：它减少“我电脑能跑、你电脑不行”的概率。", "安装等待时顺手讲核心依赖，不要让学生只是盯着进度条。"],
    quickQuestions: ["uv sync 和手动 pip install 的体验差别在哪里？", "锁定依赖版本对团队项目有什么价值？"],
    rescueTips: ["下载慢时优先切镜像源；单个包失败时单独安装并记录错误。"],
    keyTakeaway: "uv 的课堂价值是让依赖安装可重复，学生后面才能把精力放到业务和 AI 链路。",
    classroomFlow: ["先解释 pyproject.toml 和锁定文件。", "再执行 uv sync。", "最后验证关键依赖能被导入。"],
    visual: { title: "依赖同步", type: "flow", steps: ["读取配置", "解析依赖", "安装锁定", "运行验证"] },
  },
  "创建知识库并上传文档": {
    talkTrack: ["先在知识库页面创建库，再上传文档触发解析、切片和向量化；学生更容易把页面操作和后端链路对上。", "提醒学生：法条被切断，后面检索和回答都会受影响。"],
    quickQuestions: ["为什么不能把整本文档一次性塞给模型？", "chunk_size 改小或改大会带来什么影响？"],
    rescueTips: ["上传失败先检查文件类型是否是 txt、md、pdf、docx；Embedding 超时再检查网络、代理和 Key。"],
    keyTakeaway: "知识库质量决定回答质量，创建、上传、索引和检索验证必须逐步确认。",
    classroomFlow: ["准备法律材料。", "创建知识库。", "上传文档触发切片和索引。", "用问题测试召回结果。"],
    visual: { title: "知识库上传链路", type: "flow", steps: ["创建知识库", "上传文档", "切片索引", "检索验证"] },
  },
  "为什么纯向量检索不够": {
    talkTrack: ["用“第47条”和“经济补偿”做对比，让学生看到语义检索和精确匹配的差异。", "结论要落在混合检索：法律场景既要听懂人话，也要命中法条。"],
    quickQuestions: ["数字、条文编号为什么不是典型语义信息？", "如果召回材料错了，大模型能不能凭空补救？"],
    keyTakeaway: "法律检索既要语义相似，也要精确命中，纯向量检索不能覆盖所有课堂案例。",
    classroomFlow: ["先演示口语问题。", "再演示法条编号问题。", "最后引出 BM25 和混合检索。"],
    visual: { title: "检索差异", type: "triad", steps: ["语义相似", "关键词命中", "混合策略"] },
  },
  "BM25 关键词检索": {
    talkTrack: ["BM25 不需要推公式，讲成关键词相关性排序即可。", "中文场景先讲分词，学生会更容易理解为什么同一句话会被拆成词。"],
    quickQuestions: ["为什么中文检索要先分词？", "停用词会怎样影响相关性分数？"],
    keyTakeaway: "BM25 用关键词补足精确匹配能力，是法律条文和术语检索的重要补充。",
    classroomFlow: ["展示一句话分词。", "过滤停用词。", "计算 Top-K。", "对比向量检索结果。"],
    visual: { title: "BM25 流程", type: "flow", steps: ["文本分词", "过滤词", "计算分数", "返回 Top-K"] },
  },
  "混合检索与重排序": {
    talkTrack: ["按三步讲：向量召回、BM25 召回、合并重排；不要只说把结果拼起来。", "强调来源权重、法条命中、章节关键词都是法律业务规则。"],
    quickQuestions: ["为什么要先扩大召回再重排序？", "劳动合同法原文和案例库的权重应该一样吗？"],
    rescueTips: ["结果不稳时建立 golden case，不要凭单个问题调参数。"],
    keyTakeaway: "混合检索的目标是把“可能相关”的材料召回，再用业务规则排出更可信的上下文。",
    classroomFlow: ["讲召回边界。", "解释合并去重。", "加入权重和命中规则。", "用固定问题验证效果。"],
    visual: { title: "混合检索", type: "flow", steps: ["向量召回", "关键词召回", "合并去重", "重排序"] },
  },
  "Prompt 结构化设计": {
    talkTrack: ["提示词不是写一段漂亮话，而是定义模型的工作边界。", "法律场景尤其要强调输出格式、依据、风险提示和禁止过度承诺。"],
    quickQuestions: ["一个好 Prompt 至少应该包含哪些部分？", "为什么 JSON 输出不能只靠模型自觉？"],
    keyTakeaway: "结构化 Prompt 把模型从自由发挥拉回可检查、可解析、可交付的输出。",
    classroomFlow: ["展示模糊提示词。", "拆成角色、任务、输入、格式、约束。", "运行对比输出。"],
    visual: { title: "Prompt 结构", type: "flow", steps: ["角色", "任务", "输入", "输出约束"] },
  },
  "WebSocket 流式响应": {
    talkTrack: ["把流式响应讲成用户体验问题：长答案一次性返回会让用户以为系统卡住。", "实现时重点看连接管理、鉴权、异常处理和异步发送。"],
    quickQuestions: ["HTTP 和 WebSocket 在课堂演示里最直观的区别是什么？", "为什么流式输出要处理断连？"],
    rescueTips: ["连接失败先查 token、服务启动和 ws 地址；收不到消息再查 streaming 和 astream。"],
    keyTakeaway: "流式响应把 AI 长文本生成变成可感知的过程，核心是连接、鉴权、异步发送和异常兜底。",
    classroomFlow: ["对比 HTTP 与 WebSocket。", "讲连接建立。", "演示分片发送。", "处理断连和错误。"],
    visual: { title: "流式链路", type: "flow", steps: ["建立连接", "鉴权", "生成片段", "逐段发送"] },
  },
  "文件上传基础": {
    talkTrack: ["从证据类型切入：劳动合同、工资流水、解除通知、聊天记录都可能进入系统。", "强调上传接口要同时保存文件和业务元数据。"],
    quickQuestions: ["为什么证据上传要带 category_code 和 evidence_code？", "multipart/form-data 解决的是什么问题？"],
    keyTakeaway: "文件上传不是单纯收文件，而是把证据和案件业务关系一起保存下来。",
    classroomFlow: ["展示证据类型。", "解释上传表单。", "保存文件和元数据。", "返回可追踪记录。"],
    visual: { title: "上传入口", type: "flow", steps: ["选择文件", "校验信息", "保存元数据", "返回记录"] },
  },
  "文件校验与存储设计": {
    talkTrack: ["这页要把安全和管理讲清楚：文件名、类型、大小、路径都不能完全相信用户输入。", "按用户和证据 ID 隔离存储，后面删除和追踪会更清楚。"],
    quickQuestions: ["为什么 MIME 类型不完全可靠？", "按用户隔离目录有什么好处？"],
    keyTakeaway: "文件校验和存储结构决定证据模块是否安全、可管理、可追踪。",
    classroomFlow: ["讲三种校验方式。", "设计存储路径。", "说明大小限制。", "演示失败兜底。"],
    visual: { title: "安全存储", type: "checklist", steps: ["扩展名", "文件头", "大小限制", "路径隔离"] },
  },
  "后台异步任务": {
    talkTrack: ["用一个对比讲清楚：同步等待 30 秒很难接受，先返回再后台分析体验更好。", "重点提醒：响应返回后原数据库会话可能已经关闭。"],
    quickQuestions: ["后台任务的异常为什么必须自己记录日志？", "什么任务不适合用 BackgroundTasks？"],
    rescueTips: ["任务失败要看状态字段和日志，不要只看上传接口是否返回成功。"],
    keyTakeaway: "后台任务适合短时异步分析，但要重新创建资源、记录异常并更新任务状态。",
    classroomFlow: ["对比同步等待。", "讲响应后执行。", "说明数据库会话问题。", "检查状态和日志。"],
    visual: { title: "后台分析", type: "flow", steps: ["上传返回", "后台解析", "AI 分析", "更新状态"] },
  },
  "文件解析：PDF、Excel、OCR": {
    talkTrack: ["不同证据格式对应不同解析策略：文本 PDF、工资流水 Excel、扫描件 OCR。", "提醒 OCR 是可选增强，不要把识别率说成百分百。"],
    quickQuestions: ["为什么扫描件和文本 PDF 的处理方式不一样？", "工资流水为什么更适合 Excel 解析？"],
    keyTakeaway: "文件解析要按证据格式选择工具，先保证能提取有效文本，再交给 AI 分析。",
    classroomFlow: ["区分文件类型。", "选择解析工具。", "抽取文本或表格。", "处理失败和空结果。"],
    visual: { title: "解析策略", type: "triad", steps: ["PDF 文本", "Excel 表格", "OCR 图片"] },
  },
  "Jinja2 模板引擎": {
    talkTrack: ["用硬编码和模板对比，学生很快能理解为什么文书不能靠字符串拼接。", "模板负责格式，业务数据负责内容，两者分开才好维护。"],
    quickQuestions: ["模板变量缺失会造成什么问题？", "为什么文书格式不应该写死在服务函数里？"],
    keyTakeaway: "Jinja2 把文书格式和业务数据解耦，让仲裁申请书生成更可维护。",
    classroomFlow: ["展示硬编码问题。", "讲模板变量。", "渲染示例数据。", "处理缺失字段。"],
    visual: { title: "模板渲染", type: "flow", steps: ["模板", "变量", "渲染", "文书草稿"] },
  },
  "仲裁申请书生成": {
    talkTrack: ["这一页是 Day3 的业务收口：前面的诉求、证据、分析都要落到一份文书草稿。", "讲清楚草稿不是最终法律意见，仍需要人工核对。"],
    quickQuestions: ["仲裁申请书里哪些字段必须人工确认？", "文书生成失败时应该保留哪些中间结果？"],
    keyTakeaway: "文书生成把 AI 分析转成可提交的草稿，但最终核对和法律判断仍由人完成。",
    classroomFlow: ["准备案例数据。", "填充模板。", "生成草稿。", "检查格式和关键字段。"],
    visual: { title: "文书生成", type: "flow", steps: ["案例数据", "证据摘要", "模板填充", "草稿核对"] },
  },
  "JWT 工作流程": {
    talkTrack: ["把 JWT 画成 Header、Payload、Signature 三段，再讲登录后如何在请求里携带。", "不要只讲概念，要演示受保护接口未登录和已登录的差异。"],
    quickQuestions: ["Token 为什么需要签名？", "Token 过期后应该返回什么状态？"],
    keyTakeaway: "JWT 让服务在无状态请求中识别用户，课堂重点是签发、携带、校验和过期处理。",
    classroomFlow: ["登录获取 Token。", "讲三段结构。", "Authorize 携带访问。", "测试过期和无权限。"],
    visual: { title: "JWT 流程", type: "flow", steps: ["登录", "签发 Token", "请求携带", "服务校验"] },
  },
  "密码加密 bcrypt": {
    talkTrack: ["密码不能明文保存，这一点必须让学生形成底线意识。", "bcrypt 的盐和慢哈希让相同密码每次加密结果不同，也更难被暴力破解。"],
    quickQuestions: ["为什么不能把密码明文存数据库？", "相同密码为什么会得到不同哈希？"],
    keyTakeaway: "bcrypt 的价值是安全保存密码，而不是让密码可逆解密。",
    classroomFlow: ["演示明文风险。", "讲哈希和盐。", "生成两次哈希。", "验证密码。"],
    visual: { title: "密码保护", type: "flow", steps: ["输入密码", "加盐哈希", "保存哈希", "验证匹配"] },
  },
  "频率限制": {
    talkTrack: ["把限流和 AI 成本联系起来：不限制调用，模型费用和服务稳定性都会出问题。", "演示 429 时强调这是系统保护自己，不是系统坏了。"],
    quickQuestions: ["限流可以按哪些维度统计？", "登录接口为什么尤其需要限制？"],
    keyTakeaway: "限流保护系统稳定性和 AI 调用成本，429 是可预期的保护响应。",
    classroomFlow: ["说明风险。", "配置限流规则。", "连续请求触发 429。", "解释前端如何提示。"],
    visual: { title: "限流保护", type: "flow", steps: ["识别请求", "计数", "超过阈值", "返回 429"] },
  },
  "部署与联调": {
    talkTrack: ["部署不是把服务启动就结束，还要逐个验证核心接口。", "联调问题按网络、跨域、文件大小、认证、日志顺序排查。"],
    quickQuestions: ["部署后第一个应该验证哪个接口？", "前后端联调失败时如何缩小范围？"],
    keyTakeaway: "部署联调要用清单推进，保证核心功能、认证和文件链路都能在演示环境跑通。",
    classroomFlow: ["启动服务。", "访问接口文档。", "测试核心接口。", "记录联调问题。"],
    visual: { title: "部署联调", type: "flow", steps: ["启动服务", "访问文档", "接口测试", "问题排查"] },
  },
  "答辩 PPT 结构": {
    talkTrack: ["让学生按背景、方案、架构、亮点、演示组织答辩，不要从文件目录开始讲。", "每一段都准备一句能被评审记住的话。"],
    quickQuestions: ["10 分钟答辩里，代码细节应该占多少？", "项目亮点应该围绕技术名词还是用户价值？"],
    keyTakeaway: "答辩 PPT 要围绕用户价值和系统链路组织，代码细节服务于亮点说明。",
    classroomFlow: ["确定答辩目录。", "写每段一句话。", "补架构图和演示图。", "控制时间。"],
    visual: { title: "答辩结构", type: "flow", steps: ["背景", "方案", "架构", "演示"] },
  },
  "功能演示脚本": {
    talkTrack: ["演示脚本要用一个案例贯穿，不要跳来跳去展示功能。", "每一步都讲输入、处理、输出和系统价值。"],
    quickQuestions: ["为什么演示要准备截图或录屏备份？", "每一步演示应该说清哪三件事？"],
    keyTakeaway: "功能演示脚本要像业务故事，让评审看到系统如何帮助一个具体用户完成流程。",
    classroomFlow: ["选择案例。", "安排演示顺序。", "准备兜底材料。", "排练时间。"],
    visual: { title: "演示脚本", type: "flow", steps: ["统一案例", "咨询", "证据", "文书"] },
  },
  "常见答辩问题": {
    talkTrack: ["训练学生回答边界：系统是辅助，不是替代律师，更不是法律结论机器。", "回答追问时按原因、方案、边界、后续扩展四步走。"],
    quickQuestions: ["为什么用 RAG，而不是直接问大模型？", "如何说明系统保护用户隐私？"],
    keyTakeaway: "答辩追问要回答得克制、具体、有边界，尤其要讲清 RAG、隐私和系统限制。",
    classroomFlow: ["列高频问题。", "按四步组织回答。", "分组互相追问。", "修正夸大表述。"],
    visual: { title: "追问回答", type: "flow", steps: ["问题", "原因", "边界", "扩展"] },
  },
};

function buildSlideTakeaway(section, slide) {
  if (slide.keyTakeaway) return slide.keyTakeaway;
  const firstPoint = String(slide.points?.[0] || slide.teacherNotes?.[0] || slide.title).replace(/。$/, "").trim();
  if (section.id === "day1") return `本页要让项目基础更稳：${firstPoint}。`;
  if (section.id === "day2") return `本页要让 AI 回答更有依据、更可控：${firstPoint}。`;
  if (section.id === "day3") return `本页要把 AI 能力落到证据和文书业务流：${firstPoint}。`;
  if (section.id === "day4") return `本页要把项目收束到安全、部署和答辩表达：${firstPoint}。`;
  if (section.id === "build-lab") return `本页要训练 AI 协作方法：${firstPoint}。`;
  if (section.id === "tech-map") return `本页要帮助学生定位项目链路：${firstPoint}。`;
  if (section.id === "defense") return `本页要转化成答辩话术：${firstPoint}。`;
  return firstPoint.endsWith("。") ? firstPoint : `${firstPoint}。`;
}

function buildClassroomFlow(section, slide) {
  if (slide.classroomFlow?.length) return slide.classroomFlow;
  const demoSteps = slide.demoSteps?.slice(0, 2) || [];
  const dayLead =
    {
      day1: "先说明它为什么影响项目启动。",
      day2: "先用一个检索或问答案例引出问题。",
      day3: "先从证据流转的业务场景切入。",
      day4: "先说明它和最终交付、答辩的关系。",
    }[section.id] || "先把这一页放回项目主线。";

  return [
    dayLead,
    ...(demoSteps.length ? demoSteps.map((item) => `演示：${item}。`) : [`围绕 ${slide.title} 做一次小演示。`]),
    "最后让学生说出这一页的验收标准。",
  ].slice(0, 4);
}

function buildVisual(section, slide) {
  if (slide.visual?.steps?.length) return slide.visual;
  const steps = (slide.demoSteps?.length ? slide.demoSteps : slide.points || []).slice(0, 4);
  const fallback =
    {
      day1: ["准备环境", "启动服务", "访问接口", "完成验证"],
      day2: ["用户问题", "检索上下文", "Prompt 约束", "生成回答"],
      day3: ["上传证据", "解析材料", "AI 分析", "生成文书"],
      day4: ["认证安全", "部署联调", "演示脚本", "项目答辩"],
    }[section.id] || ["目标", "讲解", "演示", "验收"];

  return {
    title: slide.title,
    type: steps.length === 3 ? "triad" : "flow",
    steps: steps.length >= 3 ? steps : fallback,
  };
}

function buildDeepDive(section, slide) {
  if (slide.deepDive?.length) return slide.deepDive;

  const title = slide.title;
  const firstPoint = slide.points?.[0] || title;
  const demo = slide.demoSteps?.[0] || "现场演示对应功能";
  const practice = slide.practice || "让学生完成一次课堂复述或验证。";
  const sectionLead =
    {
      overview: "把项目目标和四天路线先讲成一个完整故事。",
      day1: "围绕“把项目跑起来”讲清工具、配置和 AI 基础。",
      day2: "围绕“让回答更可靠”讲清检索、Prompt 和实时交互。",
      day3: "围绕“证据到文书”讲清上传、解析、分析和生成。",
      day4: "围绕“能交付能答辩”讲清安全、部署和表达。",
    }[section.id] || "把这一页放回最终项目演示链路里讲。";

  return [
    { label: "业务场景", text: `${sectionLead} 本页从“${firstPoint}”切入。` },
    { label: "实现抓手", text: `课堂演示重点：${demo}，让学生看到功能如何落到接口、配置或代码入口。` },
    { label: "课堂落点", text: practice },
  ];
}

function enrichSlidesWithPlaybook() {
  coursewareSections.forEach((section) => {
    const defaults =
      teachingPlaybook.dayDefaults[section.id] || {
        talkTrack: section.id === "overview" ? ["先统一项目目标和四天路线，再进入每天的实操。"] : ["用一个完整案例把这一页串起来讲，避免只罗列概念。"],
        quickQuestions: section.id === "overview" ? ["四天结束后学生应该能交付什么？"] : ["这一页和最终答辩有什么关系？"],
        rescueTips: teachingPlaybook.rescueTips.slice(0, 1),
      };
    section.slides.forEach((slide) => {
      const enhancement = slideEnhancements[slide.title] || {};
      slide.talkTrack = slide.talkTrack || enhancement.talkTrack || defaults.talkTrack || slide.teacherNotes;
      slide.quickQuestions = slide.quickQuestions || enhancement.quickQuestions || defaults.quickQuestions || ["这一页最重要的结论是什么？"];
      slide.rescueTips = slide.rescueTips || enhancement.rescueTips || defaults.rescueTips || teachingPlaybook.rescueTips.slice(0, 1);
      slide.keyTakeaway = slide.keyTakeaway || enhancement.keyTakeaway || buildSlideTakeaway(section, slide);
      slide.classroomFlow = slide.classroomFlow || enhancement.classroomFlow || buildClassroomFlow(section, slide);
      slide.visual = slide.visual || enhancement.visual || buildVisual(section, slide);
      slide.deepDive = slide.deepDive || enhancement.deepDive || buildDeepDive(section, slide);
    });
  });
}

enrichSlidesWithPlaybook();

const polishedSlideCopy = {
  "课程总目标": {
    points: [
      "用一个劳动争议案例，讲清 AI 项目从问题到交付的完整闭环。",
      "让学生掌握用户提问、资料检索、答案生成、结果展示四步主线。",
      "最终能演示系统、解释技术链路，并回答评审追问。",
      "课堂不追求功能堆叠，追求能跑、能讲、能验收。",
    ],
    talkTrack: [
      "开场先把终点讲清楚：四天后不是交一堆代码，而是能用一个案例把 AI 项目讲明白。",
      "后面每个技术点都要回到这条主线：用户问了什么，系统找了什么资料，AI 怎么回答，结果如何展示。",
    ],
    classroomFlow: ["先展示最终成果。", "再拆成四步业务主线。", "最后说明每天交付一个可验收结果。"],
    keyTakeaway: "这门课的目标是做出一个能演示、能解释、能答辩的 AI 应用闭环。",
    practice: "让学生用 30 秒说清：这个系统帮助谁、解决什么问题、最终输出什么。",
  },
  "四天学习路线": {
    points: [
      "Day1：先跑起来，完成环境、项目结构和 AI 基础认知。",
      "Day2：让回答更可靠，完成 RAG、检索依据、Prompt 和流式问答。",
      "Day3：让业务闭环，完成证据上传、材料解析、AI 分析和文书生成。",
      "Day4：让项目可交付，完成认证安全、部署联调、总结表达和答辩。",
    ],
    talkTrack: [
      "这四天不是知识点清单，而是一条项目成长路线。",
      "每天都要有一个看得见的交付物：能启动、能问答、能处理业务、能答辩。",
    ],
    classroomFlow: ["按四天交付物快速扫一遍。", "指出每天最关键的验收结果。", "提醒学生用同一个案例贯穿全程。"],
    keyTakeaway: "四天路线要讲成一条工程路线：项目每天多一层可交付能力。",
  },
  "为什么纯向量检索不够": {
    points: [
      "向量检索擅长找语义相近的内容，但不一定能稳定命中法条编号和精确术语。",
      "劳动仲裁场景既要听懂口语问题，也要命中法律关键词和证据事实。",
      "检索错了，后面的 Prompt 再漂亮，AI 回答也会偏。",
    ],
    talkTrack: [
      "这页要让学生意识到：RAG 的核心不是把文档丢进向量库就结束。",
      "法律场景对“依据”非常敏感，语义相似和精确命中都需要。",
    ],
    classroomFlow: ["先问一个口语问题。", "再问一个法条编号问题。", "对比召回结果，引出 BM25 和混合检索。"],
    keyTakeaway: "法律检索要同时照顾语义理解和精确匹配，纯向量检索不是万能答案。",
    practice: "让学生各写一个“口语表达问题”和一个“法条编号问题”，观察检索差异。",
  },
  "混合检索与重排序": {
    points: [
      "先用多种方式扩大召回：语义相似找相关内容，关键词匹配抓精确依据。",
      "再合并、去重、重排序，把最适合放进 Prompt 的片段排到前面。",
      "排序规则要结合业务：法条、证据事实、案例材料的权重不应该完全一样。",
    ],
    talkTrack: [
      "混合检索不是简单拼接结果，而是先多找一点，再筛得更准。",
      "让学生把重排序理解成“给模型挑材料”，不是给用户展示搜索结果。",
    ],
    classroomFlow: ["画出两路召回。", "说明合并去重。", "用权重和命中规则重排。", "用固定问题验证效果。"],
    keyTakeaway: "混合检索的价值是让 Prompt 拿到更可靠、更贴近问题的上下文。",
  },
  "Prompt 结构化设计": {
    points: [
      "Prompt 要明确角色、任务、输入材料、输出格式和禁止事项。",
      "法律辅助回答要谨慎：给依据、给建议、讲风险，但不冒充最终裁决。",
      "如果要 JSON 输出，提示词和代码解析都要做约束，不能只靠模型自觉。",
    ],
    talkTrack: [
      "提示词不是写一段漂亮话，而是在给模型定义工作说明书。",
      "这页重点是让学生知道：可交付的 AI 功能必须能被解析、能被检查、能被兜底。",
    ],
    classroomFlow: ["展示一条模糊提示词。", "拆成角色、任务、输入、格式和约束。", "对比两次输出稳定性。"],
    keyTakeaway: "结构化 Prompt 把模型从自由发挥拉回可解析、可验收的工程输出。",
  },
  "文件上传基础": {
    points: [
      "证据上传不是简单保存文件，而是把文件和案件、证明对象关联起来。",
      "每个文件都要记录类型、大小、存储路径、上传人和处理状态。",
      "上传成功只代表文件进入系统，不代表解析和分析已经完成。",
    ],
    talkTrack: [
      "这页从业务讲起：劳动合同证明关系，工资流水证明发放，聊天记录证明催告。",
      "学生要理解文件上传接口为什么必须带元数据。",
    ],
    classroomFlow: ["展示一组证据材料。", "说明每个文件证明什么。", "再看上传接口和返回结果。"],
    keyTakeaway: "证据上传的核心是建立“文件 - 案件 - 证明对象”的关系。",
  },
  "AI 证据分析": {
    points: [
      "AI 先判断证据能证明什么，再指出缺口和风险。",
      "分析结果要服务文书生成：事实、理由、证据目录都要能被复用。",
      "证据分析只能辅助整理，不能替代仲裁庭对证明力的判断。",
    ],
    talkTrack: [
      "这页要把 AI 从“聊天机器人”拉回业务助手：它帮助整理证据链。",
      "讲的时候一定强调边界，避免学生把分析结论说成法律结论。",
    ],
    classroomFlow: ["先列证据清单。", "再标记证明对象。", "最后生成证据分析摘要和风险提示。"],
    keyTakeaway: "AI 证据分析的价值是把材料变成可复用的事实摘要和风险提示。",
  },
  "仲裁申请书生成": {
    points: [
      "文书生成要复用前面的咨询结论、证据分析和案件基本信息。",
      "模板负责格式，业务数据负责内容，AI 负责生成事实理由初稿。",
      "最终文书必须人工复核金额、日期、当事人信息和证据编号。",
    ],
    talkTrack: [
      "这页是 Day3 的收束：前面做的证据、分析、模板最终都要落到一份草稿。",
      "强调“草稿”两个字，避免学生把 AI 生成结果当作最终法律文书。",
    ],
    classroomFlow: ["准备案例字段。", "填充模板。", "生成草稿。", "人工核对关键字段。"],
    keyTakeaway: "文书生成是业务闭环的出口，但人工复核是必须保留的安全边界。",
  },
  "常见答辩问题": {
    points: [
      "为什么用 RAG：因为法律辅助要有依据，不能只依赖模型记忆。",
      "系统边界是什么：辅助咨询、整理材料、生成初稿，不替代律师和仲裁裁决。",
      "如果回答不准怎么办：检查知识库、检索结果、Prompt 约束和人工复核流程。",
    ],
    talkTrack: [
      "答辩追问不要急着证明自己什么都能做，先把边界讲清楚。",
      "评审更信任能说明限制、验证方式和后续改进的人。",
    ],
    classroomFlow: ["列出高频问题。", "按原因、方案、边界、改进回答。", "两人一组互相追问。"],
    keyTakeaway: "答辩回答要具体、克制、有边界，能说明依据和验证方式。",
  },
};

const sectionCopyPolicy = {
  day1: {
    why: "为什么讲：先把项目跑稳，后面的 AI、检索和业务演示才有基础。",
    demo: "怎么演示：打开真实命令、配置或接口，让学生看到结果而不是只听概念。",
    take: "带走什么：能启动服务、能定位入口、能解释这一页和项目主线的关系。",
  },
  day2: {
    why: "为什么讲：让 AI 回答从“能说”变成“有依据地说”。",
    demo: "怎么演示：用同一个劳动争议问题，对比检索、Prompt 和流式响应的变化。",
    take: "带走什么：检索质量决定回答质量，Prompt 负责把上下文变成可控输出。",
  },
  day3: {
    why: "为什么讲：把 AI 能力落到证据和文书，项目才像真实业务系统。",
    demo: "怎么演示：围绕一组证据，从上传、解析、分析走到文书草稿。",
    take: "带走什么：文件、证据、分析、模板之间必须能串成闭环。",
  },
  day4: {
    why: "为什么讲：项目交付不仅要能跑，还要安全、能部署、能答辩。",
    demo: "怎么演示：用登录、受保护接口、部署检查和答辩脚本证明项目完整。",
    take: "带走什么：讲清边界、验证方式和演示路线，比堆技术名词更重要。",
  },
  overview: {
    why: "为什么讲：先让学生知道四天最终要交付什么。",
    demo: "怎么演示：用最终效果和四天路线建立全局画面。",
    take: "带走什么：项目围绕一个劳动争议案例走完整 AI 应用闭环。",
  },
  "build-lab": {
    why: "为什么讲：让学生知道如何把 AI 当作协作工具，而不是把项目交给 AI 代写。",
    demo: "怎么演示：用同一个需求，现场示范提问、拆任务、生成代码、验证结果的完整节奏。",
    take: "带走什么：先描述目标和验收标准，再让 AI 帮忙实现，最后由学生亲自验证和解释。",
  },
  "tech-map": {
    why: "为什么讲：把项目文件、接口和 AI 链路整理成一张能答辩的技术地图。",
    demo: "怎么演示：从一次用户提问出发，依次定位接口、服务、RAG、数据库和返回结果。",
    take: "带走什么：学生能沿着一条请求链路找到关键代码，而不是只记住目录名。",
  },
  defense: {
    why: "为什么讲：把已经完成的项目整理成评审听得懂、看得见、问得住的表达。",
    demo: "怎么演示：用一个统一案例串起背景、功能、架构、亮点和边界。",
    take: "带走什么：答辩要讲价值、讲链路、讲依据、讲限制，少做代码流水账。",
  },
};

function compactPoint(text) {
  return String(text)
    .replace(/。$/, "")
    .replace(/今天/g, "本页")
    .replace(/学生/g, "学生")
    .trim();
}

function getSlideLead(slide) {
  return compactPoint(slide.points?.[0] || slide.keyTakeaway || slide.title);
}

function buildDefaultTalkTrack(section, slide, policy) {
  const lead = getSlideLead(slide);
  if (section.id === "build-lab") {
    return [
      `这一页先讲清任务边界：${lead}。`,
      "讲的时候示范一次好提示词：先说目标、再说现状、再要求 AI 给出可验证的修改步骤。",
    ];
  }
  if (section.id === "tech-map") {
    return [
      `这一页不要背目录，直接把学生带到链路里：${lead}。`,
      "讲完后让学生指出入口文件、核心服务和 AI 处理位置，形成答辩时能复述的地图。",
    ];
  }
  if (section.id === "defense") {
    return [
      `这一页按答辩语言讲：${lead}。`,
      "提醒学生每个功能都要配一个案例、一个技术依据和一个边界说明。",
    ];
  }
  if (section.id === "overview") {
    return [
      `先把本页当成课程导航讲：${lead}。`,
      "不要急着展开技术细节，先让学生知道四天后要交付什么、用什么案例串起来。",
    ];
  }
  return [
    `这一页先落到课堂目标：${lead}。`,
    `讲完后回到主线：${policy.take.replace("带走什么：", "")}`,
  ];
}

function buildDefaultClassroomFlow(section, slide) {
  if (slide.demoSteps?.length) {
    return [
      "先用一句业务场景开场。",
      `现场演示：${slide.demoSteps.slice(0, 2).join("、")}。`,
      "最后让学生说出本页对应的验收结果。",
    ];
  }
  if (section.id === "defense") {
    return ["先给答辩表达模板。", "再用统一案例套一遍。", "最后安排学生互相追问。"];
  }
  if (section.id === "tech-map") {
    return ["先画业务链路。", "再定位代码入口。", "最后让学生复述请求经过的层次。"];
  }
  if (section.id === "build-lab") {
    return ["先拆需求。", "再写 AI 提示词。", "最后运行或检查结果。"];
  }
  return ["先用一句业务场景开场。", "再打开对应页面、接口或代码入口。", "最后让学生复述本页的验收标准。"];
}

function buildDefaultPractice(section, slide) {
  if (section.id === "defense") {
    return "让学生把本页内容改写成 30 秒答辩话术，并互相追问一次。";
  }
  if (section.id === "tech-map") {
    return "让学生沿着本页链路找到一个代码入口，并说明它在系统里负责什么。";
  }
  if (section.id === "build-lab") {
    return "让学生把本页任务写成一条 AI 提示词，并补上一句验收标准。";
  }
  return slide.practice || "让学生用一句话复述本页结论，并指出对应的代码或演示入口。";
}

function polishSlideCopy(section, slide) {
  const override = polishedSlideCopy[slide.title] || {};
  Object.assign(slide, override);

  if (slide.points?.length) {
    slide.points = slide.points.slice(0, 4).map((point) => {
      const text = compactPoint(point);
      return text.endsWith("。") ? text : `${text}。`;
    });
  }

  const policy = sectionCopyPolicy[section.id] || sectionCopyPolicy.overview;
  slide.deepDive = override.deepDive || [
    { label: "为什么讲", text: policy.why.replace("为什么讲：", "") },
    { label: "怎么演示", text: (slide.demoSteps?.length ? `现场演示：${slide.demoSteps.slice(0, 2).join("、")}。` : policy.demo.replace("怎么演示：", "")) },
    { label: "学生带走", text: slide.keyTakeaway || policy.take.replace("带走什么：", "") },
  ];

  slide.talkTrack = override.talkTrack || buildDefaultTalkTrack(section, slide, policy);

  slide.classroomFlow = override.classroomFlow || buildDefaultClassroomFlow(section, slide);

  slide.keyTakeaway = override.keyTakeaway || slide.keyTakeaway || policy.take.replace("带走什么：", "");
  slide.practice = override.practice || buildDefaultPractice(section, slide);
}

function polishAllCoursewareCopy(extraSections = []) {
  [overviewSection, ...programDays, ...extraSections].forEach((section) => {
    section.slides.forEach((slide) => polishSlideCopy(section, slide));
  });
}

export { coursewareSections, overviewSection, programDays };

export const topLevelSections = [
  {
    id: "overview",
    label: "总览",
    description: "先统一课程目标、业务场景和四天路线。",
  },
  {
    id: "build-lab",
    label: "从零实现",
    description: "带学生用 AI 从 0 到 1 实现劳动仲裁辅助项目。",
  },
  {
    id: "program",
    label: "四天课程",
    description: "按 Day1-Day4 进入逐日课件与讲授节奏。",
  },
  {
    id: "tech-map",
    label: "技术地图",
    description: "把项目分层、数据流和代码锚点讲清楚。",
  },
  {
    id: "defense",
    label: "答辩准备",
    description: "围绕演示脚本、答辩结构和常见问答做收尾。",
  },
];

export const programSection = {
  id: "program",
  title: "四天课程主线",
  subtitle: "保持单页浏览体验，但把课程组织改成总览 + 每日模块的两级结构。",
  tags: ["结构化课件", "逐日导航", "教学节奏", "单页模块化"],
  highlights: [
    { value: String(programDays.length), label: "授课日" },
    { value: String(programDays.reduce((total, day) => total + day.slides.length, 0)), label: "教学页" },
    { value: String(programDays.reduce((total, day) => total + day.tasks.length, 0)), label: "课堂任务" },
  ],
};

export const aiBuildSection = {
  id: "build-lab",
  title: "从零开始：用 AI 实现仲裁辅助系统",
  subtitle: "把 AI 当作结对工程师，带学生从业务目标、工程骨架、AI 能力到验收答辩完整走一遍。",
  tags: ["AI 协作开发", "从零实现", "提示词驱动", "验收标准", "项目实训"],
  slides: [
    {
      title: "先定规则：人指挥，AI 协作",
      time: "起步 1",
      points: [
        "学生不是让 AI 代写项目，而是用 AI 辅助读代码、拆任务、写初稿、定位错误。",
        "每次让 AI 写代码前，都要先让它说明目标、涉及文件、数据流和验收方式。",
        "课堂规矩：AI 可以给答案，但学生必须能解释改了什么、为什么这样改、怎么证明能跑。",
      ],
      teacherNotes: ["把 AI 的角色讲清楚：它是结对工程师，不是替学生完成项目的机器。"],
      talkTrack: ["先把边界说清楚：人负责判断和验收，AI 负责加速探索和生成初稿。", "从第一节课开始训练学生先提问、再实现、最后验收。"],
      quickQuestions: ["什么事情不能直接交给 AI 决定？", "为什么写代码前要先让 AI 读项目和给方案？"],
      rescueTips: ["如果学生只会问“帮我实现项目”，立刻要求改成“先不要写代码，请先分析结构”。"],
      demoSteps: ["展示错误提问和正确提问对比", "让学生把一个大需求拆成 3 个小任务"],
      aiPrompts: [
        "你是我的结对工程师。先不要写代码，请帮我理解这个项目要解决什么业务问题，并列出最小可交付版本。",
        "请把需求拆成 5 个小里程碑，每个里程碑说明输入、输出、涉及文件和验收方式。",
      ],
      acceptance: ["学生能说出 AI 在本项目中的协作边界。", "学生能把“实现项目”拆成可验收的小任务。"],
      practice: "让每组写一条坏提示词，再改成一条可执行的工程提示词。",
    },
    {
      title: "从业务故事开始建项目",
      time: "起步 2",
      points: [
        "先确定用户故事：劳动者输入案情，系统给出咨询、诉求分析、证据建议和文书草稿。",
        "最小闭环不是功能越多越好，而是一条案例能从输入走到输出。",
        "让 AI 帮忙写需求文档，但由学生判断哪些功能进入第一版。",
      ],
      teacherNotes: ["不要从技术栈开始，先让学生知道为什么要写这些代码。"],
      talkTrack: ["项目从一句用户故事开始：被拖欠工资的人，希望系统帮他理清怎么维权。", "后面所有技术选择都要服务这条业务链路。"],
      quickQuestions: ["这个系统第一版必须完成哪一条业务链路？", "哪些功能看起来高级但第一版可以先不做？"],
      rescueTips: ["学生需求发散时，用“第一版能不能演示”把范围收回来。"],
      demoSteps: ["白板写用户故事", "把故事拆成咨询、分析、证据、文书四个模块"],
      aiPrompts: [
        "请根据“劳动仲裁辅助系统”写一版 MVP 需求说明，只保留 4 天实训能完成的功能。",
        "请把需求拆成用户故事列表，每条故事包含角色、目标、验收标准。",
      ],
      acceptance: ["每组有一版不超过 8 条的 MVP 用户故事。", "每条用户故事都有可验证的输出。"],
      practice: "用“拖欠工资 3 个月”案例写出第一版业务流程。",
    },
    {
      title: "让 AI 生成工程骨架",
      time: "起步 3",
      points: [
        "先让 AI 设计目录结构，再让它解释每个目录的职责。",
        "骨架只做 FastAPI 启动、配置、路由注册、健康检查和基础异常。",
        "第一轮代码必须小，能启动、能访问 /docs、能通过健康检查即可。",
      ],
      teacherNotes: ["这一页适合现场演示如何从空目录生成一个最小 FastAPI 项目。"],
      talkTrack: ["先要一个能跑的壳，再往里面加业务。", "骨架阶段不要急着加 AI、数据库、文件上传。"],
      quickQuestions: ["为什么第一步不是直接写 RAG？", "健康检查接口能证明什么？"],
      rescueTips: ["AI 一次生成太多代码时，让它缩小范围：只保留 main.py、config.py、router.py。"],
      demoSteps: ["新建空目录", "让 AI 给出目录结构", "运行服务并打开 /docs"],
      aiPrompts: [
        "请为 FastAPI 项目设计最小目录结构，只包含启动入口、配置、路由和健康检查。先给结构，不要写全部代码。",
        "请实现最小 FastAPI 骨架：启动入口、配置、路由和健康检查，要求能访问 /docs 和 /health。",
      ],
      acceptance: ["项目可以启动。", "/docs 可以打开。", "/health 返回正常状态。", "学生能解释 main.py 如何注册路由。"],
      practice: "每组用 AI 生成一个最小 FastAPI 骨架并跑通。",
    },
    {
      title: "用 AI 设计数据模型和接口",
      time: "起步 4",
      points: [
        "先让 AI 根据用户故事列出核心实体：用户、咨询、案件、证据、文书。",
        "接口设计要先确定输入输出，再写数据库表和 Service。",
        "每个接口都要有示例请求、示例响应和失败情况。",
      ],
      teacherNotes: ["训练学生不要一上来写表，先从数据流和接口契约出发。"],
      talkTrack: ["接口是前后端和 AI 能力之间的合同，合同不清楚，后面会越写越乱。", "让 AI 先产出接口草案，再由学生删减。"],
      quickQuestions: ["咨询接口的输入和输出分别是什么？", "证据表为什么必须有 user_id？"],
      rescueTips: ["模型字段太多时，先保留第一版演示必须字段。"],
      demoSteps: ["让 AI 生成 API 表格", "选择一个接口转成 Pydantic Schema", "补失败响应"],
      aiPrompts: [
        "请根据 MVP 用户故事设计 API 清单，字段包括路径、方法、输入、输出、失败情况。",
        "请为咨询、证据、文书三个模块设计最小 Pydantic Schema，不要过度设计。",
      ],
      acceptance: ["至少有咨询、证据、文书 3 组接口契约。", "每个接口都有示例请求和验收方式。"],
      practice: "让学生把一个用户故事转成接口契约。",
    },
    {
      title: "实现 AI 咨询：先假数据，再接模型",
      time: "起步 5",
      points: [
        "先用固定返回值跑通接口和前端演示，不要第一步就依赖模型 Key。",
        "再接入 LLM 调用，并把 Prompt、模型配置和输出处理分层。",
        "最后加入失败兜底：模型超时、Key 不可用、输出为空都要能处理。",
      ],
      teacherNotes: ["这页要教学生工程顺序：先跑通链路，再替换真实 AI。"],
      talkTrack: ["先让系统能回答，再让它回答得聪明。", "假数据阶段不是偷懒，是为了验证接口链路。"],
      quickQuestions: ["为什么先用假数据反而更稳？", "AI 调用失败时用户应该看到什么？"],
      rescueTips: ["没有模型 Key 时，用 mock provider 保持课堂继续推进。"],
      demoSteps: ["实现固定回答", "替换为 LLM 调用", "模拟 Key 错误看兜底"],
      aiPrompts: [
        "请先实现一个不调用大模型的咨询接口，固定返回结构化回答，用于验证链路。",
        "请把咨询接口改成可插拔 AI Provider：默认 mock，配置了 Key 后再调用真实模型。",
      ],
      acceptance: ["无模型 Key 时接口仍可返回 mock 结果。", "配置模型后能返回真实回答。", "失败时有明确错误和日志。"],
      practice: "让每组先做 mock 咨询，再讨论如何替换真实模型。",
    },
    {
      title: "实现前端页面：先静态，再接接口",
      time: "起步 6",
      points: [
        "前端第一版只做三个页面：AI 咨询、证据管理、文书预览。",
        "先用 mock 数据把页面状态做出来，再替换为真实 API 调用。",
        "每个页面都要有输入、加载、成功、失败四种状态，避免只做静态展示。",
      ],
      teacherNotes: ["这页补齐项目产品感，让学生知道最终演示不是只打开接口文档。"],
      talkTrack: ["前端不要一开始追求好看，先把业务流程跑通。", "页面实现也要遵守同样顺序：先静态、再 mock、再接真实接口。"],
      quickQuestions: ["为什么前端不能第一步就直接接真实接口？", "AI 咨询页至少需要哪些状态？"],
      rescueTips: ["如果学生卡在样式，先要求保留最小页面：输入框、提交按钮、结果区域、错误提示。"],
      demoSteps: ["画三个核心页面", "用 mock 数据显示咨询结果", "把 mock 替换成 fetch 请求"],
      aiPrompts: [
        "请为劳动仲裁辅助系统设计最小前端页面，只包含 AI 咨询、证据管理、文书预览三个页面，先给组件结构。",
        "请先实现 AI 咨询页面的静态版和 mock 数据版，包含输入、加载、成功、失败四种状态，暂时不要接真实接口。",
      ],
      acceptance: ["能打开 AI 咨询页面。", "mock 数据能展示结构化回答。", "失败状态有明确提示。", "学生能说明后续如何替换为真实接口。"],
      practice: "每组先做一个 AI 咨询静态页，再把固定结果显示到页面上。",
    },
    {
      title: "实现 RAG：知识库、检索、引用依据",
      time: "起步 7",
      points: [
        "当前项目把 RAG 拆成检索、Prompt 构建、模型调用三段可解释链路。",
        "核心思路是先找相关材料，再组织上下文，最后让模型在约束内回答。",
        "文件上下文会随本次请求进入检索链路，变成临时补充材料。",
      ],
      teacherNotes: ["重点不是让学生记住框架名，而是把 RAG 拆成可测试的小部件。"],
      talkTrack: ["现在这个项目最适合讲 RAG 的地方，是它把检索、Prompt、模型调用拆开了。", "学生能看到 AI 回答不是突然出现的，而是由上下文、用户问题和模型共同生成。"],
      quickQuestions: ["为什么先组织上下文再问模型更适合教学？", "文件上传内容进入 RAG 后，风险和收益分别是什么？"],
      rescueTips: ["如果学生被 LangChain、RAG 名词绕住，就回到一句话：先找资料，再带资料问模型。"],
      demoSteps: ["打开 RAG 代码入口", "指出检索、Prompt、模型三个角色", "打开测试文件看如何验证上下文进入 Prompt"],
      aiPrompts: [
        "请阅读 RAG 代码入口，按检索、Prompt 构建、模型调用三层解释链路，不要改代码。",
        "请基于当前 RagChatChain 写一个测试：验证上传文件内容会进入最终 Prompt，并说明断言点。",
      ],
      acceptance: ["学生能说出 RAG 链路的三个角色。", "学生能解释文件上下文如何进入 Prompt。", "学生能指出测试里如何证明 RAG 生效。"],
      practice: "让学生把当前后台菜单知识，替换成劳动仲裁法条知识，保持同样的 RAG 链路。",
    },
    {
      title: "实现证据和文书：业务闭环",
      time: "起步 8",
      points: [
        "证据模块先做上传元数据，再做文件保存、解析和 AI 分析。",
        "文书模块先用模板生成文本，再考虑 PDF 导出和格式优化。",
        "让 AI 写代码时每次只做一个环节，避免上传、解析、分析、生成混在一起。",
      ],
      teacherNotes: ["这页要把项目从 AI 问答带到真实业务闭环。"],
      talkTrack: ["证据和文书是项目从玩具变成业务系统的关键。", "不要让 AI 一次写完整大模块，按链路一段一段验收。"],
      quickQuestions: ["证据上传成功是否等于证据分析成功？", "模板生成比字符串拼接好在哪里？"],
      rescueTips: ["文件解析失败时先验证文件类型和路径，再看 AI 分析。"],
      demoSteps: ["上传一份示例证据", "生成证据分析摘要", "用模板生成仲裁申请书草稿"],
      aiPrompts: [
        "请只实现证据上传元数据保存，不要做 AI 分析，完成后给出测试方法。",
        "请基于 Jinja2 设计仲裁申请书模板，输入为用户信息、诉求、证据清单。",
      ],
      acceptance: ["证据上传有记录。", "解析失败不会导致服务崩溃。", "文书模板能用示例数据渲染。"],
      practice: "每组用一个拖欠工资案例，完成从证据到文书草稿的最小闭环。",
    },
    {
      title: "让 AI 帮你调试，而不是猜错",
      time: "起步 9",
      points: [
        "调试提示词必须包含：报错全文、复现步骤、相关文件、期望行为和已尝试方法。",
        "让 AI 先定位原因和验证思路，再要求它改代码。",
        "修完后必须重新运行测试或接口请求，不能只看 AI 说修好了。",
      ],
      teacherNotes: ["这是学生最容易形成好习惯的一页。"],
      talkTrack: ["报错不是拿给 AI 算命的，是给它诊断材料。", "缺少复现步骤，AI 很容易给出看似合理但不相关的修复。"],
      quickQuestions: ["一条好的调试提示词需要包含哪些信息？", "为什么不能直接把报错丢给 AI？"],
      rescueTips: ["AI 连续两次修不好时，让它停止改代码，先列可能原因和验证顺序。"],
      demoSteps: ["制造一个配置错误", "用差提示词和好提示词对比", "运行验证命令"],
      aiPrompts: [
        "下面是报错全文、复现步骤和相关文件。请先分析最可能的 3 个原因，并给出验证顺序，先不要改代码。",
        "请根据刚才确认的原因做最小修改，改完说明我应该运行哪些命令验证。",
      ],
      acceptance: ["学生能写出包含复现步骤的调试提示词。", "修复后能提供验证命令和结果。"],
      practice: "给学生一个故意破坏的配置，让他们用 AI 定位并修复。",
    },
    {
      title: "最终验收：能跑、能讲、能答辩",
      time: "收束",
      points: [
        "项目验收不是代码写完，而是能用一个案例完整演示。",
        "每组必须提交运行截图、接口截图、关键代码说明、AI 协作记录和答辩脚本。",
        "答辩时要说明 AI 帮了什么、人判断了什么、项目边界在哪里。",
      ],
      teacherNotes: ["把成果标准讲清楚，学生才知道 AI 实训不是复制粘贴。"],
      talkTrack: ["最终成果看三件事：能跑、能讲、能解释。", "AI 协作记录本身也是学习成果，能体现学生是否真的会指挥 AI。"],
      quickQuestions: ["项目能跑和项目能交付有什么区别？", "答辩时如何说明 AI 协作过程？"],
      rescueTips: ["现场演示不稳时用录屏兜底，但必须能解释真实代码链路。"],
      demoSteps: ["展示最终验收清单", "模拟 5 分钟项目演示", "准备常见追问"],
      aiPrompts: [
        "请根据当前项目生成一份最终验收清单，覆盖功能、接口、数据、错误处理和答辩材料。",
        "请帮我准备 5 分钟演示脚本，要求按一个劳动争议案例贯穿咨询、证据、文书和答辩亮点。",
      ],
      acceptance: ["完成一个可演示案例。", "能解释关键代码链路。", "能回答为什么使用 RAG、如何保护隐私、系统边界是什么。"],
      practice: "每组按验收清单做 5 分钟彩排，其他组负责追问。",
    },
  ],
  codeRefs: [
    ["backend/main.py", "从 FastAPI 应用入口理解项目启动。"],
    ["backend/app/plugin/module_ai/chat/rag.py", "RAG 链路中的检索、Prompt 构建和模型调用。"],
    ["backend/app/plugin/module_ai/chat/service.py", "ChatService 如何调用 RAG 链路并写入会话历史。"],
    ["backend/app/plugin/module_ai/chat/crud.py", "append_run_crud 如何保存用户和助手的一轮问答。"],
    ["backend/tests/test_ai_chat_service.py", "用测试证明上下文进入 Prompt、流式回答进入会话历史。"],
  ],
  tasks: ["写 MVP 用户故事", "生成最小 FastAPI 骨架", "实现 mock AI 咨询", "做出前端最小页面", "接入最小 RAG", "完成证据到文书闭环", "准备最终验收"],
};

const aiBuildEnrichment = [
  {
    keyTakeaway: "这页要建立课堂规则：AI 可以参与生成，但最终判断、解释和验收必须由学生完成。",
    classroomFlow: ["展示一句笼统提示词为什么不可执行。", "把同一需求拆成目标、文件、数据流、验收四部分。", "让学生现场改写自己的第一条工程提示词。"],
    visual: { title: "AI 协作闭环", type: "loop", steps: ["人提出目标", "AI 给出方案", "学生审查修改", "运行验证结果"] },
  },
  {
    keyTakeaway: "先有业务故事，再有技术方案；学生要知道每个接口服务哪一段真实流程。",
    classroomFlow: ["用拖欠工资案例开场。", "把案例拆成咨询、证据、文书三个输出。", "删掉第一版不需要的高级功能。"],
    visual: { title: "MVP 业务链路", type: "flow", steps: ["用户案情", "诉求分析", "证据建议", "文书草稿"] },
  },
  {
    keyTakeaway: "骨架阶段只追求可启动、可访问、可验证，不把数据库和 AI 一次塞进去。",
    classroomFlow: ["画出最小目录。", "让 AI 生成 main、config、router。", "运行 /docs 和 /health 做即时验收。"],
    visual: { title: "最小工程骨架", type: "stack", steps: ["main.py", "core/config.py", "api/router.py", "/health"] },
  },
  {
    keyTakeaway: "接口契约是协作边界，先说清输入输出，再讨论表结构和业务实现。",
    classroomFlow: ["从一个用户故事抽实体。", "把实体转成接口清单。", "选择一个接口写 Schema 和失败响应。"],
    visual: { title: "接口设计顺序", type: "flow", steps: ["用户故事", "核心实体", "请求响应", "失败场景"] },
  },
  {
    keyTakeaway: "先 mock 再接真实模型，可以把课堂风险从网络和 Key 问题里解耦出来。",
    classroomFlow: ["先返回固定结构。", "再替换 AI Provider。", "演示 Key 错误、超时和空回复的兜底。"],
    visual: { title: "咨询接口演进", type: "flow", steps: ["Mock 返回", "Provider 抽象", "真实模型", "失败兜底"] },
  },
  {
    keyTakeaway: "法律 AI 的可信度来自可追溯依据，不是回答看起来像专业文本。",
    classroomFlow: ["准备少量法条。", "演示切片和向量化。", "提问并检查召回依据是否正确。"],
    visual: { title: "RAG 回答链路", type: "flow", steps: ["法条文本", "切片索引", "相关召回", "带依据回答"] },
  },
  {
    keyTakeaway: "证据和文书把 AI 问答变成业务闭环，必须按上传、解析、分析、生成逐段验收。",
    classroomFlow: ["上传示例证据。", "查看解析和分析摘要。", "把结果填入仲裁申请书模板。"],
    visual: { title: "证据到文书闭环", type: "flow", steps: ["证据上传", "材料解析", "AI 分析", "文书生成"] },
  },
  {
    keyTakeaway: "调试时 AI 需要复现材料，不是只需要一句“报错了”。",
    classroomFlow: ["展示一个残缺报错提问。", "补齐复现步骤和相关文件。", "让 AI 先列验证顺序，再做最小修改。"],
    visual: { title: "调试提示词结构", type: "checklist", steps: ["报错全文", "复现步骤", "相关文件", "验证命令"] },
  },
  {
    keyTakeaway: "最终验收看的是完整演示能力：系统能跑、逻辑能讲、边界能答。",
    classroomFlow: ["按一个案例走完整流程。", "展示关键接口和代码链路。", "用常见追问训练答辩表达。"],
    visual: { title: "最终交付三件事", type: "triad", steps: ["能跑", "能讲", "能答辩"] },
  },
];

aiBuildSection.slides.forEach((slide, index) => {
  Object.assign(slide, aiBuildEnrichment[index]);
});

export const techMapSection = {
  id: "tech-map",
  title: "项目技术地图",
  subtitle: "按全栈架构、前端视图、接口契约、后端服务、AI 能力和验收证据讲清项目技术方案。",
  tags: ["全栈架构", "前端视图", "接口契约", "RAG", "验收证据"],
  slides: [
    {
      title: "全栈系统架构图：从浏览器到 AI 能力",
      time: "专题 0",
      points: [
        "前端层由路由、菜单、页面组件、状态和 API 封装组成，负责把用户操作转成稳定的 HTTP/WS 请求。",
        "后端层由 Controller、WebSocket、Service、CRUD 和权限依赖组成，负责接入、校验、业务编排和数据保存。",
        "AI 与数据层由 RAG、Embedding、ChatModel、MySQL、ChromaDB 和文件存储组成，负责依据召回、模型生成和结果追踪。",
      ],
      teacherNotes: ["这页必须讲成全栈系统架构图：先让学生看到浏览器端、接口层、后端服务、AI 能力、数据层如何连成一条链。"],
      talkTrack: [
        "这张图不是后端架构图，而是全栈项目架构图：用户在浏览器操作，前端页面维护状态并调用 API，后端服务编排 RAG，最后由数据库和向量库保存证据。",
        "答辩时要强调：AI 能力只是系统中的一层，真正的项目能力来自前端交互、接口契约、服务编排、知识召回和数据追踪一起闭环。",
      ],
      quickQuestions: ["用户点击发送后，前端做了什么，后端做了什么？", "哪一层负责界面状态，哪一层负责 AI 编排，哪一层负责证据保存？"],
      rescueTips: ["学生只说后端用了 FastAPI 和大模型时，要求他从浏览器页面开始重新讲一遍完整链路。"],
      demoSteps: ["先投屏本页全栈架构图", "指出前端路由、页面、API 封装", "指出 HTTP/WS 接入和 Service 编排", "指出 RAG、Embedding、Chroma、MySQL 的位置"],
      keyTakeaway: "整体技术地图要展示前端、接口、后端、AI 和数据如何协作，而不是只展示后端文件。",
      classroomFlow: ["先讲浏览器端。", "再讲接口契约和后端服务。", "最后讲 AI 能力层和数据层如何协作。"],
      visual: {
        title: "全栈系统架构图",
        type: "architecture",
        priority: "primary",
        layers: [
          { title: "浏览器与路由层", note: "页面入口与菜单导航", items: ["Vue Router", "菜单路由", "module_ai 页面", "登录态"] },
          { title: "前端交互层", note: "状态、事件、组件", items: ["chat/index.vue", "FaChatInput", "FaChatMessages", "knowledge/retrieval"] },
          { title: "接口契约层", note: "HTTP / WebSocket", items: ["chat.ts", "knowledge.ts", "request 封装", "WS 连接"] },
          { title: "后端服务层", note: "接入、权限、编排", items: ["controller.py", "ws.py", "ChatService", "KnowledgeService"] },
          { title: "AI 与数据层", note: "生成、召回、追踪", items: ["RagChatChain", "Embedding", "MySQL", "ChromaDB"] },
        ],
      },
      deepDive: [
        { label: "前端层", text: "路由决定入口，页面组件维护状态，api/module_ai 把用户事件变成 HTTP 或 WebSocket 调用。" },
        { label: "后端层", text: "controller/ws 负责接入，Service 负责编排，CRUD 与 RAG 分别处理数据保存和 AI 生成。" },
        { label: "证据层", text: "MySQL 保存会话和知识库元数据，ChromaDB 保存向量索引，文件存储保留原始资料。" },
      ],
      acceptance: ["能按五层解释全栈架构。", "能指出前端状态如何进入后端接口。", "能说明 MySQL 与 ChromaDB 的分工。"],
      practice: "让学生把本页架构图改写成答辩中的 60 秒全栈系统架构说明。",
    },
    {
      title: "前端架构图：路由、页面、状态、接口",
      time: "专题 1",
      points: [
        "路由与菜单决定用户能进入哪些页面，module_ai 下的 chat、knowledge、retrieval 是课堂主线页面。",
        "页面组件负责维护本地状态和用户事件，例如消息列表、当前会话、知识库选择、连接状态、检索参数。",
        "api/module_ai 和 utils/http/request 把页面事件封装成稳定的后端接口调用，避免组件直接拼接请求细节。",
      ],
      teacherNotes: ["这页专门补前端架构，不讲样式细节，重点讲路由、页面状态、组件事件和接口封装。"],
      talkTrack: [
        "前端不是几个页面截图，它也有架构：路由把页面挂进系统，组件维护状态，API 层封装请求，HTTP 工具统一处理 baseURL、token 和错误。",
        "讲前端时要回答三个问题：页面有什么状态，用户触发什么事件，事件最终调用哪个接口。",
      ],
      quickQuestions: ["聊天页最核心的四个状态是什么？", "为什么前端页面不应该直接散落写请求地址？"],
      rescueTips: ["学生只讲页面长什么样时，要求他按状态、事件、接口三列重新描述。"],
      demoSteps: ["打开 frontend/web/src/router", "打开 frontend/web/src/views/module_ai/chat/index.vue", "打开 chat/components", "打开 frontend/web/src/api/module_ai", "打开 frontend/web/src/utils/http/index.ts"],
      keyTakeaway: "前端架构图要讲清路由入口、页面状态、组件事件和 API 封装之间的关系。",
      classroomFlow: ["先讲路由和菜单入口。", "再讲 chat/knowledge/retrieval 页面职责。", "最后把页面事件对应到 API 封装。"],
      visual: {
        title: "前端架构图",
        type: "architecture",
        priority: "primary",
        layers: [
          { title: "路由与菜单", note: "页面如何进入系统", items: ["router/index.ts", "RouteTransformer", "MenuProcessor", "module_ai 路由"] },
          { title: "业务页面", note: "课堂演示主界面", items: ["chat/index.vue", "knowledge/index.vue", "retrieval/index.vue", "model-config"] },
          { title: "页面组件", note: "拆分交互职责", items: ["FaSidebar", "FaChatNavbar", "FaChatMessages", "FaChatInput"] },
          { title: "状态与事件", note: "页面运行时数据", items: ["messages", "sessionId", "knowledgeBaseIds", "connectionStatus"] },
          { title: "接口封装", note: "前后端契约入口", items: ["chat.ts", "knowledge.ts", "request", "WebSocket"] },
        ],
      },
      deepDive: [
        { label: "路由", text: "router 和菜单处理决定 module_ai 页面如何出现在系统导航中。" },
        { label: "状态", text: "聊天页的 messages、currentSessionId、selectedKnowledgeBaseIds、connectionStatus 决定能否稳定演示。" },
        { label: "接口", text: "chat.ts、knowledge.ts 和 request 封装把页面动作收束成 HTTP/WS 调用边界。" },
      ],
      acceptance: ["能画出前端五层结构。", "能列出 chat 页面关键状态。", "能把页面事件对应到 API 方法。"],
      practice: "让学生为 chat、knowledge、retrieval 三个页面各写一行：状态是什么、事件是什么、调用哪个接口。",
    },
    {
      title: "前后端契约图：页面事件如何变成接口调用",
      time: "专题 2",
      points: [
        "聊天事件通过 chat.ts 或 WebSocket 进入 /ai/chat，核心字段是 message、session_id、knowledge_base_ids。",
        "知识库事件通过 knowledge.ts 进入 /ai/knowledge，覆盖列表、新建、上传文档、重建索引和检索测试。",
        "接口契约要同时看前端 TypeScript 类型、请求封装、后端 schema 和 controller，不能只看后端函数。",
      ],
      teacherNotes: ["这一页用契约图讲全栈协作：前端事件、API 文件、HTTP/WS 入口、schema、service 必须一一对应。"],
      talkTrack: [
        "前后端联调最怕各讲各的，所以这里用契约图：左边是页面事件，中间是 API/WS，右边是后端 schema 和 service。",
        "学生要能说清：一个按钮点击，不是直接到模型，而是先经过前端状态、API 封装、后端接入、业务编排，最后才到 AI 或数据库。",
      ],
      quickQuestions: ["发送消息事件对应哪个前端 API 和哪个后端入口？", "上传文档事件需要前后端约定哪些字段？"],
      rescueTips: ["学生只打开 controller 时，要求他同时打开对应的 api/module_ai/*.ts 和 schema.py。"],
      demoSteps: ["打开 frontend/web/src/api/module_ai/chat.ts", "打开 frontend/web/src/api/module_ai/knowledge.ts", "打开 chat/schema.py", "打开 chat/controller.py 与 ws.py", "打开 knowledge/controller.py"],
      keyTakeaway: "全栈技术地图必须能讲清页面事件、请求字段、后端入口和服务编排之间的契约。",
      classroomFlow: ["先列页面事件。", "再找前端 API 封装。", "最后对应后端 schema、controller/ws 和 service。"],
      visual: {
        title: "前后端接口契约",
        type: "matrix",
        priority: "primary",
        columns: [
          { title: "页面事件", items: ["发送消息", "切换会话", "选择知识库", "上传文档", "检索测试"] },
          { title: "前端契约", items: ["AiChatAPI.chat", "getSessionList", "KnowledgeAPI.uploadDocument", "KnowledgeAPI.testRetrieval", "request/WS"] },
          { title: "后端入口", items: ["/ai/chat/ai-chat", "chat/ws.py", "/ai/knowledge/document/upload", "/retrieval/test", "schema.py"] },
          { title: "服务响应", items: ["回答内容", "session_id", "文档状态", "召回片段", "错误提示"] },
        ],
      },
      deepDive: [
        { label: "聊天契约", text: "message、session_id、knowledge_base_ids 从前端进入后端，决定 RAG 使用什么上下文。" },
        { label: "知识契约", text: "FormData、knowledge_base_id、top_k、query 等字段连接知识库页面和后端检索接口。" },
        { label: "错误契约", text: "配置缺失、连接失败、索引失败要返回能被前端展示和讲师定位的信息。" },
      ],
      acceptance: ["能把 3 个页面事件对应到前端 API。", "能把前端 API 对应到后端入口。", "能说明关键请求/响应字段。"],
      practice: "让学生选一个按钮，按页面事件、前端 API、后端入口、服务响应四列画契约图。",
    },
    {
      title: "后端组件图：入口、服务、AI、存储",
      time: "专题 3",
      points: [
        "启动组件：backend/main.py 创建应用，init_app.py 注册异常、中间件、路由、静态资源和动态插件路由。",
        "业务组件：module_ai/chat 负责会话与问答，module_ai/knowledge 负责知识库、文档和检索测试。",
        "基础组件：core/dependencies 提供认证权限，config/setting 提供运行配置，crud/model 承接持久化。",
      ],
      teacherNotes: ["按组件职责讲，不说“这个目录很多文件”，而说“这个组件接收什么、产出什么”。"],
      talkTrack: [
        "组件视图回答的是：系统由哪些部分组成，每个部分的责任是什么，依赖关系怎么走。",
        "AI 模块不是散落在项目里，而是集中在 module_ai 下，课堂讲解就围绕 chat 和 knowledge 两个子域展开。",
      ],
      quickQuestions: ["Controller、Service、CRUD 的职责分别是什么？", "为什么配置校验不应该写在前端页面里？"],
      rescueTips: ["学生混淆层次时，用一句话区分：Controller 接请求，Service 编排业务，CRUD 处理数据。"],
      demoSteps: ["打开 backend/main.py", "打开 backend/app/init_app.py", "打开 backend/app/plugin/module_ai", "指出 chat 与 knowledge 两个课堂核心模块"],
      keyTakeaway: "组件视图要讲清职责、依赖和替换点。",
      classroomFlow: ["先看应用启动。", "再看插件路由注册。", "最后进入 chat/knowledge 两个业务组件。"],
      visual: {
        title: "组件责任图",
        type: "matrix",
        priority: "primary",
        columns: [
          { title: "入口组件", items: ["main.py 创建应用", "init_app.py 注册路由", "controller.py 接 HTTP", "ws.py 接实时对话"] },
          { title: "业务组件", items: ["ChatService 编排问答", "KnowledgeService 编排索引", "RagChatChain 编排 RAG", "schema.py 固化契约"] },
          { title: "存储组件", items: ["crud.py 写关系数据", "model.py 定义表结构", "chroma_store.py 管向量", "error/status 便于定位"] },
        ],
      },
      deepDive: [
        { label: "接入职责", text: "controller.py 和 ws.py 只负责协议入口、鉴权依赖和请求转交。" },
        { label: "业务职责", text: "service.py 负责校验、编排、调用 RAG 或知识库索引流程。" },
        { label: "存储职责", text: "crud.py、model.py 和 ChromaKnowledgeStore 分别承接关系数据和向量数据。" },
      ],
      acceptance: ["能画出 Controller -> Service -> CRUD/RAG 的依赖方向。", "能说清 chat 与 knowledge 两个子域边界。"],
      practice: "让学生选一个新功能，说明它应该新增 controller、service、crud 还是只改 RAG。",
    },
    {
      title: "运行时序：一次提问如何完成",
      time: "专题 4",
      points: [
        "输入契约：message、session_id、knowledge_base_ids 和可选文件上下文从前端进入聊天链路。",
        "运行时序：前端发送请求，controller/ws 接入，ChatService 校验配置和会话，RAG 生成回答，CRUD 保存历史。",
        "输出证据：前端能看到回答，后端能查到会话 runs，异常时能返回配置或服务错误提示。",
      ],
      teacherNotes: ["用时序图讲，不要把这一页讲成 HTTP 和 WebSocket 概念课。"],
      talkTrack: [
        "运行时序回答的是：一次用户提问在系统里经过哪些节点，每个节点的输入输出是什么。",
        "HTTP 和 WebSocket 是接入方式不同，但核心编排一致：都要进入 ChatService，再进入 RAG，再保存历史。",
      ],
      quickQuestions: ["这条链路的第一个可验证输出是什么？", "如果没有保存会话历史，应该查哪个环节？"],
      rescueTips: ["WebSocket 失败时先用非流式接口确认 Service 和 RAG 是否正常，再回头查连接和 token。"],
      demoSteps: [
        "打开 frontend/web/src/views/module_ai/chat/index.vue",
        "打开 backend/app/plugin/module_ai/chat/schema.py",
        "打开 backend/app/plugin/module_ai/chat/ws.py",
        "打开 backend/app/plugin/module_ai/chat/controller.py",
        "打开 backend/app/plugin/module_ai/chat/service.py",
      ],
      keyTakeaway: "运行时序必须能说清输入、处理、输出和保存证据。",
      classroomFlow: ["先定义请求数据。", "再画运行时序。", "最后指出每个节点的验证方法。"],
      visual: {
        title: "一次提问运行时序",
        type: "sequence",
        priority: "primary",
        participants: ["前端聊天页", "HTTP/WS 入口", "ChatService", "RAG 链路", "数据存储"],
        messages: [
          { from: "前端聊天页", to: "HTTP/WS 入口", text: "发送 message、session_id、knowledge_base_ids" },
          { from: "HTTP/WS 入口", to: "ChatService", text: "鉴权、参数校验、选择流式或非流式路径" },
          { from: "ChatService", to: "RAG 链路", text: "组装上下文，调用检索、Prompt 和模型" },
          { from: "RAG 链路", to: "ChatService", text: "返回回答片段或完整回答" },
          { from: "ChatService", to: "数据存储", text: "append_run_crud 保存用户问题和助手回复" },
          { from: "ChatService", to: "前端聊天页", text: "返回答案、错误提示或流式增量" },
        ],
      },
      deepDive: [
        { label: "输入契约", text: "ChatQuerySchema 和 AiChatRequestSchema 定义消息、会话和知识库 ID 的传递方式。" },
        { label: "编排责任", text: "ChatService 统一处理配置校验、会话确认、流式输出和非流式输出。" },
        { label: "结果证据", text: "append_run_crud 把用户消息和助手回复写入 runs，支撑复盘和答辩追踪。" },
      ],
      acceptance: ["能画出完整时序。", "能说出请求体关键字段。", "能说明如何验证历史已保存。"],
      practice: "让学生按输入、接入、编排、生成、保存五列画一次提问链路。",
    },
    {
      title: "AI 编排：RAG 的可替换设计",
      time: "专题 5",
      points: [
        "RagChatChain 使用 Retriever、RagPromptBuilder、ChatModel 三个接口化角色，把检索、Prompt 和模型调用解耦。",
        "Retriever 可以从临时文件上下文或 Chroma 知识库中返回 RagDocument，后续可替换为 BM25、混合检索或重排序。",
        "ChatModel 提供 complete 和 stream 两种输出能力，让同一条 RAG 链路服务非流式和流式场景。",
      ],
      teacherNotes: ["这一页要讲设计质量：可替换、可测试、可扩展，而不是只说用了 RAG。"],
      talkTrack: [
        "专业说法不是“我们用了 RAG”，而是“我们把 RAG 拆成检索器、Prompt 构建器和模型适配器”。",
        "这样做的价值是清楚的：检索可替换，Prompt 可调整，模型可切换，测试可以替换 fake retriever 和 fake model。",
      ],
      quickQuestions: ["如果要做混合检索，最小改动应该发生在哪里？", "为什么测试里可以不用真实大模型？"],
      rescueTips: ["学生说不出设计价值时，让他回答：哪一部分最可能未来变化，当前代码如何隔离变化。"],
      demoSteps: ["打开 chat/rag.py", "定位 Retriever 协议", "定位 RagPromptBuilder", "定位 LangChainChatModel", "定位 RagChatChain"],
      keyTakeaway: "RAG 链路的专业亮点是接口化拆分，让检索、Prompt、模型三者独立演进。",
      classroomFlow: ["先讲接口化角色。", "再看当前实现。", "最后讲未来替换点和测试方式。"],
      visual: {
        title: "RAG 可替换设计",
        type: "pipeline",
        priority: "primary",
        steps: [
          { title: "Retriever", detail: "替换向量、BM25、混合检索或重排序" },
          { title: "RagDocument", detail: "统一临时文件和知识库召回结果" },
          { title: "PromptBuilder", detail: "集中处理角色、上下文和输出约束" },
          { title: "ChatModel", detail: "封装 complete 与 stream 两类模型调用" },
          { title: "RagChatChain", detail: "对外提供稳定的 RAG 编排入口" },
        ],
      },
      deepDive: [
        { label: "检索抽象", text: "Retriever 协议定义 query、user_id、dept_id、session_id、knowledge_base_ids 和 files 输入。" },
        { label: "Prompt 抽象", text: "RagPromptBuilder 只负责把上下文格式化成模型可执行任务，不负责检索和保存。" },
        { label: "模型抽象", text: "LangChainChatModel 是 OpenAI 兼容模型适配器，封装 ainvoke 和 astream。" },
      ],
      acceptance: ["能指出三个可替换点。", "能说明 fake retriever/fake model 如何测试。", "能说清 files 和 knowledge_base_ids 的区别。"],
      practice: "让学生设计一次 RAG 升级：只替换检索器，不改 ChatService。",
    },
    {
      title: "知识流水线：上传、索引、召回",
      time: "专题 6",
      points: [
        "控制面：knowledge/controller.py 提供知识库创建、文档上传、重建索引、删除和检索测试接口。",
        "处理面：KnowledgeService 串起文件保存、文本抽取、切片、Embedding、Chroma 写入和 chunk 记录更新。",
        "查询面：ChromaKnowledgeRetriever 根据 knowledge_base_ids 限定召回范围，把命中的片段交给 Prompt。",
      ],
      teacherNotes: ["用数据生命周期讲知识库：文件如何变成可召回片段，而不是只讲上传按钮。"],
      talkTrack: [
        "知识库链路专业讲法要分三层：控制面管资源，处理面做索引，查询面做召回。",
        "上传成功不是终点，索引成功、检索测试命中、聊天选择知识库后能引用，才算这条数据生命周期闭环。",
      ],
      quickQuestions: ["上传成功、解析成功、索引成功分别代表什么？", "为什么检索测试页是 RAG 质量的验收入口？"],
      rescueTips: ["召回失败按三步查：文档状态、Chroma 写入、query/knowledge_base_ids 是否正确。"],
      demoSteps: [
        "打开 knowledge/controller.py 查看 /create、/document/upload、/retrieval/test",
        "打开 knowledge/service.py 查看 upload_document 和 index_document",
        "打开 knowledge/text_splitter.py 与 embedding.py",
        "打开 knowledge/chroma_store.py 查看 query",
        "回到 chat/rag.py 查看 knowledge_base_ids 如何进入检索",
      ],
      keyTakeaway: "知识库不是文件列表，而是从原始文档到可召回片段的数据流水线。",
      classroomFlow: ["先讲控制面接口。", "再讲索引处理流水线。", "最后讲查询召回和验收证据。"],
      visual: {
        title: "知识库数据流水线",
        type: "pipeline",
        priority: "primary",
        steps: [
          { title: "原始文件", detail: "上传并保存文档元数据" },
          { title: "文本抽取", detail: "PDF、文本、表格进入统一文本处理" },
          { title: "切片与 Embedding", detail: "形成可索引的 chunk 与向量" },
          { title: "Chroma 写入", detail: "向量库保存可召回文本和 metadata" },
          { title: "检索召回", detail: "retrieval/test 与聊天链路复用召回结果" },
        ],
      },
      deepDive: [
        { label: "状态管理", text: "KnowledgeDocument 记录 parse_status、index_status、error_message，便于定位解析或索引失败。" },
        { label: "双存储", text: "关系数据库保存知识库、文档、分块元数据；Chroma 保存向量和可召回文本。" },
        { label: "验收证据", text: "retrieval/test 返回 content、metadata、distance，是证明知识库可用的直接证据。" },
      ],
      acceptance: ["能解释 parse_status 与 index_status。", "能说出关系库和 Chroma 分别存什么。", "能用 retrieval/test 验证一条材料被召回。"],
      practice: "让学生按控制面、处理面、查询面三层复述知识库链路。",
    },
    {
      title: "整体代码结构图：前端、后端、AI、数据",
      time: "专题 7",
      points: [
        "前端主线：router 负责入口，views/module_ai 负责页面，components 负责交互拆分，api/module_ai 负责接口封装。",
        "后端主线：main/init_app 负责应用启动，controller/ws 负责接入，service 负责编排，crud/model 负责关系数据。",
        "AI 与数据主线：rag.py、embedding.py、chroma_store.py、KnowledgeService 共同完成检索、Prompt、模型调用和向量索引。",
      ],
      teacherNotes: ["这页回答“整体项目代码在哪里”：前端、后端、AI、数据四类目录一起讲，避免学生只记住后端 module_ai。"],
      talkTrack: [
        "整体代码结构图不是全量目录树，而是课堂定位图。先问这个问题发生在哪一层：页面交互、接口契约、后端服务、AI 编排还是数据存储。",
        "答辩时可以说：前端主线在 router、views/module_ai、api/module_ai；后端主线在 module_ai/chat 和 module_ai/knowledge；基础能力由 core、config、utils/http 和数据库层支撑。",
      ],
      quickQuestions: ["页面显示问题先看哪个目录？", "接口字段不一致时要同时打开哪两个文件？", "AI 回答质量问题应该先看前端还是 RAG？"],
      rescueTips: ["学生找文件迷路时，让他先判断问题属于前端页面、前端 API、后端接入、业务服务、AI 编排还是数据存储。"],
      demoSteps: [
        "打开 frontend/web/src/router",
        "打开 frontend/web/src/views/module_ai/chat/index.vue",
        "打开 frontend/web/src/api/module_ai/chat.ts 与 knowledge.ts",
        "打开 frontend/web/src/utils/http/index.ts",
        "打开 backend/app/plugin/module_ai/chat 与 knowledge",
        "打开 backend/app/core/dependencies.py",
      ],
      keyTakeaway: "整体代码结构图要把前端入口、接口契约、后端服务、AI 编排和数据存储放在同一张定位图里。",
      classroomFlow: ["先讲前端目录。", "再讲后端目录。", "最后讲接口契约和 AI/数据目录如何连接。"],
      visual: {
        title: "整体代码结构图",
        type: "code-map",
        priority: "primary",
        groups: [
          { label: "前端入口", title: "路由、菜单、页面挂载", items: ["frontend/web/src/router", "frontend/web/src/router/core", "frontend/web/src/store/modules/menu.store.ts", "frontend/web/src/views/module_ai"] },
          { label: "前端交互", title: "页面、组件、状态、事件", items: ["chat/index.vue", "chat/components/FaChatInput.vue", "chat/components/FaChatMessages.vue", "knowledge/index.vue", "retrieval/index.vue"] },
          { label: "接口契约", title: "请求封装与类型定义", items: ["api/module_ai/chat.ts", "api/module_ai/knowledge.ts", "utils/http/index.ts", "ChatSession / KnowledgeDocument"] },
          { label: "后端接入", title: "HTTP / WebSocket / 权限", items: ["chat/controller.py", "chat/ws.py", "knowledge/controller.py", "core/dependencies.py"] },
          { label: "后端服务", title: "业务编排与持久化", items: ["chat/service.py", "chat/crud.py", "knowledge/service.py", "knowledge/model.py"] },
          { label: "AI 与数据", title: "RAG、Embedding、向量库", items: ["chat/rag.py", "knowledge/embedding.py", "knowledge/chroma_store.py", "MySQL + ChromaDB"] },
        ],
      },
      deepDive: [
        { label: "前端定位", text: "页面问题先看 views/module_ai，接口调用问题再看 api/module_ai 和 utils/http。" },
        { label: "后端定位", text: "接入问题看 controller/ws，业务问题看 service，保存问题看 crud/model。" },
        { label: "AI 定位", text: "回答质量、召回依据、知识库索引问题分别落到 rag.py、retrieval/test 和 chroma_store.py。" },
      ],
      acceptance: ["能按六组定位代码。", "能把前端文件和后端文件对应起来。", "能说明 AI 与数据目录负责什么。"],
      practice: "让学生拿一个问题判断：应该先看前端页面、前端 API、后端入口、Service、RAG 还是存储。",
    },
    {
      title: "验收视图：数据、权限、可观测性",
      time: "专题 8",
      points: [
        "数据验收：会话 runs、知识库文档状态、分块记录和 Chroma 召回结果共同证明链路跑通。",
        "权限验收：AuthPermission、当前用户、部门信息和接口权限共同构成访问边界。",
        "可观测性验收：配置错误、索引失败、模型无返回、WebSocket 断连都要有可定位的提示或状态。",
      ],
      teacherNotes: ["最后一页从架构评审收束到验收证据，让学生知道怎么证明系统可靠。"],
      talkTrack: [
        "专业项目答辩要拿证据说话：会话历史证明结果可追踪，检索测试证明依据可召回，状态字段证明故障可定位。",
        "法律辅助系统还必须讲清权限和人工复核边界，不能把模型输出包装成最终法律结论。",
      ],
      quickQuestions: ["你用什么证据证明 RAG 生效？", "接口权限和人工复核分别控制什么风险？"],
      rescueTips: ["学生答辩只讲模型时，要求他指出一条可查的数据记录和一条可验证的检索结果。"],
      demoSteps: ["打开 chat/crud.py 查看 append_run_crud", "打开 knowledge/model.py 和 crud.py 查看状态字段", "打开 backend/app/core/dependencies.py 查看 AuthPermission", "整理技术地图验收清单"],
      keyTakeaway: "专业技术地图最终要落到验收证据：可追踪、可验证、可授权、可定位。",
      classroomFlow: ["先列数据证据。", "再讲权限和边界。", "最后整理成答辩验收清单。"],
      visual: {
        title: "验收证据图",
        type: "matrix",
        priority: "primary",
        columns: [
          { title: "数据证据", items: ["ChatSession.runs", "KnowledgeDocument 状态", "chunk 记录", "Chroma 召回结果"] },
          { title: "权限证据", items: ["AuthPermission", "当前用户", "部门边界", "接口权限"] },
          { title: "可观测证据", items: ["配置校验", "error_message", "连接状态", "检索测试结果"] },
        ],
      },
      deepDive: [
        { label: "可追踪", text: "ChatSession 的 runs 记录用户问题和助手回答，能复盘一次咨询过程。" },
        { label: "可验证", text: "retrieval/test 的结果和知识库文档状态能证明材料是否真正进入检索链路。" },
        { label: "可定位", text: "配置校验、error_message、无内容提示和连接状态帮助定位失败发生在哪一段。" },
      ],
      acceptance: ["能列出 4 类验收证据。", "能说明权限边界。", "能回答一个失败场景如何定位。"],
      practice: "让学生准备一段专业版 90 秒技术地图说明，必须包含架构层次、运行时序、数据证据、权限边界和风险兜底。",
    },
  ],
  codeRefs: [
    ["frontend/web/src/router/index.ts", "前端路由入口。"],
    ["frontend/web/src/views/module_ai/chat/index.vue", "聊天演示入口：会话、WebSocket、知识库选择。"],
    ["frontend/web/src/views/module_ai/knowledge/index.vue", "知识库维护页面。"],
    ["frontend/web/src/views/module_ai/retrieval/index.vue", "检索质量验证页面。"],
    ["frontend/web/src/api/module_ai/chat.ts", "聊天页面的 HTTP 接口封装。"],
    ["frontend/web/src/api/module_ai/knowledge.ts", "知识库与检索测试接口封装。"],
    ["frontend/web/src/utils/http/index.ts", "前端 request、baseURL、token 和拦截器。"],
    ["backend/main.py", "启动和命令入口：run、revision、upgrade。"],
    ["backend/app/init_app.py", "应用初始化：注册异常、中间件、路由和静态资源。"],
    ["backend/app/plugin/module_ai/chat/controller.py", "聊天 HTTP 接入入口。"],
    ["backend/app/plugin/module_ai/chat/ws.py", "聊天 WebSocket 接入入口。"],
    ["backend/app/plugin/module_ai/chat/rag.py", "RAG 链路：检索、Prompt 构建和模型调用。"],
    ["backend/app/plugin/module_ai/chat/service.py", "ChatService 编排流式/非流式问答。"],
    ["backend/app/plugin/module_ai/chat/crud.py", "append_run_crud 保存会话历史。"],
    ["backend/app/plugin/module_ai/knowledge/service.py", "知识库上传、解析、切片、Embedding 和索引入库。"],
    ["backend/app/core/dependencies.py", "当前用户和权限依赖。"],
  ],
  tasks: ["讲清全栈系统架构图", "讲清前端架构图", "讲清前后端接口契约", "画出一次提问运行时序", "说明 RAG 三个可替换点", "说明知识库数据生命周期", "整理专业版 90 秒技术地图答辩话术"],
};

export const defenseSection = {
  id: "defense",
  title: "答辩准备与演示脚本",
  subtitle: "把项目从能跑，收束到能讲、能演示、能回答追问。",
  tags: ["答辩结构", "演示脚本", "常见追问", "风险边界"],
  slides: [
    {
      title: "10 分钟答辩结构",
      time: "答辩 1",
      points: [
        "先讲背景痛点，再讲解决方案，再讲架构与亮点，最后用案例演示收尾。",
        "不要把答辩做成代码流水账，要围绕用户问题和系统价值来组织表达。",
        "每一部分最好都有一句能被评审记住的话。",
      ],
      teacherNotes: ["让学生先学会结构表达，再补代码细节，会更稳。"],
      demoSteps: ["展示答辩目录", "给出每一段一句话总结"],
      practice: "让学生口述 60 秒项目介绍。",
    },
    {
      title: "功能演示顺序",
      time: "答辩 2",
      points: [
        "建议用一个拖欠工资案例贯穿咨询、诉求分析、证据建议和文书生成。",
        "每一步演示都要讲输入、处理中间层和最终输出，避免只点按钮。",
        "关键页面和接口最好准备截图或录屏备份，防止现场故障。",
      ],
      teacherNotes: ["把演示当成一条业务故事线，而不是若干零散功能。"],
      demoSteps: ["准备统一案例", "按咨询 -> 分析 -> 证据 -> 文书顺序演示"],
      practice: "让学生写出自己的 5 分钟演示脚本。",
    },
    {
      title: "常见追问怎么接",
      time: "答辩 3",
      points: [
        "为什么不用纯大模型而要用 RAG？因为法律场景更看重可控性和依据。",
        "RAG 的关键不是炫技，而是让回答能带着材料依据，方便解释和复核。",
        "系统不能替代律师，只能帮助整理信息、提示风险、生成初稿和辅助展示。",
      ],
      teacherNotes: ["训练学生回答边界，比一味夸大能力更容易获得信任。"],
      demoSteps: ["模拟评审追问", "按问题 -> 原因 -> 边界 -> 后续扩展回答", "展示 rag.py 说明依据如何进入回答"],
      practice: "每组准备 3 个高频问答并互相追问。",
    },
  ],
  codeRefs: [
    ["backend/app/plugin/module_ai/chat/rag.py", "解释为什么系统回答不是纯模型裸答。"],
    ["backend/app/plugin/module_ai/chat/service.py", "解释业务编排和会话保存。"],
    ["backend/app/core/dependencies.py", "解释登录用户和权限边界。"],
  ],
  tasks: ["写 60 秒项目介绍", "排练 5 分钟演示", "准备 3 个常见问答", "明确系统边界表述"],
};

[aiBuildSection, techMapSection, defenseSection].forEach((section) => {
  section.slides.forEach((slide) => {
    const enhancement = slideEnhancements[slide.title] || {};
    slide.talkTrack ||= enhancement.talkTrack || ["用一个完整案例把这一页串起来讲，避免只罗列概念。"];
    slide.quickQuestions ||= enhancement.quickQuestions || ["这一页和最终答辩有什么关系？"];
    slide.rescueTips ||= enhancement.rescueTips || teachingPlaybook.rescueTips.slice(0, 1);
    slide.keyTakeaway ||= enhancement.keyTakeaway || buildSlideTakeaway(section, slide);
    slide.classroomFlow ||= enhancement.classroomFlow || buildClassroomFlow(section, slide);
    slide.visual ||= enhancement.visual || buildVisual(section, slide);
    slide.deepDive ||= enhancement.deepDive || buildDeepDive(section, slide);
  });
});

polishAllCoursewareCopy([aiBuildSection, techMapSection, defenseSection]);

export const sectionMap = {
  overview: overviewSection,
  "build-lab": aiBuildSection,
  program: programSection,
  "tech-map": techMapSection,
  defense: defenseSection,
};

