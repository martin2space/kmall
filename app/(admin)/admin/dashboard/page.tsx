import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminDashboardPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    storeCount,
    staffCount,
    monthCompletedExams,
    recentExams,
  ] = await Promise.all([
    prisma.store.count(),
    prisma.user.count({ where: { role: "STAFF", isActive: true } }),
    prisma.examSchedule.findMany({
      where: { status: "COMPLETED", createdAt: { gte: monthStart } },
      select: { review: { select: { totalScore: true, maxTotalScore: true } } },
    }),
    prisma.examSchedule.findMany({
      where: { status: "COMPLETED" },
      include: {
        assignedTo: { select: { name: true } },
        review: { select: { totalScore: true, maxTotalScore: true, createdAt: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const monthExamCount = monthCompletedExams.length;
  const validReviews = monthCompletedExams.filter(
    (e: (typeof monthCompletedExams)[number]) => e.review && e.review.maxTotalScore > 0
  );
  const avgPct =
    validReviews.length > 0
      ? Math.round(
          validReviews.reduce(
  (sum: number, e: typeof validReviews[number]) =>
    sum + (e.review!.totalScore / e.review!.maxTotalScore) * 100,
  0
) / validReviews.length
        )
      : null;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">数据概览</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>门店总数</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{storeCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">家门店</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>在职店员</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{staffCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">名店员</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>本月考核</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{monthExamCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">次已完成</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>本月平均分</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {avgPct !== null ? `${avgPct}%` : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {avgPct !== null ? "综合得分率" : "本月暂无考核"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 最近考核记录 */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="text-sm font-medium">最近考核记录</h2>
          <Link
            href="/admin/exams"
            className="text-xs text-primary hover:underline"
          >
            查看全部
          </Link>
        </div>
        {recentExams.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">
            暂无已完成的考核记录
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>店员</TableHead>
                <TableHead>考核标题</TableHead>
                <TableHead>总分</TableHead>
                <TableHead>得分率</TableHead>
                <TableHead>完成时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentExams.map((exam: typeof recentExams[number]) => {
                const review = exam.review;
                const pct =
                  review && review.maxTotalScore > 0
                    ? Math.round(
                        (review.totalScore / review.maxTotalScore) * 100
                      )
                    : null;
                return (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">
                      {exam.assignedTo.name}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/exams/${exam.id}`}
                        className="hover:underline"
                      >
                        {exam.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {review
                        ? `${review.totalScore}/${review.maxTotalScore}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {pct !== null ? (
                        <Badge variant={pct >= 60 ? "default" : "destructive"}>
                          {pct}%
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-gray-500 text-xs">
                      {review
                        ? new Date(review.createdAt).toLocaleDateString(
                            "zh-CN",
                            { month: "numeric", day: "numeric" }
                          )
                        : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
