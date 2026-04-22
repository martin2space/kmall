import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const PERIOD_LABELS: Record<string, string> = {
  DAILY: "日常考核",
  WEEKLY: "周度考核",
  MONTHLY: "月度考核",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "outline" | "secondary" }
> = {
  PENDING: { label: "待考核", variant: "outline" },
  IN_PROGRESS: { label: "考核中", variant: "secondary" },
  COMPLETED: { label: "已完成", variant: "default" },
};

export default async function ExamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const examSchedules = await prisma.examSchedule.findMany({
    where: { assignedToId: user.id },
    include: { assignedBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-semibold">我的考核</h1>

      {examSchedules.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>暂无考核任务</p>
          <p className="text-xs mt-1">等待管理员安排考核</p>
        </div>
      ) : (
        <div className="space-y-3">
          {examSchedules.map((exam) => {
            const status = STATUS_CONFIG[exam.status] ?? {
              label: exam.status,
              variant: "outline" as const,
            };
            return (
              <div key={exam.id} className="bg-white rounded-xl border p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-sm">
                      {PERIOD_LABELS[exam.periodType] ?? exam.periodType}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      周期：{exam.periodLabel} · 考官：{exam.assignedBy.name}
                    </p>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <Link
                  href={`/staff/exam/${exam.id}`}
                  className="mt-2 block w-full text-center text-sm border rounded-md py-1.5 hover:bg-gray-50 transition-colors"
                >
                  {exam.status === "COMPLETED" ? "查看结果" : "查看详情"}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
