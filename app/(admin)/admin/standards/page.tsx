import { prisma } from "@/lib/prisma";
import StandardsClient from "./standards-client";

export default async function StandardsPage() {
  const [standards, stores] = await Promise.all([
    prisma.standard.findMany({
      include: { store: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.store.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <StandardsClient standards={standards} stores={stores} />;
}
