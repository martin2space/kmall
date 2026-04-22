import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import StaffBottomNav from "@/components/staff/staff-bottom-nav";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, store: { select: { name: true } } },
  });

  if (!dbUser) redirect("/login");

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-md mx-auto">
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">{dbUser.store.name}</span>
          <span className="text-sm font-medium">{dbUser.name}</span>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto pb-16">{children}</main>
      <StaffBottomNav />
    </div>
  );
}
