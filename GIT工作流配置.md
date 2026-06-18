# Git 工作流配置完成 ✅

## 当前配置

### 远程仓库
- **origin**: `https://github.com/kaliluying/FastapiAdmin.git` (你的 fork)
- **upstream**: `https://github.com/zy7y/FastapiAdmin.git` (原作者仓库)

### 分支策略
- **main**: 保持与你的远程仓库同步，当前已包含你删除组件后的代码
- **custom-dev**: 你的定制开发分支（当前活跃分支）

## 📌 日常工作流程

### 1. 在定制分支上开发
```bash
# 确保在 custom-dev 分支
git checkout custom-dev

# 进行修改...
git add .
git commit -m "feat: 添加新功能"
git push origin custom-dev
```

### 2. 同步上游更新（推荐每周一次）
```bash
# 拉取上游最新代码
git fetch upstream

# 切换到 main 分支
git checkout main

# 合并上游的 master 分支到你的 main
git merge upstream/master

# 推送到你的远程仓库
git push origin main

# 切换回定制分支
git checkout custom-dev

# 将 main 的更新合并到定制分支
git merge main

# 如果有冲突（比如你删除的文件被上游修改了）
# 解决冲突，保留你的删除状态：
git rm <冲突文件>  # 如果你想保持删除
# 或者
git add <冲突文件> # 如果你想保留上游的修改

git commit -m "merge: 同步上游更新"
git push origin custom-dev
```

### 3. 使用 Rebase 保持历史整洁（可选）
```bash
# 如果你喜欢更整洁的提交历史
git checkout custom-dev
git rebase main

# 解决冲突后
git add .
git rebase --continue

# 强制推送（首次或有冲突时需要）
git push origin custom-dev --force-with-lease
```

## 🔍 常用命令

### 查看你的定制内容
```bash
# 查看与 main 分支的差异
git diff main..custom-dev

# 查看文件列表差异
git diff --name-status main..custom-dev
```

### 查看上游更新
```bash
# 拉取上游信息
git fetch upstream

# 查看上游有哪些新提交
git log HEAD..upstream/master --oneline

# 查看上游修改了哪些文件
git diff HEAD..upstream/master --name-status
```

### 选择性同步某个提交
```bash
# 只应用上游的某个特定提交
git cherry-pick <commit-hash>
```

## ⚠️ 注意事项

1. **main 分支保持纯净**：不要直接在 main 分支上开发，它只用于同步上游
2. **定期同步**：不要等太久才同步，避免大量冲突
3. **冲突处理**：当你删除的组件被上游修改时，选择保留删除状态
4. **备份重要修改**：重要功能完成后及时 push 到远程

## 🎯 删除组件记录

建议在 `删除记录.md` 中记录你删除了哪些组件，方便以后处理冲突：

```markdown
# 已删除的组件

## 后端模块
- [ ] 列出删除的后端模块

## 前端页面
- [ ] 列出删除的前端页面

## 删除原因
简要说明为什么删除这些组件
```

## 🚀 下一步

你现在可以：
1. 继续删除不需要的组件（在 custom-dev 分支）
2. 开发新功能（在 custom-dev 分支）
3. 定期同步上游更新（按照上面的流程）

如果需要帮助处理冲突或有其他问题，随时告诉我！
