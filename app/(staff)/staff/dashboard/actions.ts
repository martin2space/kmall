"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function clockIn(userId: string, date: string) {
  const existing = await prisma.attendanceRecord.findFirst({
    where: { userId, date, type: "CLOCK_IN" },
  });

  if (existing) return { success: true };

  await prisma.attendanceRecord.create({
    data: { userId, date, type: "CLOCK_IN" },
  });

  revalidatePath("/staff/dashboard");
  return { success: true };
}
