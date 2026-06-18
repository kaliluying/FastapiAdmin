# Admin

这是一个前后端分离的管理后台项目，包含 FastAPI 后端和 Vue 3 前端。

## 目录

```txt
backend/    后端服务
frontend/   前端应用
```

## 后端

```bash
cd backend
python main.py run --env=dev
```

常用命令：

```bash
python main.py revision --env=dev
python main.py upgrade --env=dev
```

## 前端

```bash
cd frontend
npm install
npm run dev
```

构建：

```bash
npm run build
```

## 说明

- 默认站点名称为 `Admin`。
- 默认静态资源来自后端本地 `/api/v1/static/image/`。
- 如已有数据库，请同步检查 `sys_param` 表中的站点名称、版权、文档和协议链接。
