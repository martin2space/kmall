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

  const [todayAttendance, recentTraining, pendingExamCount] = await Promise.all([
    prisma.attendanceRecord.findFirst({
      where: { userId: user.id, date: today, type: "CLOCK_IN" },
    }),
    prisma.trainingRecord.findMany({
      where: { userId: user.id },
      include: { standard: { select: { name: true, category: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.examSchedule.count({
      where: { assignedToId: user.id, status: "PENDING" },
    }),
  ]);

  return (
    <DashboardClient
      hasClockedIn={!!todayAttendance}
      userId={user.id}
      today={today}
      recentTraining={recentTraining}
      pendingExamCount={pendingExamCount}
    />
  );
}
