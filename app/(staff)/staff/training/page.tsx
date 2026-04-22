import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import TrainingClient from "./training-client";

export default async function TrainingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [standards, trainingRecords] = await Promise.all([
    prisma.standard.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        maxScore: true,
        passScore: true,
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    prisma.trainingRecord.findMany({
      where: { userId: user.id },
      select: { standardId: true },
    }),
  ]);

  const completedIds = trainingRecords.map((r) => r.standardId);

  return (
    <TrainingClient
      userId={user.id}
      standards={standards}
      completedIds={completedIds}
    />
  );
}
