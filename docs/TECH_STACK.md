# 快猫店员培训考核系统 — 技术选型 TECH_STACK.md v1.0

> 基于：3-5名店员，1-3个门店，手机优先，快速上线

---

## 技术栈总览

| 层级 | 选型 | 版本 | 原因 |
|---|---|---|---|
| **前端框架** | Next.js | 15 (App Router) | 全栈一体，前后端同一仓库，Vercel 一键部署 |
| **UI 组件库** | shadcn/ui | latest | 组件齐全，样式用 CSS 变量可全局换色，手机端友好 |
| **样式** | Tailwind CSS | v4 | shadcn 内置，无需额外配置 |
| **数据库** | Supabase (PostgreSQL) | cloud free tier | 免费额度 500MB 够用几年，自带 Auth 和实时订阅 |
| **ORM** | Prisma | 6.x | 类型安全，schema 即文档，迁移简单 |
| **认证** | Supabase Auth | 内置 | 直接用 Supabase 自带，手机号登录/邮箱密码都支持，不需额外集成 Clerk |
| **部署** | Vercel | free tier | Next.js 官方部署平台，零配置，自动 HTTPS |
| **图片存储** | Supabase Storage | 内置 | 工作细则配图上传，免费 1GB |

---

## 目录结构（项目骨架）

```
fastcat-staff/
├── app/
│   ├── (auth)/
│   │   └── login/           # 登录页
│   ├── (staff)/             # 店员路由组
│   │   ├── dashboard/       # 首页：今日排班+任务
│   │   ├── guidelines/      # 工作细则
│   │   ├── standards/       # 考核标准
│   │   ├── my-tasks/        # 我的任务
│   │   └── my-performance/  # 我的绩效
│   ├── (admin)/             # 管理员路由组
│   │   ├── dashboard/       # 数据概览
│   │   ├── staff/           # 店员管理
│   │   ├── guidelines/      # 细则管理
│   │   ├── standards/       # 考核标准管理
│   │   ├── schedules/       # 排班管理
│   │   ├── tasks/           # 任务管理
│   │   ├── reviews/         # 考核打分
│   │   └── reports/         # 绩效报表
│   ├── api/                 # API Routes
│   └── layout.tsx
├── components/
│   ├── ui/                  # shadcn 组件
│   └── custom/              # 业务组件
├── lib/
│   ├── supabase.ts          # Supabase client
│   ├── prisma.ts            # Prisma client
│   └── auth.ts              # 认证工具函数
├── prisma/
│   └── schema.prisma        # 数据库模型
└── docs/                    # PRD / TECH_STACK / DATA_MODEL
```

---

## 关键技术决策说明

### 为什么不用 Clerk？
店员数量 3-5 人，Supabase Auth 完全够用，减少一个第三方依赖，部署更简单。

### 为什么用 Prisma 而不是 Drizzle？
Prisma 的 schema 文件可以直接当数据库文档看，方便你理解整个数据结构。初学者更友好。

### 手机端适配怎么做？
shadcn/ui 组件本身支持响应式，用 Tailwind 的 `sm:` / `md:` 断点控制布局。
登录页、首页、任务列表、考核结果这四个页面要重点保证手机体验。

### 考核三种（日/周/月）怎么区分？
数据库里 `Review` 表加一个 `period_type` 字段（daily / weekly / monthly），打分时选类型即可，不需要建三张表。

---

## 开发环境要求

```bash
node >= 20
pnpm >= 9
```

### 初始化命令
```bash
pnpm create next-app@latest fastcat-staff --typescript --tailwind --app
cd fastcat-staff
pnpm dlx shadcn@latest init
pnpm add @prisma/client prisma @supabase/supabase-js
pnpm add -D prisma
```

---

## 环境变量（.env.local）

```env
DATABASE_URL="postgresql://..."        # Supabase 连接串
DIRECT_URL="postgresql://..."         # Prisma 直连（bypass connection pooling）
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."       # 服务端用，不暴露给前端
```

---

*配套文件：PRD.md / DATA_MODEL.md*
