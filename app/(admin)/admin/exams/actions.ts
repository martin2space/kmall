"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import type { PeriodType } from "@/types/global";
function derivePeriodLabel(
  date: Date,
  periodType: "DAILY" | "WEEKLY" | "MONTHLY"
): string {
  if (periodType === "DAILY") return date.toISOString().slice(0, 10);
  if (periodType === "MONTHLY") return date.toISOString().slice(0, 7);
  // WEEKLY: ISO week
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export async function createExam(data: {
  title: string;
  assignedToId: string;
  periodType: PeriodType;
  scheduledAt: string;
  standardIds: string[];
}) {
  if (!data.title.trim()) return { error: "请填写考核标题" };
  if (!data.assignedToId) return { error: "请选择被考核店员" };
  if (data.standardIds.length === 0) return { error: "请至少选择一个考核标准" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "未授权" };

  const adminUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!adminUser) return { error: "管理员账号不存在，请先通过店员管理页创建账号" };

  const scheduledDate = data.scheduledAt ? new Date(data.scheduledAt) : new Date();
  const periodLabel = derivePeriodLabel(scheduledDate, data.periodType);

  await prisma.examSchedule.create({
    data: {
      title: data.title.trim(),
      assignedToId: data.assignedToId,
      assignedById: user.id,
      periodType: data.periodType,
      periodLabel,
      scheduledAt: scheduledDate,
      standards: { connect: data.standardIds.map((id) => ({ id })) },
    },
  });

  revalidatePath("/admin/exams");
  return { success: true };
}

export async function deleteExam(id: string) {
  const exam = await prisma.examSchedule.findUnique({ where: { id } });
  if (!exam) return { error: "考核任务不存在" };
  if (exam.status !== "PENDING") return { error: "只能删除待考核状态的任务" };

  await prisma.examSchedule.delete({ where: { id } });
  revalidatePath("/admin/exams");
  return { success: true };
}
