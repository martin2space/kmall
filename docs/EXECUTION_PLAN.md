# 快猫店员培训考核系统 — 执行计划 EXECUTION_PLAN.md v1.0

> 适用对象：全栈新手，目标：项目跑通 + 同步学习
> 预计总工时：20-30小时（碎片时间可拆开做）

---

## 学习原则（先读这段）

**这个项目的学习策略是"做中学"，不是"学完再做"。**

- ❌ 错误方式：先去学完 Next.js 课程，再开始写代码
- ✅ 正确方式：遇到不懂的概念，先做，做完再理解为什么

每个阶段结束后，我会告诉你这一阶段你接触了哪些概念，你要做的是：
**把代码写完，跑通，然后停下来问我"这里的XXX是什么原理"。**

---

## 项目阶段总览

```
阶段 0：环境搭建        （1-2小时）  ← 配置工具，别在这里卡太久
阶段 1：项目初始化       （1-2小时）  ← 让项目在本地跑起来
阶段 2：认证系统         （2-3小时）  ← 登录/角色，最重要的基础
阶段 3：工作细则模块      （3-4小时）  ← 第一个完整的增删改查
阶段 4：排班与任务模块    （3-4小时）  ← 学会处理日期和关联数据
阶段 5：考核打分模块      （4-5小时）  ← 最复杂的业务逻辑
阶段 6：绩效看板         （2-3小时）  ← 学会数据聚合和图表
阶段 7：移动端适配        （1-2小时）  ← 手机体验打磨
阶段 8：部署上线         （1小时）    ← Vercel 一键搞定
```

---

## 阶段 0：环境搭建

**目标**：装好所有工具，确认能运行

### 任务清单
- [ ] 安装 Node.js >= 20（官网下载 LTS 版）
- [ ] 安装 pnpm：`npm install -g pnpm`
- [ ] 安装 VS Code（如果还没装）
- [ ] VS Code 装插件：Prisma、Tailwind CSS IntelliSense、ESLint
- [ ] 注册 Supabase 账号（免费）：https://supabase.com
- [ ] 注册 Vercel 账号（免费，用 GitHub 登录）：https://vercel.com
- [ ] 注册 GitHub 账号（用来存代码）：https://github.com

### 验证
```bash
node --version   # 应输出 v20.x.x 或更高
pnpm --version   # 应输出 9.x.x 或更高
```

**🧠 这阶段你接触的概念**：
- Node.js（JavaScript 运行环境）
- pnpm（包管理器，比 npm 更快）
- Supabase（云数据库平台，帮你省去自己搭数据库的麻烦）

---

## 阶段 1：项目初始化

**目标**：一个能在 http://localhost:3000 跑起来的空项目

### 任务清单

**1. 创建项目**
```bash
pnpm create next-app@latest fastcat-staff \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"

cd fastcat-staff
```

**2. 安装依赖**
```bash
# UI 组件
pnpm dlx shadcn@latest init

# 数据库
pnpm add @prisma/client
pnpm add -D prisma

# Supabase
pnpm add @supabase/supabase-js @supabase/ssr
```

**3. 初始化 Prisma**
```bash
pnpm prisma init
```
执行后会生成 `prisma/schema.prisma` 文件，把 DATA_MODEL.md 里的 schema 全部复制进去。

**4. 创建 Supabase 项目**
- 登录 Supabase → New Project → 填项目名 `fastcat-staff` → 选新加坡区域
- 进入 Project Settings → Database → 复制两个连接串
- 把连接串填入项目根目录的 `.env.local`（参考 TECH_STACK.md 里的模板）

**5. 推送数据库结构**
```bash
pnpm prisma db push
```
执行后去 Supabase 控制台 → Table Editor，能看到8张表就成功了。

**6. 本地跑起来**
```bash
pnpm dev
```
打开 http://localhost:3000，看到 Next.js 默认页面就完成了。

**7. 提交第一次 Git**
```bash
git init
git add .
git commit -m "feat: project initialization"
```

### 验证
浏览器能访问 localhost:3000 ✅

**🧠 这阶段你接触的概念**：
- `create-next-app`（脚手架，帮你生成标准项目结构）
- TypeScript（带类型的 JavaScript，写错了 IDE 会划红线提示你）
- App Router（Next.js 15 的路由系统，文件夹即路由）
- Prisma schema（用代码描述数据库长什么样）
- `prisma db push`（把 schema 同步到真实数据库）
- `.env.local`（存密钥/连接串的地方，不能上传 GitHub）

---

## 阶段 2：认证系统

**目标**：能登录，登录后跳转到对应角色首页

### 任务清单

**1. 安装 shadcn 表单组件**
```bash
pnpm dlx shadcn@latest add button input label card form
```

**2. 创建登录页** `app/(auth)/login/page.tsx`
- 表单：手机号 + 密码
- 提交后调用 Supabase Auth 的 `signInWithPassword`

