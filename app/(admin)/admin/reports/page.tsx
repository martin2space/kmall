import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ReportsPage() {
  const completedExams = await prisma.examSchedule.findMany({
    where: { status: "COMPLETED" },
    include: {
      assignedTo: { select: { name: true } },
      review: {
        select: {
          totalScore: true,
          maxTotalScore: true,
          note: true,
          createdAt: true,
          items: {
            include: {
              standard: { select: { name: true, maxScore: true, passScore: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">考核报告</h1>
        <span className="text-sm text-gray-500">共 {completedExams.length} 条记录</span>
      </div>

      {completedExams.length === 0 ? (
        <div className="bg-white border rounded-lg p-12 text-center text-gray-400">
          暂无已完成的考核记录
        </div>
      ) : (
        <div className="space-y-4">
          {completedExams.map((exam) => {
            const review = exam.review;
            if (!review) return null;
            const pct =
              review.maxTotalScore > 0
                ? Math.round((review.totalScore / review.maxTotalScore) * 100)
                : 0;
            const passedCount = review.items.filter(
              (i) => i.score >= i.standard.passScore
            ).length;

            return (
              <div key={exam.id} className="bg-white border rounded-lg overflow-hidden">
                {/* 摘要行 */}
                <div className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{exam.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      被考核：{exam.assignedTo.name} ·{" "}
                      {new Date(review.createdAt).toLocaleDateString("zh-CN")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold">
                      {review.totalScore}
                      <span className="text-sm font-normal text-gray-400">
                        /{review.maxTotalScore}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {pct}% · 合格 {passedCount}/{review.items.length} 项
                    </p>
                  </div>
                  <Link
                    href={`/admin/exams/${exam.id}`}
                    className="text-xs text-primary shrink-0 hover:underline"
                  >
                    详情
                  </Link>
                </div>

                {/* 明细表格（折叠展示，始终可见） */}
                <div className="border-t">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-xs">考核标准</TableHead>
                        <TableHead className="text-xs w-24">得分/满分</TableHead>
                        <TableHead className="text-xs w-16">结果</TableHead>
                        <TableHead className="text-xs">评语</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {review.items.map((item) => {
                        const passed = item.score >= item.standard.passScore;
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="text-sm">{item.standard.name}</TableCell>
                            <TableCell className="text-sm">
                              {item.score}/{item.standard.maxScore}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={passed ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {passed ? "合格" : "不合格"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-gray-500">
                              {item.note ?? "—"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {review.note && (
                    <div className="px-4 py-2 border-t bg-gray-50">
                      <span className="text-xs text-gray-500">总体评语：</span>
                      <span className="text-xs">{review.note}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
