"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createStore(data: { name: string; city: string; address?: string }) {
  if (!data.name.trim() || !data.city.trim()) {
    return { error: "门店名称和城市不能为空" };
  }
  try {
    await prisma.store.create({
      data: { name: data.name.trim(), city: data.city.trim(), address: data.address?.trim() || null },
    });
    revalidatePath("/admin/stores");
    return { success: true };
  } catch {
    return { error: "创建失败，请重试" };
  }
}

export async function deleteStore(id: string) {
  try {
    await prisma.store.delete({ where: { id } });
    revalidatePath("/admin/stores");
    return { success: true };
  } catch {
    return { error: "删除失败，该门店下可能有关联数据" };
  }
}