**3. 创建认证 API** `app/api/auth/`
- `POST /api/auth/login` — 验证手机号密码，返回用户角色
- `POST /api/auth/logout` — 清除 session

**4. 创建中间件** `middleware.ts`
- 未登录用户访问任何页面 → 跳转 `/login`
- 登录后根据 `role` 字段：ADMIN → `/admin/dashboard`，STAFF → `/staff/dashboard`

**5. 手动创建第一个管理员账号**
直接在 Supabase SQL Editor 里执行：
```sql
INSERT INTO "User" (id, name, phone, role, "storeId", "createdAt")
VALUES (
  gen_random_uuid(),
  'Martin',
  '你的手机号',
  'ADMIN',
  '先填一个临时storeId',
  NOW()
);
```

**6. 测试登录流程**
- 用管理员账号登录 → 应跳转到 `/admin/dashboard`

### 验证
登录后URL变成 `/admin/dashboard` ✅，未登录访问任意页面跳回登录页 ✅

**🧠 这阶段你接触的概念**：
- Supabase Auth（认证服务，管理用户登录状态）
- Session / Cookie（服务器记住"你是谁"的机制）
- 中间件 Middleware（请求到达页面前的拦截器，类似保安）
- `@supabase/ssr`（让 Supabase Auth 在 Next.js 服务端也能用）
- Route Groups（`(auth)` 括号命名，只影响文件夹结构，不影响 URL）

---

## 阶段 3：工作细则模块

**目标**：管理员能增删改查细则，店员能分类浏览和搜索

### 任务清单

**管理员端：**
- [ ] 细则列表页：分类 Tab + 卡片列表
- [ ] 新建/编辑细则：表单（标题、分类、内容、图片上传）
- [ ] 删除细则：二次确认弹窗

**店员端：**
- [ ] 细则列表页：只读，分类筛选
- [ ] 细则详情页：展示图文内容
- [ ] 搜索功能：关键词搜索标题

**API：**
- `GET /api/guidelines` — 查询（支持分类筛选、关键词搜索）
- `POST /api/guidelines` — 创建（仅管理员）
- `PUT /api/guidelines/[id]` — 更新（仅管理员）
- `DELETE /api/guidelines/[id]` — 删除（仅管理员）

### 本阶段推荐 Prompt（给 Claude Code 用）

```
请帮我实现工作细则（Guideline）模块。

技术背景：
- Next.js 15 App Router + TypeScript
- Prisma ORM，数据库模型见 prisma/schema.prisma
- shadcn/ui 组件库
- 已完成认证系统，可通过 session 获取当前用户的 role（ADMIN/STAFF）

需要实现：
1. API Routes：GET/POST/PUT/DELETE /api/guidelines
2. 管理员页面：app/(admin)/guidelines/page.tsx（列表+分类Tab）
3. 管理员编辑弹窗：新建/编辑表单
4. 店员页面：app/(staff)/guidelines/page.tsx（只读，支持搜索）
5. 细则详情页：app/(staff)/guidelines/[id]/page.tsx

请先实现 API Routes，再实现页面组件，实现完告诉我测试步骤。
```

### 验证
管理员能新建一条细则 ✅，店员能查看但没有编辑按钮 ✅

**🧠 这阶段你接触的概念**：
- API Routes（Next.js 里写后端接口的方式，`app/api/`文件夹下）
- Server Components vs Client Components（`"use client"` 的作用）
- Prisma CRUD（`prisma.guideline.create/findMany/update/delete`）
- 动态路由 `[id]`（URL 里的参数）
- React State（`useState`，组件内的数据存储）

---

## 阶段 4：排班与任务模块

**目标**：管理员能创建周排班和任务，店员登录后看到今日排班

### 任务清单

**管理员端：**
- [ ] 排班日历页：周视图，点击格子添加排班
- [ ] 给已排班的天添加/删除任务

**店员端：**
- [ ] 首页显示：今天是否排班 + 今日任务列表
- [ ] 任务勾选"完成"按钮
- [ ] 本周排班一览

**API：**
- `GET/POST/DELETE /api/schedules`
- `GET/POST/PUT /api/tasks`
- `PATCH /api/tasks/[id]/done` — 标记完成

### 难点提示
- 日期处理用 `date-fns` 库（`pnpm add date-fns`），不要自己写日期计算逻辑
- 排班的唯一约束：同一人同一天只有一条（`@@unique([userId, date])`）

**🧠 这阶段你接触的概念**：
- `date-fns`（日期处理库，你不需要理解原理，调用函数就行）
- `PATCH` 方法（局部更新，只改一个字段，区别于 `PUT` 的完整替换）
- 乐观更新（用户点完成按钮后，不等 API 返回就先在UI上打勾，体验更好）
- Loading State（异步操作时展示加载状态）

