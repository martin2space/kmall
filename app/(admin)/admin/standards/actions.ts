"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PeriodType } from "@prisma/client";

type StandardData = {
  storeId: string;
  name: string;
  category: string;
  description: string;
  maxScore: number;
  passScore: number;
  periodType: PeriodType;
};

function validate(data: StandardData) {
  if (!data.name.trim()) return "标准名称不能为空";
  if (!data.storeId) return "请选择所属门店";
  if (!data.category) return "请选择分类";
  if (!data.description.trim()) return "评分说明不能为空";
  if (data.maxScore <= 0) return "满分须大于0";
  if (data.passScore < 0 || data.passScore > data.maxScore) return "合格线须介于0和满分之间";
  return null;
}

export async function createStandard(data: StandardData) {
  const err = validate(data);
  if (err) return { error: err };
  try {
    await prisma.standard.create({ data });
    revalidatePath("/admin/standards");
    return { success: true };
  } catch {
    return { error: "创建失败，请重试" };
  }
}

export async function updateStandard(id: string, data: StandardData) {
  const err = validate(data);
  if (err) return { error: err };
  try {
    await prisma.standard.update({ where: { id }, data });
    revalidatePath("/admin/standards");
    return { success: true };
  } catch {
    return { error: "更新失败，请重试" };
  }
}

export async function toggleStandardActive(id: string, isActive: boolean) {
  try {
    await prisma.standard.update({ where: { id }, data: { isActive } });
    revalidatePath("/admin/standards");
    return { success: true };
  } catch {
    return { error: "操作失败，请重试" };
  }
}
