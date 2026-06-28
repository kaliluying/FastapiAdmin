# 使用 uv 管理 当前骨架项目依赖

---

## 📦 什么是 uv？

**uv** 是由 Astral 开发的超快速 Python 包管理器，用 Rust 编写，是 pip 和 pip-tools 的替代品。

### uv 的优势

✅ **极速安装**：比 pip 快 10-100 倍  
✅ **统一工具**：替代 pip、pip-tools、virtualenv  
✅ **自动锁定**：自动生成 uv.lock 文件  
✅ **兼容性好**：完全兼容 requirements.txt  
✅ **现代化**：支持 pyproject.toml

### 性能对比

```
安装 156 个依赖包：
- pip: 45 秒
- uv:  3 秒  ← 快 15 倍！
```

---

## 🚀 安装 uv

### Windows

```powershell
# 方法 1：使用 PowerShell（推荐）
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# 方法 2：使用 pip
pip install uv
```

### macOS / Linux

```bash
# 方法 1：使用 curl（推荐）
curl -LsSf https://astral.sh/uv/install.sh | sh

# 方法 2：使用 pip
pip install uv
```

### 验证安装

```bash
uv --version
# 输出：uv 0.4.x
```

---

## 🔧 使用 uv 管理项目

### 1. 创建虚拟环境

```bash
# 进入项目目录
cd FastapiAdmin-official-web-migration

# 创建虚拟环境（自动使用项目中的 Python 版本）
uv venv

# 或指定 Python 版本
uv venv --python 3.12

# 激活虚拟环境
# Windows:
.venv\Scripts\activate

# macOS/Linux:
source .venv/bin/activate
```

### 2. 安装依赖

```bash
# 直接安装单个包
uv add fastapi

# 安装开发依赖
uv add --dev pytest

# 从 requirements.txt 安装（兼容旧项目）
uv pip install -r requirements.txt

# 从 pyproject.toml 安装（推荐）
uv sync
```

### 3. 同步依赖（推荐，官方方式）

```bash
# 使用 uv sync 同步 pyproject.toml 中的依赖
uv sync

# 这会：
# - 读取 pyproject.toml
# - 安装所有需要的包
# - 生成 uv.lock 锁定文件
# - 确保环境完全一致

# 仅同步生产依赖（不包括开发依赖）
uv sync --no-dev
```

### 4. 锁定文件（自动生成）

```bash
# uv sync 会自动生成 uv.lock
# 无需手动运行命令

# 如果只想更新 lock 文件而不安装
uv lock
```

### 5. 添加和移除依赖

```bash
# 添加依赖（自动写入 pyproject.toml）
uv add langchain

# 添加特定版本
uv add "fastapi>=0.110.0"

# 添加开发依赖
uv add --dev pytest black ruff

# 移除依赖
uv remove langchain

# 升级依赖
uv lock --upgrade-package fastapi
```

---

## 📝 当前骨架项目实战

### 场景 1：首次安装项目（现代化方式）

```bash
# 1. 克隆项目
git clone https://github.com/your-repo/当前骨架项目.git
cd FastapiAdmin-official-web-migration

# 2. 初始化项目（创建虚拟环境 + 安装依赖）
uv sync

# 就这么简单！uv 会：
# - 读取 pyproject.toml
# - 创建虚拟环境（如果不存在）
# - 安装所有依赖
# - 生成 uv.lock 锁定版本

# 总耗时：约 5-10 秒
```

### 场景 1B：兼容旧项目（使用 requirements.txt）

```bash
# 如果项目还没有 pyproject.toml，只有 requirements.txt

# 1. 克隆项目
git clone https://github.com/your-repo/当前骨架项目.git
cd FastapiAdmin-official-web-migration

# 2. 创建虚拟环境
uv venv

# 3. 激活虚拟环境
source .venv/bin/activate  # macOS/Linux
.venv\Scripts\activate     # Windows

# 4. 安装依赖
uv pip install -r requirements.txt

# 5. （可选）转换为 pyproject.toml
# 手动创建 pyproject.toml，然后运行
uv sync
```