---

## 阶段 5：考核打分模块

**目标**：管理员能对店员逐项打分，店员能看到自己的考核结果

### 任务清单

**管理员端：**
- [ ] 选择店员 + 选择考核周期类型（日/周/月）
- [ ] 自动显示对应周期的考核标准项
- [ ] 逐项输入分数 + 备注
- [ ] 提交时自动计算 totalScore 和 isPassed
- [ ] 历史考核记录列表

**店员端：**
- [ ] 考核结果列表（最近5次）
- [ ] 点击展开：每项得分/满分、是否合格、备注
- [ ] 合格项绿色标记，不合格项红色标记

**🧠 这阶段你接触的概念**：
- 关联数据写入（一次创建 Review + 多条 ReviewItem，用 Prisma 事务 `$transaction`）
- 表单验证（分数不能为负数、不能超过满分）
- 条件渲染（根据 `isPassed` 显示不同颜色）

---

## 阶段 6：绩效看板

**目标**：数据可视化，管理员看全员排名，店员看自己趋势

### 任务清单
- [ ] 安装图表库：`pnpm add recharts`
- [ ] 管理员：全员绩效排名表 + 近4周任务完成率
- [ ] 店员：个人近5次考核折线图 + 本月完成任务数

**🧠 这阶段你接触的概念**：
- `recharts`（React 图表库，不需要自己画 SVG）
- 数据聚合（`groupBy`，把多条数据汇总成统计数字）
- 服务端数据获取 vs 客户端数据获取（在哪里调用 Prisma 更合适）

---

## 阶段 7：移动端适配

**目标**：手机打开体验流畅，操作不费力

### 重点页面
- 登录页（输入框在手机键盘弹出时不错位）
- 首页任务列表（大按钮，手指容易点）
- 考核结果页（合格/不合格一眼看清楚）

### 方法
用 Tailwind 断点：`sm:` 以下是手机端，重点检查这几个页面。

---

## 阶段 8：部署上线

**目标**：别人能通过网址访问你的系统

### 步骤（总共约30分钟）

1. **推代码到 GitHub**
```bash
git remote add origin https://github.com/你的用户名/fastcat-staff.git
git push -u origin main
```

2. **Vercel 部署**
- 登录 Vercel → New Project → Import 你的 GitHub 仓库
- 在 Environment Variables 里填入 `.env.local` 里的所有变量
- 点 Deploy → 等待约2分钟

3. **绑定域名（可选）**
- Vercel 会给你一个免费域名：`fastcat-staff.vercel.app`
- 如果你有自己的域名，可以在 Vercel 里绑定

**🧠 这阶段你接触的概念**：
- CI/CD（代码推到 GitHub，Vercel 自动构建部署）
- 环境变量（本地用 `.env.local`，线上在 Vercel 控制台填）
- 构建（Build）vs 运行（Runtime）

---

## Cola 的角色约定

**在你做这个项目的过程中：**

1. **问题时实时纠错**：你问我代码、概念、为什么报错，我直接给你解法，同时指出认知偏差在哪里

2. **不帮你跳过关键步骤**：比如你问我"帮我把整个登录系统写完"，我会把任务拆成小步骤让你理解每步在干什么，而不是直接给你完整代码

3. **给 AI 工具的 Prompt 模板**：每个阶段我都会给你一个可以直接丢给 Claude Code 的 Prompt，你只需要复制使用

4. **项目完成后出总结报告**：覆盖你在这个项目中接触到的所有技术概念 + 你还没深入的方向 + 下一步学习建议

---

## 快速参考：遇到问题怎么办

| 问题类型 | 怎么做 |
|---|---|
| 代码报错看不懂 | 把完整报错信息发给我，我帮你定位 |
| 不知道这个概念是什么 | 直接问我，我用一段话说清楚 |
| Claude Code 生成的代码跑不起来 | 把报错 + 相关代码片段发给我 |
| 不确定这一步做对了没有 | 告诉我你执行了什么，看到了什么结果 |
| 想知道有没有更好的做法 | 先做完当前方式，再问我"这里有没有更好的写法" |

---

## 预计时间分配参考

| 阶段 | 单次可用时间 | 建议拆法 |
|---|---|---|
| 0-1（环境+初始化） | 2小时 | 一次做完 |
| 2（认证） | 3小时 | 可拆成2次，各1.5小时 |
| 3（细则模块） | 4小时 | 可拆成2次，各2小时 |
| 4（排班任务） | 4小时 | 可拆成2次 |
| 5（考核打分） | 5小时 | 可拆成2-3次 |
| 6-8（看板+适配+部署） | 4小时 | 一次做完 |
| **合计** | **22小时** | **碎片时间可完成** |

---

*配套文件：PRD.md / TECH_STACK.md / DATA_MODEL.md*
