# AI 劳动仲裁实训资料入口

本入口用于四天实训备课、授课和资料查找。当前项目已有后端骨架，课堂重点是：**按真实接口对齐前端页面，按业务链路讲清 AI/RAG、证据和文书，不改骨架代码作为主线**。

## 1. 课堂投屏入口

课堂主课件：

`courseware/index.html`

启动课件：

```powershell
[Console]::InputEncoding=[Console]::OutputEncoding=[System.Text.UTF8Encoding]::new()
python -m http.server 8765 -d courseware
```

浏览器打开：

`http://127.0.0.1:8765/index.html`

## 2. 推荐阅读顺序

1. `docs/ai-arbitration-training/完整四天授课执行脚本.md`  
   讲师执行主脚本：每天讲什么、演示什么、学生做什么、如何救场。

2. `docs/ai-arbitration-training/课程总纲-任务流程-功能阶段表.md`  
   控制四天范围、每日产出、功能阶段和最终验收。

3. `docs/ai-arbitration-training/四天实训AI提示词库.md`  
   四天每一步可用的 AI 提示词，包括前端对齐后端接口、RAG、证据分析、文书生成、联调验收和答辩提示词。

4. `docs/ai-arbitration-training/文档清单和使用指南.md`  
   全部资料说明和使用建议。

5. `docs/ai-arbitration-training/Day1-知识点与扩展整理.md`  
   Day1 知识点、技术关键词、扩展讲法和验收清单。

## 3. 四天主演讲稿

- `docs/ai-arbitration-training/Day1-环境搭建与AI基础-演讲稿.md`
- `docs/ai-arbitration-training/Day2-RAG检索与提示词工程-演讲稿.md`
- `docs/ai-arbitration-training/Day3-证据管理与文书生成-演讲稿.md`
- `docs/ai-arbitration-training/Day4-安全认证与项目总结-演讲稿.md`

这四个文件已补充 `讲师增强版` 模块，可作为现场话术、案例引导、互动问题和课堂验收参考。

## 4. 当前讲课顺序

```text
Day1：项目认知、环境搭建、登录使用、接口文档、AI/RAG 基础、知识库检索
Day2：RAG 检索质量、Prompt 工程、聊天页面、WebSocket/非流式问答
Day3：证据链、文件材料、证据分析、文书草稿、人工复核
Day4：JWT/权限原理、全链路联调、项目答辩、最终验收
```

登录拆分口径：

- Day1 讲“怎么登录、怎么进入系统、怎么在 `/docs` 授权”。
- Day4 讲“JWT、Token、权限、数据隔离和安全风险”。

## 5. 前端对齐后端接口口径

制作前端界面前，先查真实接口和已有 API 封装：

```text
frontend/web/src/api/module_ai/chat.ts
frontend/web/src/api/module_ai/knowledge.ts
```

AI 模块当前核心接口：

```text
/ai/chat/list
/ai/chat/create
/ai/chat/ai-chat
/ai/chat/detail/{session_id}
/ai/chat/model-config
/ai/chat/ws
/ai/knowledge/list
/ai/knowledge/create
/ai/knowledge/document/upload
/ai/knowledge/document/{id}/reindex
/ai/knowledge/retrieval/test
```

前端页面原则：

- 有真实后端接口的功能，必须调用真实接口。
- 没有后端接口的功能，只能标注“待接入”或做设计演示，不能伪造成已联调。
- 页面里不要散写 URL，优先使用 `src/api/...` 的封装。

## 6. 讲课口径

- 以 `courseware/index.html` 为课堂投屏主线。
- `完整四天授课执行脚本.md` 是讲师执行依据。
- `四天实训AI提示词库.md` 是 AI 协作、前端生成、业务 Prompt 和验收 Prompt 的统一入口。
- 演讲稿用于备课、补充解释和救场，不建议全程投屏朗读。
- Day4 的第三方登录、密码安全、接口限流是扩展了解，不作为学生必做主线。
- AI/RAG 讲解围绕当前骨架的 `backend/app/plugin/module_ai/*` 和 `frontend/web/src/api/module_ai/*` 展开。
