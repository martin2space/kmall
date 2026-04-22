import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import ScoringClient from "./scoring-client";

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "outline" | "secondary" }> = {
  PENDING: { label: "待考核", variant: "outline" },
  IN_PROGRESS: { label: "评分中", variant: "secondary" },
  COMPLETED: { label: "已完成", variant: "default" },
};

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
  const { id } = await params;

  const exam = await prisma.examSchedule.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { name: true, store: { select: { name: true } } } },
      assignedBy: { select: { name: true } },
      standards: { select: { id: true, name: true, maxScore: true, passScore: true } },
      review: {
        include: {
          items: {
            include: {
              standard: {
                select: { name: true, maxScore: true, passScore: true },
              },
            },
          },
        },
      },
    },
  });

  if (!exam) notFound();

  const status = STATUS_CONFIG[exam.status] ?? { label: exam.status, variant: "outline" as const };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/exams"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← 考核管理
        </Link>
      </div>

      {/* 考核基本信息 */}
      <div className="bg-white border rounded-lg p-5 space-y-3">
        <div className="flex items-start justify-between">
          <h1 className="text-lg font-semibold">{exam.title}</h1>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div>
            <span className="text-gray-500">被考核人：</span>
            <span className="font-medium">{exam.assignedTo.name}</span>
            <span className="text-gray-400 ml-1">（{exam.assignedTo.store.name}）</span>
          </div>
          <div>
            <span className="text-gray-500">考核类型：</span>
            <span>{PERIOD_LABELS[exam.periodType] ?? exam.periodType}</span>
          </div>
          <div>
            <span className="text-gray-500">考核周期：</span>
            <span>{exam.periodLabel}</span>
          </div>
          {exam.scheduledAt && (
            <div>
              <span className="text-gray-500">计划时间：</span>
              <span>
                {new Date(exam.scheduledAt).toLocaleString("zh-CN", {
                  month: "numeric",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>
        {exam.status === "PENDING" && (
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-400 mb-1">关联考核标准（{exam.standards.length} 项）</p>
            <div className="flex flex-wrap gap-1.5">
              {exam.standards.map((s) => (
                <span
                  key={s.id}
                  className="text-xs border rounded px-2 py-0.5 text-gray-600"
                >
                  {s.name}（满分 {s.maxScore}）
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 评分区域 */}
      <ScoringClient
        examId={exam.id}
        examStatus={exam.status}
        review={
          exam.review
            ? {
                id: exam.review.id,
                totalScore: exam.review.totalScore,
                maxTotalScore: exam.review.maxTotalScore,
                note: exam.review.note,
                items: exam.review.items.map((i) => ({
                  id: i.id,
                  score: i.score,
                  note: i.note ?? "",
                  standard: i.standard,
                })),
              }
            : null
        }
      />
    </div>
  );
}
