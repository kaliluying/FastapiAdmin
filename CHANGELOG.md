# Changelog

## v3.1.0 (2026-05-23) — 多租户 SaaS 版

### 🏢 多租户 SaaS 改造

- **数据隔离**：共享数据库 + tenant_id 字段隔离，ORM 层自动过滤
- **租户生命周期**：创建 / 启用 / 禁用 / 删除 / 到期自动处理
- **租户选择**：登录后可选择/切换租户工作空间
- **用户-租户关联**：支持一个用户关联多个租户
- **超级管理员**：跨租户视角，可查看/管理所有租户数据

### 📊 P1 高级功能

- **租户配额管理**：max_users / max_roles / max_storage_mb / max_depts，超限 403
- **租户个性化配置**：企业名称 / Logo / 主题色 / 默认语言 / 登录背景图
- **租户菜单权限**：每个租户可分配不同的菜单可见范围
- **到期提醒**：30/7/1 天前自动通知，到期自动禁用

### 🔧 技术细节

- ContextVar 租户上下文（async 安全）
- TenantMiddleware 自动解析 JWT tenant_id
- SQLAlchemy `do_orm_execute` 事件全局注入过滤条件
- 新增表：sys_tenant / sys_user_tenant / sys_tenant_quota / sys_tenant_config / sys_tenant_menu
- 全部业务表新增 tenant_id 字段 + 索引
- 前端新增：租户选择页 / 配额管理 / 配置管理 / 菜单权限分配

### ✅ 测试覆盖

- 后端 pytest 2/2 通过
- 前后端联调 15/15 API 通过
- TypeScript 零错误
- ESLint + Prettier + Stylelint 零错误
- 前端构建成功

---

## v3.0.0 (2025-12) — Vue 3.5 + Tailwind v4

- Vue 3.5 迁移（defineModel / useSlots）
- Tailwind CSS v4 升级
- ESLint Flat Config + Stylelint 解耦
- 全局组件 Fa 前缀统一
- FaForm items 配置模式推广
