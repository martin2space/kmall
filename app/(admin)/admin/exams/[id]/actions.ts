"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function startReview(examId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "未授权" };

  const exam = await prisma.examSchedule.findUnique({
    where: { id: examId },
    include: { standards: true },
  });
  if (!exam) return { error: "考核任务不存在" };
  if (exam.reviewId) return { error: "考核已开始" };

  const maxTotalScore = exam.standards.reduce((sum, s) => sum + s.maxScore, 0);

  const review = await prisma.review.create({
    data: {
      staffId: exam.assignedToId,
      reviewerId: user.id,
      periodType: exam.periodType,
      periodLabel: exam.periodLabel,
      totalScore: 0,
      maxTotalScore,
      items: {
        create: exam.standards.map((s) => ({
          standardId: s.id,
          score: 0,
          isPassed: false,
        })),
      },
    },
  });

  await prisma.examSchedule.update({
    where: { id: examId },
    data: { reviewId: review.id, status: "IN_PROGRESS" },
  });

  revalidatePath(`/admin/exams/${examId}`);
  return { success: true };
}

export async function submitScores(
  examId: string,
  reviewId: string,
  items: Array<{ id: string; score: number; note: string }>,
  reviewNote: string
) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { items: { include: { standard: true } } },
  });
  if (!review) return { error: "考核记录不存在" };

  let totalScore = 0;
  let maxTotalScore = 0;

  for (const input of items) {
    const reviewItem = review.items.find((ri) => ri.id === input.id);
    if (!reviewItem) continue;
    const score = Math.max(0, Math.min(input.score, reviewItem.standard.maxScore));
    const isPassed = score >= reviewItem.standard.passScore;
    totalScore += score;
    maxTotalScore += reviewItem.standard.maxScore;
    await prisma.reviewItem.update({
      where: { id: input.id },
      data: { score, isPassed, note: input.note || null },
    });
  }

  await prisma.review.update({
    where: { id: reviewId },
    data: { totalScore, maxTotalScore, note: reviewNote || null },
  });

  await prisma.examSchedule.update({
    where: { id: examId },
    data: { status: "COMPLETED" },
  });

  revalidatePath(`/admin/exams/${examId}`);
  revalidatePath("/admin/reports");
  return { success: true };
}
