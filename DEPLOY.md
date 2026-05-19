# 任务积分兑换应用 - 部署指南

## 快速部署到 GitHub Pages

本项目已内置 GitHub Actions 工作流（[deploy.yml](.github/workflows/deploy.yml)），会在推送到 `main` 分支后自动构建并发布 `dist/` 到 GitHub Pages。

### 步骤 1: 创建 GitHub 仓库

1. 访问 https://github.com 并登录
2. 点击右上角 **+** → **New repository**
3. 填写：
   - Repository name: `points-task-app`
   - 选择 **Public**
   - 不要勾选 "Initialize this repository with a README"
4. 点击 **Create repository**

### 步骤 2: 本地初始化并推送代码

在终端中执行以下命令：

```bash
# 进入项目目录
cd points-task-app

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit - 任务积分兑换应用"

# 添加远程仓库（请将下面的 URL 替换为你创建的仓库地址）
git remote add origin https://github.com/YOUR_USERNAME/points-task-app.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 步骤 3: 启用 GitHub Pages（GitHub Actions）

1. 在你的仓库页面，点击 **Settings**
2. 左侧菜单找到 **Pages**
3. 设置：
   - Source: **GitHub Actions**
4. 推送代码到 `main` 后，Actions 会自动运行并发布

### 步骤 4: 访问你的网站

网站地址: `https://YOUR_USERNAME.github.io/points-task-app`

---

## 自定义域名配置（可选）

如果你有自定义域名（例如 `qqcz.top`），建议使用根域名 + `www`：

1. 在 Pages 设置页面找到 **Custom domain**
2. 输入你的域名
3. 在你的域名服务商处添加 DNS 记录（GitHub Pages 官方 IP）：
   - `@`（根域名）A 记录 → `185.199.108.153`
   - `@`（根域名）A 记录 → `185.199.109.153`
   - `@`（根域名）A 记录 → `185.199.110.153`
   - `@`（根域名）A 记录 → `185.199.111.153`
   - `www` CNAME 记录 → `YOUR_USERNAME.github.io`
4. 建议勾选 **Enforce HTTPS**

说明：
- 本仓库已在 `public/CNAME` 中写入 `qqcz.top`，构建发布时会自动携带该域名配置

---

## 技术信息

- **构建输出目录**: `dist/`
- **依赖**: React 18 + TypeScript + Tailwind CSS
- **数据存储**: LocalStorage / Supabase / CloudBase（取决于页面实际使用的功能模块）
- **特点**: 前端静态站点，部署在任意静态托管平台（GitHub Pages / Vercel / Netlify 等）

---

## 常用命令

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

---

**注意**: 所有用户数据存储在浏览器的 LocalStorage 中，更换浏览器或清除缓存会导致数据丢失。
