import { prisma } from "@/lib/prisma";
import StoresClient from "./stores-client";

export default async function StoresPage() {
  const stores = await prisma.store.findMany({ orderBy: { createdAt: "desc" } });
  return <StoresClient stores={stores} />;
}
