"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, ClipboardList, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/staff/dashboard", label: "首页", icon: Home },
  { href: "/staff/training", label: "培训学习", icon: BookOpen },
  { href: "/staff/exam", label: "我的考核", icon: ClipboardList },
  { href: "/staff/profile", label: "个人信息", icon: User },
];

export default function StaffBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-10">
      <div className="flex">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-2 text-xs transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "text-primary"
                : "text-gray-400"
            )}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
