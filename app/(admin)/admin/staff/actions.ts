"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function createStaff(data: {
  name: string;
  phone: string;
  role: "ADMIN" | "STAFF";
  storeId: string;
}) {
  if (!data.name.trim() || !data.phone.trim() || !data.storeId) {
    return { error: "姓名、手机号和门店不能为空" };
  }

  const email = `${data.phone.trim()}@fastcat.com`;

  // 在 Supabase Auth 创建账号
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: "FastCat123456",
    email_confirm: true,
    user_metadata: { role: data.role },
  });

  if (authError || !authData.user) {
    return { error: authError?.message ?? "创建账号失败" };
  }

  // 在 User 表创建记录
  try {
    await prisma.user.create({
      data: {
        id: authData.user.id,
        name: data.name.trim(),
        phone: data.phone.trim(),
        role: data.role,
        storeId: data.storeId,
      },
    });
    revalidatePath("/admin/staff");
    return { success: true };
  } catch {
    // Prisma 创建失败时回滚 Auth 用户
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return { error: "创建店员记录失败，请重试" };
  }
}

export async function toggleStaffActive(id: string, isActive: boolean) {
  try {
    await prisma.user.update({ where: { id }, data: { isActive } });
    revalidatePath("/admin/staff");
    return { success: true };
  } catch {
    return { error: "操作失败，请重试" };
  }
}

export async function updateStaff(data: {
  id: string;
  name: string;
  phone: string;
  role: "ADMIN" | "STAFF";
  storeId: string;
}) {
  const name = data.name.trim();
  const phone = data.phone.trim();

  if (!data.id || !name || !phone || !data.storeId) {
    return { error: "姓名、手机号和门店不能为空" };
  }

  const existing = await prisma.user.findUnique({ where: { id: data.id } });
  if (!existing) return { error: "店员不存在" };

  if (phone !== existing.phone) {
    const duplicate = await prisma.user.findUnique({ where: { phone } });
    if (duplicate) return { error: "手机号已被其他店员使用" };
  }

  const store = await prisma.store.findUnique({ where: { id: data.storeId } });
  if (!store) return { error: "门店不存在，请重新选择" };

  const email = `${phone}@fastcat.com`;
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
    data.id,
    {
      email,
      email_confirm: true,
      user_metadata: { role: data.role },
    }
  );

  if (authError) {
    return { error: authError.message ?? "更新登录账号失败" };
  }

  try {
    await prisma.user.update({
      where: { id: data.id },
      data: {
        name,
        phone,
        role: data.role,
        storeId: data.storeId,
      },
    });
    revalidatePath("/admin/staff");
    return { success: true };
  } catch {
    return { error: "更新店员信息失败，请重试" };
  }
}
