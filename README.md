# 快猫店员培训考核系统

基于 Next.js 16 + Supabase + Prisma 7 构建的零售门店员工培训与考核管理平台。

## 功能模块

- **管理员端**：门店管理、店员管理、培训标准、排班、考核发布与评分、考核报告、数据概览
- **店员端**：每日打卡、培训学习、查看考核结果、个人信息与密码修改

## 技术栈

- Next.js 16.2.4（App Router + Turbopack）
- Supabase Auth（用户认证）
- Prisma 7.7.0 + `@prisma/adapter-pg`（ORM，PgBouncer 兼容）
- Tailwind CSS v4 + shadcn/ui
- 部署：Vercel

---

## 本地开发

### 1. 克隆项目

```bash
git clone <repo-url>
cd kmall
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`，填入真实值：

```bash
cp .env.example .env.local
```

需要填写：
- `DATABASE_URL` / `DIRECT_URL`：Supabase 项目的 Postgres 连接串（Project Settings → Database → Connection string → URI）
- `NEXT_PUBLIC_SUPABASE_URL`：Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`：匿名密钥
- `SUPABASE_SERVICE_ROLE_KEY`：服务角色密钥（Project Settings → API）

### 3. 初始化数据库

```bash
# 同步 Schema 到数据库（首次或 Schema 变更后）
pnpm prisma migrate deploy

# 或开发模式（会生成迁移文件）
pnpm prisma migrate dev
```

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)

---

## 部署到 Vercel

### 1. 推送代码到 GitHub

```bash
git push origin main
```

### 2. 在 Vercel 导入项目

1. 进入 [vercel.com/new](https://vercel.com/new)，选择你的 GitHub 仓库
2. Framework Preset 选 **Next.js**（自动检测）

### 3. 配置环境变量

在 Vercel 项目的 **Settings → Environment Variables** 中，逐一添加 `.env.example` 中的所有变量（填入真实值）。

> `NEXT_PUBLIC_` 前缀的变量会暴露在客户端，其余仅在服务端可用。

### 4. 运行数据库迁移

部署后在本地执行（连接生产数据库）：

```bash
DATABASE_URL="<生产连接串>" pnpm prisma migrate deploy
```

或在 Vercel 的 **Deployments → 函数日志** 中确认迁移状态。

### 5. 部署

Vercel 会在每次 `git push` 后自动触发构建和部署。首次点击 **Deploy** 按钮完成初始部署。

---

## 目录结构

```
app/
  (admin)/admin/     管理员页面（dashboard、stores、staff、standards、schedules、exams、reports）
  (staff)/staff/     店员页面（dashboard、training、exam、profile）
  login/             登录页
components/
  admin/             管理员侧边栏等
  staff/             店员底部导航等
  ui/                shadcn/ui 组件
lib/
  prisma.ts          Prisma 客户端（adapter-pg）
  supabase/          Supabase 客户端（client/server/admin）
prisma/
  schema.prisma      数据模型
  migrations/        迁移记录
proxy.ts             Next.js 16 路由守卫（替代 middleware.ts）
```
