import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import ProfileClient from "./profile-client";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      phone: true,
      role: true,
      store: { select: { name: true } },
    },
  });

  if (!dbUser) redirect("/login");

  return (
    <ProfileClient
      name={dbUser.name}
      phone={dbUser.phone}
      storeName={dbUser.store.name}
      role={dbUser.role}
    />
  );
}
