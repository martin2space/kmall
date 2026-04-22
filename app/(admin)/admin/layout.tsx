import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar userEmail={user.email ?? ""} />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
