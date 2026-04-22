import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

const PERIOD_LABELS: Record<string, string> = {
  DAILY: "日常考核",
  WEEKLY: "周度考核",
  MONTHLY: "月度考核",
};

export default async function ExamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { id } = await params;

  const exam = await prisma.examSchedule.findUnique({
    where: { id },
    include: {
      assignedBy: { select: { name: true } },
      review: {
        include: {
          items: {
            include: {
              standard: { select: { name: true, maxScore: true, passScore: true } },
            },
          },
          reviewer: { select: { name: true } },
        },
      },
    },
  });

  if (!exam || exam.assignedToId !== user.id) notFound();

  const passedCount = exam.review?.items.filter((i) => i.isPassed).length ?? 0;
  const totalCount = exam.review?.items.length ?? 0;

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white rounded-xl border p-4">
        <h1 className="font-semibold text-base">
          {PERIOD_LABELS[exam.periodType] ?? exam.periodType}
        </h1>
        <p className="text-sm text-gray-500 mt-1">考核周期：{exam.periodLabel}</p>
        <p className="text-sm text-gray-500">考官：{exam.assignedBy.name}</p>
      </div>

      {!exam.review ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-base">考官尚未开始评分</p>
          <p className="text-xs mt-2">请等待考官完成评分后查看结果</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 mb-1">总得分</p>
                <p className="text-3xl font-bold">
                  {exam.review.totalScore}
                  <span className="text-base font-normal text-gray-400">
                    /{exam.review.maxTotalScore}
                  </span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  合格 {passedCount}/{totalCount} 项
                </p>
              </div>
              <div className="text-right">
                <Badge className="text-sm px-3 py-1">
                  {exam.review.maxTotalScore > 0
                    ? Math.round(
                        (exam.review.totalScore / exam.review.maxTotalScore) * 100
                      )
                    : 0}
                  %
                </Badge>
              </div>
            </div>
            {exam.review.note && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500 mb-1">考官评语</p>
                <p className="text-sm text-gray-700">{exam.review.note}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border divide-y">
            <div className="px-4 py-2.5">
              <p className="text-xs font-medium text-gray-500">各项评分明细</p>
            </div>
            {exam.review.items.map((item) => (
              <div key={item.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium flex-1">{item.standard.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm text-gray-600">
                      {item.score}
                      <span className="text-gray-400">/{item.standard.maxScore}</span>
                    </span>
                    <Badge
                      variant={item.isPassed ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {item.isPassed ? "合格" : "不合格"}
                    </Badge>
                  </div>
                </div>
                {item.note && (
                  <p className="text-xs text-gray-500 mt-1">{item.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