### 场景 2：添加新依赖（官方方式）

```bash
# 1. 添加新包（自动更新 pyproject.toml 和 uv.lock）
uv add redis

# 2. 添加特定版本
uv add "redis>=5.0.0"

# 3. 添加开发依赖
uv add --dev pytest

# 4. 提交到 Git
git add pyproject.toml uv.lock
git commit -m "添加 redis 依赖"
```

### 场景 2B：添加依赖（兼容方式）

```bash
# 如果使用 requirements.txt

# 1. 手动添加到 requirements.txt
echo "redis>=5.0.0" >> requirements.txt

# 2. 安装
uv pip install redis

# 3. 导出（可选）
uv pip freeze > requirements.txt

# 4. 提交
git add requirements.txt
git commit -m "添加 redis 依赖"
```

### 场景 3：团队协作同步依赖（官方方式）

```bash
# 拉取最新代码
git pull

# 同步依赖（基于 uv.lock）
uv sync

# 完成！环境已同步，版本完全一致
```

### 场景 3B：团队协作（兼容方式）

```bash
# 拉取最新代码
git pull

# 安装新依赖
uv pip install -r requirements.txt
```

### 场景 4：运行 Python 脚本

```bash
# 使用 uv run 直接运行（自动使用项目环境）
uv run python main.py

# 或运行特定命令
uv run pytest
uv run python -m pytest

# 好处：
# - 无需手动激活虚拟环境
# - 自动使用项目的 Python 和依赖
```

### 场景 5：清理和重建环境

```bash
# 删除虚拟环境
rm -rf .venv  # Linux/macOS
Remove-Item -Recurse -Force .venv  # Windows

# 重新创建并安装（一条命令）
uv sync
```

---

## 🔄 从 pip 迁移到 uv

### 迁移步骤

**Step 1：安装 uv**

```bash
pip install uv
```

**Step 2：验证现有依赖**

```bash
# 查看当前环境的包
pip list

# 导出当前依赖
pip freeze > requirements.txt
```

**Step 3：创建新环境并安装**

```bash
# 创建虚拟环境
uv venv

# 激活环境
.venv\Scripts\activate

# 使用 uv 安装
uv pip install -r requirements.txt
```

**Step 4：验证安装**

```bash
# 检查包列表
uv pip list

# 运行项目测试
python main.py run
```

**Step 5：更新文档**

更新项目 README.md，将安装命令从 pip 改为 uv。

---

## 📊 uv vs pip 命令对照表

### 官方推荐方式（使用 pyproject.toml）

| 操作 | pip 命令 | uv 命令 |
|------|---------|---------|
| 初始化项目 | `python -m venv .venv && pip install -r requirements.txt` | `uv sync` |
| 创建虚拟环境 | `python -m venv .venv` | `uv venv` |
| 添加包 | `pip install package && pip freeze > requirements.txt` | `uv add package` |
| 添加开发包 | 手动管理 | `uv add --dev package` |
| 移除包 | `pip uninstall package` | `uv remove package` |
| 升级包 | `pip install --upgrade package` | `uv lock --upgrade-package package` |
| 同步环境 | ❌ 不支持 | `uv sync` |
| 列出包 | `pip list` | `uv pip list` |
| 运行脚本 | `python script.py` | `uv run python script.py` |
| 生成锁文件 | `pip freeze > requirements.txt` | `uv lock`（自动） |

### 兼容方式（使用 requirements.txt）

| 操作 | pip 命令 | uv 命令 |
|------|---------|---------|
| 安装包 | `pip install package` | `uv pip install package` |
| 卸载包 | `pip uninstall package` | `uv pip uninstall package` |
| 安装依赖 | `pip install -r requirements.txt` | `uv pip install -r requirements.txt` |
| 导出依赖 | `pip freeze > requirements.txt` | `uv pip freeze > requirements.txt` |
| 升级包 | `pip install --upgrade package` | `uv pip install --upgrade package` |

