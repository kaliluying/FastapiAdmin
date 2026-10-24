# FastCore 文档目录

FastCore 是单组织企业后端项目骨架，配套管理端并内置 AI 能力。按下面的入口阅读；运行事实以当前源码、依赖声明和有效环境配置为准。

## 开始使用与开发

| 文档                                                            | 内容                                         |
| --------------------------------------------------------------- | -------------------------------------------- |
| [项目介绍与快速开始](../README.md) / [English](../README.en.md) | 项目定位、能力和最短启动步骤                 |
| [后端说明](../backend/README.md)                                | 配置、开发启动、生产初始化和迁移             |
| [管理端说明](../frontend/README.md)                             | 环境配置、路由与构建                         |
| [架构与开发指南](ARCHITECTURE_AND_DEVELOPMENT.md)               | 模块边界、权限链路、数据归属与知识任务恢复   |
| [模块增删改指南](MODULE_DEVELOPMENT.md) | 显式注册、字段修改、功能裁剪与依赖分离 |
| [业务模块生成器](MODULE_GENERATOR.md) | CLI 预览、安全写入、前后端 CRUD、迁移和测试 |
| [骨架增删改验收](SKELETON_ACCEPTANCE.md) | 隔离增改、物理裁剪、独立走查与验证边界 |
| [标准模块模板：分类管理](STANDARD_MODULE_TEMPLATE.md)           | 新业务模块从数据库到页面的开发与验收路径     |
| [测试与验收](TESTING.md)                                        | 单测、静态检查、隔离浏览器和真实依赖验收边界 |
| [开发阶段 Loop](DEVELOPMENT_LOOP.md)                            | 新功能、测试修复、独立验证和持续开发的停止条件 |

## AI 与运维

| 文档                                                  | 内容                                 |
| ----------------------------------------------------- | ------------------------------------ |
| [知识库文档检查与维护](DOCUMENT_MANAGEMENT.md)        | 文档状态、版本编辑、重建、解析与 OCR |
| [AI 用量与模型能力验证](AI_USAGE_AND_MODEL_CHECKS.md) | 用量账本、调用额度与手动能力检查     |
| [AI 对话流协议](AI_CHAT_STREAMING.md) | SSE 请求、取消、持久化与验收边界 |
| [回答反馈与检索质量评测](AI_QUALITY.md)               | 反馈闭环、数据集、指标与历史比较     |
| [AI 运行日志分析](AI_RUNTIME_LOG_ANALYSIS.md)         | 日志权限、工具调用、追问与证据安全   |
| [数据备份与恢复](BACKUP_AND_RESTORE.md)               | 离线备份、完整性检查和数据库恢复演练 |
| [FastCore 品牌迁移](BRAND_MIGRATION.md)               | 数据库、Redis、日志和本地目录的改名顺序与验收 |

## 视觉与协作

| 文档                                                                         | 内容                               |
| ---------------------------------------------------------------------------- | ---------------------------------- |
| [管理端样式说明](../frontend/src/styles/README.md)                           | 样式入口与页面规范                 |
| [设计系统](../design-system/fastcore-quiet-operations/MASTER.md)         | 颜色、布局、交互和可访问性         |
| [首页设计记录](../design-system/fastcore-quiet-operations/pages/home.md) | 首页设计与当时的验收结果           |
| [项目协作规则](../AGENTS.md)                                                 | 修改范围、数据保护、验证与交付约束 |

## 历史与本地材料

[功能补齐记录](FEATURE_COMPLETION.md)和[UX 改进任务记录](UX_IMPROVEMENT_TASKS.md)保留原始时间、任务状态与验证证据。记录中的测试数量、提交状态和工具配置只对应当时的工作区，不替代当前使用说明或生产验收。

本地工作区可能还有 `backend/integration/README.md`（真实依赖验收）、`docs/backend-infra-and-app-assembly-review.md`（历史研究）、登录页设计稿或 `CLAUDE.md`。未提交材料不保证出现在新克隆中；使用前核对文件与依赖是否存在。

## 维护约定

根 README 保留定位与快速开始；子项目 README 维护各自命令；架构指南维护跨端调用链；专题文档维护用例、限制与验收方式。历史记录不改写成当前事实。名称与内部标识统一为 FastCore；数据库、Redis 前缀、日志和目录变更需在现有实例中完成迁移后再启用。
