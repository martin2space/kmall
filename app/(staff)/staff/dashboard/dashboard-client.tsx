"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { clockIn } from "./actions";

export default function DashboardClient({
  clockInTime,
  userId,
  today,
  totalStandards,
  completedStandards,
  pendingExamCount,
  lastReview,
  lastExamTitle,
}: {
  clockInTime: Date | null;
  userId: string;
  today: string;
  totalStandards: number;
  completedStandards: number;
  pendingExamCount: number;
  lastReview: { totalScore: number; maxTotalScore: number } | null;
  lastExamTitle: string | null;
}) {
  const [currentClockInTime, setCurrentClockInTime] = useState<Date | null>(clockInTime);
  const [clocking, setClocking] = useState(false);
  const router = useRouter();

  async function handleClockIn() {
    setClocking(true);
    await clockIn(userId, today);
    setClocking(false);
    setCurrentClockInTime(new Date());
  }

  const trainingPct =
    totalStandards > 0 ? Math.round((completedStandards / totalStandards) * 100) : 0;

  const lastExamPct =
    lastReview && lastReview.maxTotalScore > 0
      ? Math.round((lastReview.totalScore / lastReview.maxTotalScore) * 100)
      : null;

  return (
    <div className="p-4 space-y-4">
      {/* 今日打卡 */}
      <div className="bg-white rounded-xl border p-4">
        <h2 className="text-sm font-medium text-gray-500 mb-3">今日打卡</h2>
        {currentClockInTime ? (
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500 hover:bg-green-500">已打卡</Badge>
            <span className="text-sm text-gray-500">
              {new Date(currentClockInTime).toLocaleTimeString("zh-CN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
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

      {/* 培训进度 */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-medium text-gray-500">培训进度</h2>
          <button
            className="text-xs text-primary"
            onClick={() => router.push("/staff/training")}
          >
            去学习
          </button>
        </div>
        <div className="flex items-end gap-1 mb-2">
          <span className="text-2xl font-bold">{completedStandards}</span>
          <span className="text-sm text-gray-400 mb-0.5">/ {totalStandards} 条标准</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${trainingPct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">已完成 {trainingPct}%</p>
      </div>

      {/* 待完成考核 */}
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

      {/* 最近一次考核成绩 */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-medium text-gray-500">最近一次考核</h2>
          <button
            className="text-xs text-primary"
            onClick={() => router.push("/staff/exam")}
          >
            查看全部
          </button>
        </div>
        {lastReview && lastExamTitle ? (
          <div>
            <p className="text-sm text-gray-600 truncate mb-2">{lastExamTitle}</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">
                {lastReview.totalScore}
                <span className="text-sm font-normal text-gray-400">
                  /{lastReview.maxTotalScore}
                </span>
              </span>
              {lastExamPct !== null && (
                <Badge variant={lastExamPct >= 60 ? "default" : "destructive"}>
                  {lastExamPct}%
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">暂无考核记录</p>
        )}
      </div>
    </div>
  );
}
