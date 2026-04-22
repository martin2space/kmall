import { prisma } from "@/lib/prisma";
import ExamsClient from "./exams-client";

export default async function ExamsPage() {
  const [exams, staffList, standards] = await Promise.all([
    prisma.examSchedule.findMany({
      include: {
        assignedTo: { select: { name: true } },
        _count: { select: { standards: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "STAFF", isActive: true },
      select: { id: true, name: true, store: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.standard.findMany({
      where: { isActive: true },
      select: { id: true, name: true, category: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
  ]);

  return <ExamsClient exams={exams} staffList={staffList} standards={standards} />;
}