**推荐使用官方方式**：使用 `pyproject.toml` + `uv.lock` 管理依赖，享受现代化的依赖管理体验。

---

## 💡 最佳实践

### 1. 使用 uv.lock 锁定版本

```bash
# 生成锁定文件
uv pip compile requirements.txt -o uv.lock

# 使用锁定文件安装（确保团队环境一致）
uv pip sync uv.lock
```

### 2. 分离开发和生产依赖

```
requirements.txt           # 生产依赖
requirements-dev.txt       # 开发依赖（测试、格式化等）
```

```bash
# 安装生产依赖
uv pip install -r requirements.txt

# 安装开发依赖
uv pip install -r requirements-dev.txt
```

### 3. 使用 pyproject.toml（现代化）

```toml
# pyproject.toml
[project]
name = "当前骨架项目"
version = "1.0.0"
requires-python = ">=3.12"
dependencies = [
    "fastapi[standard]>=0.135.1",
    "langchain==1.2.0",
    "chromadb>=1.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=9.0.2",
    "black>=24.0.0",
    "ruff>=0.5.0",
]
```

```bash
# 安装项目
uv pip install -e .

# 安装开发依赖
uv pip install -e ".[dev]"
```

### 4. CI/CD 集成

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install uv
        run: curl -LsSf https://astral.sh/uv/install.sh | sh
      
      - name: Install dependencies
        run: uv pip install -r requirements.txt
      
      - name: Run tests
        run: pytest
```

---

## 🐛 常见问题

### Q1: uv 安装后找不到命令

**原因**：环境变量未配置

**解决**：
```bash
# Windows：添加到 PATH
$env:Path += ";$env:USERPROFILE\.cargo\bin"

# macOS/Linux：添加到 .bashrc 或 .zshrc
export PATH="$HOME/.cargo/bin:$PATH"
```

### Q2: uv pip install 速度还是慢

**原因**：可能使用了国外源

**解决**：配置国内镜像
```bash
# 临时使用清华源
uv pip install -r requirements.txt --index-url https://pypi.tuna.tsinghua.edu.cn/simple

# 永久配置（pip 配置文件）
# Windows: %APPDATA%\pip\pip.ini
# macOS/Linux: ~/.pip/pip.conf
[global]
index-url = https://pypi.tuna.tsinghua.edu.cn/simple
```

### Q3: 与 pip 安装的包冲突

**原因**：系统和虚拟环境混用

**解决**：
```bash
# 确保在虚拟环境中
which python  # Linux/macOS
where python  # Windows

# 清理并重建虚拟环境
rm -rf .venv
uv venv
uv pip install -r requirements.txt
```

### Q4: uv venv 创建失败

**原因**：Python 版本问题

**解决**：
```bash
# 指定 Python 版本
uv venv --python 3.12

# 或使用系统 Python
uv venv --python python3.12
```

---

## 📚 参考资源

- **uv 官方文档**: https://docs.astral.sh/uv/
- **GitHub 仓库**: https://github.com/astral-sh/uv
- **性能基准测试**: https://github.com/astral-sh/uv#benchmarks

---

## 🎯 总结

使用 uv 管理 当前骨架项目的优势：

✅ **快速安装**：依赖安装时间从分钟级降至秒级  
✅ **环境一致**：uv pip sync 确保团队环境完全一致  
✅ **现代化**：支持 pyproject.toml，与 Python 生态同步  
✅ **易于使用**：命令与 pip 完全兼容，学习成本低  

**建议**：
- ✅ 新项目：直接使用 uv
- ✅ 老项目：逐步迁移，先在开发环境试用
- ✅ 团队协作：统一使用 uv pip sync 同步环境
- ✅ CI/CD：集成 uv 加速构建流程

---

**更新日期**: 2026-06-13  
**适用版本**: uv 0.4.x

