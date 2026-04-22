import { prisma } from "@/lib/prisma";
import StaffClient from "./staff-client";

export default async function StaffPage() {
  const [staffList, stores] = await Promise.all([
    prisma.user.findMany({
      include: { store: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.store.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <StaffClient staffList={staffList} stores={stores} />;
}
