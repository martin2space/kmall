"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "首页", href: "/admin/dashboard" },
  { label: "门店管理", href: "/admin/stores" },
  { label: "店员管理", href: "/admin/staff" },
  { label: "培训标准", href: "/admin/standards" },
  { label: "排班管理", href: "/admin/schedules" },
  { label: "考核管理", href: "/admin/exams" },
  { label: "考核报告", href: "/admin/reports" },
];

export default function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="w-56 bg-white border-r flex flex-col shrink-0 h-screen">
      <div className="p-4 border-b">
        <h1 className="font-bold text-base leading-tight">快猫管理后台</h1>
      </div>
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === item.href || pathname.startsWith(item.href + "/")
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t space-y-2">
        <p className="text-xs text-gray-500 truncate" title={userEmail}>
          {userEmail}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleLogout}
        >
          退出登录
        </Button>
      </div>
    </aside>
  );
}
