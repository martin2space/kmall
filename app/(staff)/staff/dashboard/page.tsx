import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./dashboard-client";

export default async function StaffDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const today = new Date().toISOString().slice(0, 10);

  const [todayAttendance, totalStandards, completedStandards, pendingExamCount, lastExam] =
    await Promise.all([
      prisma.attendanceRecord.findFirst({
        where: { userId: user.id, date: today, type: "CLOCK_IN" },
        select: { createdAt: true },
      }),
      prisma.standard.count({ where: { isActive: true } }),
      prisma.trainingRecord.count({ where: { userId: user.id } }),
      prisma.examSchedule.count({
        where: { assignedToId: user.id, status: "PENDING" },
      }),
      prisma.examSchedule.findFirst({
        where: { assignedToId: user.id, status: "COMPLETED" },
        include: {
          review: { select: { totalScore: true, maxTotalScore: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const lastReview = lastExam?.review ?? null;

  return (
    <DashboardClient
      clockInTime={todayAttendance?.createdAt ?? null}
      userId={user.id}
      today={today}
      totalStandards={totalStandards}
      completedStandards={completedStandards}
      pendingExamCount={pendingExamCount}
      lastReview={lastReview ? { totalScore: lastReview.totalScore, maxTotalScore: lastReview.maxTotalScore } : null}
      lastExamTitle={lastExam?.title ?? null}
    />
  );
}
