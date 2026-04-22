"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markAsLearned(userId: string, standardId: string) {
  try {
    await prisma.trainingRecord.upsert({
      where: { userId_standardId: { userId, standardId } },
      create: { userId, standardId },
      update: {},
    });
    revalidatePath("/staff/training");
    revalidatePath("/staff/dashboard");
    return { success: true };
  } catch {
    return { error: "标记失败，请重试" };
  }
}
