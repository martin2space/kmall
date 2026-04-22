# 快猫店员培训考核系统 — 数据模型 DATA_MODEL.md v1.0

> 基于 PostgreSQL（Supabase），使用 Prisma ORM

---

## 实体关系总览

```
Store (门店)
  └── User (用户：管理员 / 店员)
        ├── Schedule (排班)
        │     └── Task (当日任务)
        └── Review (考核记录)
              └── ReviewItem (考核明细，逐项打分)

Guideline (工作细则)  →  独立，与门店关联
Standard (考核标准项) →  独立，与门店关联
```

---

## 数据库表结构（Prisma Schema）

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ─── 门店 ───────────────────────────────────────────

model Store {
  id         String   @id @default(cuid())
  name       String   // 如：快猫清远店
  city       String   // 清远
  address    String?
  createdAt  DateTime @default(now())

  users      User[]
  guidelines Guideline[]
  standards  Standard[]
}

// ─── 用户（管理员 + 店员） ───────────────────────────

model User {
  id          String    @id @default(cuid())
  name        String
  phone       String    @unique
  role        Role      @default(STAFF)  // ADMIN | STAFF
  storeId     String
  store       Store     @relation(fields: [storeId], references: [id])
  isActive    Boolean   @default(true)   // 离职/停用
  createdAt   DateTime  @default(now())

  schedules   Schedule[]
  reviews     Review[]   // 被考核的记录
  reviewsDone Review[]   @relation("ReviewedBy")  // 打分的记录（管理员）
}

enum Role {
  ADMIN
  STAFF
}

// ─── 工作细则 ────────────────────────────────────────

model Guideline {
  id          String   @id @default(cuid())
  storeId     String
  store       Store    @relation(fields: [storeId], references: [id])
  category    String   // 开店流程 | 接待规范 | 商品陈列 | 收银操作 | 闭店流程
  title       String   // 细则标题
  content     String   // 正文（Markdown 或纯文本）
  imageUrls   String[] // 配图 URL 数组
  order       Int      @default(0)  // 同分类内排序
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ─── 考核标准 ────────────────────────────────────────

model Standard {
  id           String   @id @default(cuid())
  storeId      String
  store        Store    @relation(fields: [storeId], references: [id])
  category     String   // 日常行为类 | 月度目标类 | 特殊任务类
  name         String   // 考核项名称，如"开店准时度"
  description  String   // 评分说明，如"9点前到店得满分，9:05-9:15扣5分"
  maxScore     Int      // 满分，如 10
  passScore    Int      // 合格线，如 7
  periodType   PeriodType  // 适用于哪种周期：DAILY | WEEKLY | MONTHLY
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  reviewItems  ReviewItem[]
}

enum PeriodType {
  DAILY
  WEEKLY
  MONTHLY
}

// ─── 排班 ────────────────────────────────────────────

model Schedule {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  date      DateTime // 排班日期（精确到天）
  shiftType String?  // 早班 | 晚班 | 全天（可选）
  note      String?  // 备注
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tasks     Task[]

  @@unique([userId, date])  // 同一人同一天只能有一条排班
}

// ─── 任务 ────────────────────────────────────────────

model Task {
  id          String     @id @default(cuid())
  scheduleId  String
  schedule    Schedule   @relation(fields: [scheduleId], references: [id])
  title       String     // 任务标题
  description String?    // 详细说明
  priority    Priority   @default(MEDIUM)  // HIGH | MEDIUM | LOW
  isDone      Boolean    @default(false)
  doneAt      DateTime?  // 完成时间
  createdAt   DateTime   @default(now())
}

enum Priority {
  HIGH
  MEDIUM
  LOW
}

// ─── 考核记录（一次打分 = 一条 Review） ──────────────

model Review {
  id            String     @id @default(cuid())
  staffId       String
  staff         User       @relation(fields: [staffId], references: [id])
  reviewerId    String
  reviewer      User       @relation("ReviewedBy", fields: [reviewerId], references: [id])
  periodType    PeriodType // DAILY | WEEKLY | MONTHLY
  periodLabel   String     // 如："2026-04-22"、"2026-W17"、"2026-04"
  totalScore    Int        // 本次合计得分（自动计算）
  maxTotalScore Int        // 本次满分（自动计算）
  note          String?    // 管理员总体备注
  createdAt     DateTime   @default(now())

  items         ReviewItem[]
}

// ─── 考核明细（Review 下的每一项打分） ───────────────

model ReviewItem {
  id          String   @id @default(cuid())
  reviewId    String
  review      Review   @relation(fields: [reviewId], references: [id])
  standardId  String
  standard    Standard @relation(fields: [standardId], references: [id])
  score       Int      // 本项实际得分
  isPassed    Boolean  // score >= standard.passScore
  note        String?  // 这一项的具体备注
}
```

---

## 字段说明补充

### Review.periodLabel 格式约定
| periodType | periodLabel 示例 |
|---|---|
| DAILY | `2026-04-22` |
| WEEKLY | `2026-W17`（ISO 周数） |
| MONTHLY | `2026-04` |

### Task 完成状态
- 店员在"今日任务"页面点击完成 → `isDone = true`，记录 `doneAt`
- 管理员可随时重置任务状态

### 图片存储
- `Guideline.imageUrls` 存 Supabase Storage 的公开 URL 数组
- 上传时通过 `/api/upload` 接口处理，返回 URL 后写入

---

## 关键查询场景

```typescript
// 1. 店员登录后：获取今日排班+任务
const todaySchedule = await prisma.schedule.findUnique({
  where: { userId_date: { userId, date: today } },
  include: { tasks: { orderBy: { priority: 'asc' } } }
})

// 2. 店员查看自己最近的考核结果
const recentReviews = await prisma.review.findMany({
  where: { staffId: userId },
  include: { items: { include: { standard: true } } },
  orderBy: { createdAt: 'desc' },
  take: 5
})

// 3. 管理员查看全员任务完成率（本周）
const weekSchedules = await prisma.schedule.findMany({
  where: {
    date: { gte: weekStart, lte: weekEnd },
    user: { storeId }
  },
  include: { tasks: true, user: true }
})

// 4. 管理员绩效排名（按月度考核总分）
const monthlyRanking = await prisma.review.groupBy({
  by: ['staffId'],
  where: { periodType: 'MONTHLY', periodLabel: '2026-04' },
  _sum: { totalScore: true },
  orderBy: { _sum: { totalScore: 'desc' } }
})
```

---

*配套文件：PRD.md / TECH_STACK.md*
