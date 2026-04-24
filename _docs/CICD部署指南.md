# CI/CD 部署指南

> spirit-test 项目通过 GitHub + Netlify 实现自动化部署。每次 `git push` 代码，网站自动更新，无需手动操作。

---

## 快速链接

- **GitHub 仓库**：https://github.com/95b864s5s8-creator/spirit-test
- **正式网站**：https://soul-code.netlify.app
- **旧版**：仅存档于 GitHub，不上线

---

## 完整部署流程（首次设置）

### 第一阶段：本地 Git 初始化（已完成）

```bash
# 进入项目目录
cd /Users/yanchenwang/Downloads/spirit-test

# 初始化 Git 仓库（已完成）
git init

# 提交所有文件（已完成）
git add .
git commit -m "v1.0 - 测了吗 五行人格测试"
```

### 第二阶段：上传 GitHub

**Step 1**：在 GitHub 新建仓库
- 网址：https://github.com/new
- 仓库名：`spirit-test`
- ❌ 不要勾选 Add a README（保持空仓库）

**Step 2**：获取 Personal Access Token
- 网址：https://github.com/settings/tokens
- 点 **Generate new token (classic)**
- 名字随便填，勾选 **`repo`** 全选
- 生成后复制 Token

**Step 3**：推送代码（Token 替换为你的）

```bash
cd /Users/yanchenwang/Downloads/spirit-test

git remote add origin https://github.com/95b864s5s8-creator/spirit-test.git
git remote set-url origin https://95b864s5s8-creator:你的TOKEN@github.com/95b864s5s8-creator/spirit-test.git
git branch -M main
git push -u origin main
```

### 第三阶段：Netlify 自动部署

**Step 1**：登录 Netlify
- 网址：https://app.netlify.com
- 用 GitHub 账号登录

**Step 2**：导入项目
- 点 **Add new site** → **Import an existing project**
- 选 **GitHub** → 授权 → 选 `spirit-test` 仓库

**Step 3**：配置
- **Build command**：` `（留空）
- **Publish directory**：`/`（留空或填 `/`）
- 点 **Deploy site**

**Step 4**：等待上线
- 通常 30 秒内完成
- Netlify 会分配一个 `*.netlify.app` 域名

---

## 日常更新流程

以后修改代码后，只需三行命令：

```bash
cd /Users/yanchenwang/Downloads/spirit-test

git add .
git commit -m "描述这次改了什么"
git push
```

Netlify 会自动检测到 GitHub 有新代码，在后台自动拉取并更新网站。刷新页面即可看到最新版本。

---

## 版本说明

- **新版**（`index.html`）：正式上线，始终部署
- **旧版**（`index.旧版.html`）：仅在 GitHub 存档，不上线，供内部参考

---

## .gitignore 说明

已配置的忽略规则：

```
# 开发调试文件（不部署）
_dev/
*.log
*.tmp
*.pyc

# macOS 系统文件
.DS_Store
```

---

## 常见问题

**Q：推送后网站没更新？**
A：Netlify 通常 1-2 分钟内自动部署。检查 Netlify 仪表盘的 Deploy 日志。

**Q：想换自定义域名？**
A：Netlify → Site settings → Domain management → Add custom domain。

**Q：Netlify 免费版有流量限制吗？**
A：每月 100GB 带宽，个人使用足够。

---

*本文档创建于 2026-04-24*
