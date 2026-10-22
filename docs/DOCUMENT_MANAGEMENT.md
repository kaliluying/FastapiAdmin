# 知识库文档检查与维护

[文档目录](README.md) · [质量评测](AI_QUALITY.md) · [备份与恢复](BACKUP_AND_RESTORE.md)

文档列表的「查看内容」提供原文件下载、按分块编号排序的完整分块分页、全文纠错和文件替换。分块编号沿用检索引用的零基编号，正文不截断；读取、下载依照 `module_ai:document:query` 和现有数据范围，维护依照 `module_ai:document:create`，删除沿用 `module_ai:document:delete`。

## 维护与恢复

- 替换文件先保存到新的随机路径，再把待替换文件写入关系库；当前原文件与 SQL 分块保持不变。
- 复用现有持久化索引任务、租约和重试。新 Chroma/BM25 分块与关系库记录完成后，在同一数据库事务切换文件元信息与分块。失败时保留原文件、原分块和原索引；可以重新索引重试待替换文件，或提交另一个替换文件。
- 原文件清理路径也存入关系库；清理失败由既有后台恢复处理。待替换文件随文档删除一并清理，路径必须位于知识库受控目录，拒绝越界路径和指向目录外的符号链接。
- 全文纠错读取当前原文件提取的文字，保存时转换为 UTF-8 TXT，保留文档编号和知识库。不会保留 PDF/DOCX 排版，界面保存前明确确认。不提供历史版本系统；成功替换后旧原文件会清理。
- 文本在线编辑上限 2,000,000 字符；文件沿用 50 MB 上传限制。
- 需要部署增量迁移 `20261011_document_management`，只新增 `pending_file`、`file_cleanup_paths` 两个可空 JSON 列。生产执行迁移须按项目数据库规则确认目标。

设计参考 CodeVault 的 Staged Immutable Installation：适配其暂存、激活指针、旧内容保护和 reconciliation 不变量，复用本项目 SQL 租约与索引清理，不引入安装器或版本仓库。

## 解析与 OCR

DOCX 使用 python-docx 的段落/表格顺序迭代，表格每行以制表符分隔单元格；合并单元格不重复写入。聊天附件与知识库共享该解析器。

PDF 优先使用 pypdf 提取文本；无文本且含图片的页面使用本地 OCR，不发送到外部服务。生产容器或主机需要在 PATH 中提供：

- Poppler 的 `pdftoppm`
- Tesseract 的 `tesseract`
- Tesseract `chi_sim`、`eng` 语言包（有一个即可运行；中文资料应安装 `chi_sim`）

在 Debian/Ubuntu 的部署镜像可安装 `poppler-utils tesseract-ocr tesseract-ocr-chi-sim tesseract-ocr-eng`；macOS 可使用 Homebrew 的 Poppler、Tesseract 和语言包。应用不会自动安装工具。缺失工具或语言包时返回明确说明，不把空文本标记为成功。

每页渲染最长 60 秒，OCR 最长 60 秒，图像最长边 2400 像素；单个 PDF 最多 500 页、最多 50 个 OCR 页面，超过上限要求拆分。临时图片使用系统临时目录并自动清理。已有可提取文字的页面不识别其中图片；手写、复杂表格和低清扫描的识别准确度需要人工检查。

## 验证

```sh
cd backend
ENVIRONMENT=dev .venv/bin/pytest tests/plugin/module_ai/knowledge/test_document_management.py tests/plugin/module_ai/knowledge/test_document_processing.py tests/plugin/module_ai/knowledge/test_knowledge_recovery.py -q
cd ../frontend
corepack pnpm exec vitest run src/views/module_ai/document/DocumentInspector.spec.ts
corepack pnpm exec vue-tsc --noEmit --skipLibCheck
```

回归覆盖文件/分块原子切换、索引失败与重试、重启恢复、处理中冲突、路径穿越/符号链接、拒绝访问、DOCX 实际表格顺序、扫描 PDF 缺依赖和 OCR 调用边界。这些临时 SQLite/模拟索引检查不证明正式支持的 MySQL、真实供应商或扫描识别质量；实际浏览器与 OCR 验收证据另由任务交付记录说明。
