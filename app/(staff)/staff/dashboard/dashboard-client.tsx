"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { clockIn } from "./actions";

const CATEGORY_LABELS: Record<string, string> = {
  SERVICE: "服务",
  PRODUCT: "产品",
  SALES: "销售",
  SAFETY: "安全",
};

type RecentTraining = {
  id: string;
  createdAt: Date;
  standard: { name: string; category: string };
};

export default function DashboardClient({
  hasClockedIn,
  userId,
  today,
  recentTraining,
  pendingExamCount,
}: {
  hasClockedIn: boolean;
  userId: string;
  today: string;
  recentTraining: RecentTraining[];
  pendingExamCount: number;
}) {
  const [clockedIn, setClockedIn] = useState(hasClockedIn);
  const [clocking, setClocking] = useState(false);
  const router = useRouter();

  async function handleClockIn() {
    setClocking(true);
    await clockIn(userId, today);
    setClocking(false);
    setClockedIn(true);
  }

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white rounded-xl border p-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">今日打卡</h2>
        {clockedIn ? (
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500 hover:bg-green-500">已打卡</Badge>
            <span className="text-sm text-gray-500">今日打卡完成</span>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-400">今日尚未打卡</p>
            <Button onClick={handleClockIn} disabled={clocking} className="w-full">
              {clocking ? "打卡中..." : "立即打卡"}
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-medium text-gray-500">最近学习记录</h2>
          <button
            className="text-xs text-primary"
            onClick={() => router.push("/staff/training")}
          >
            查看全部
          </button>
        </div>
        {recentTraining.length === 0 ? (
          <p className="text-sm text-gray-400">暂无记录，去培训页面开始学习</p>
        ) : (
          <ul className="space-y-2">
            {recentTraining.map((r) => (
              <li key={r.id} className="flex items-center justify-between">
                <span className="text-sm">{r.standard.name}</span>
                <Badge variant="outline" className="text-xs">
                  {CATEGORY_LABELS[r.standard.category] ?? r.standard.category}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-xl border p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-sm font-medium text-gray-500">待完成考核</h2>
            <p className="text-2xl font-bold mt-1">{pendingExamCount}</p>
          </div>
          <button
            className="text-xs text-primary"
            onClick={() => router.push("/staff/exam")}
          >
            去考核
          </button>
        </div>
      </div>
    </div>
  );
}
