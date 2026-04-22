"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { startReview, submitScores } from "./actions";

type ScoringItem = {
  id: string;
  score: number;
  note: string;
  standard: { name: string; maxScore: number; passScore: number };
};

type ReviewData = {
  id: string;
  totalScore: number;
  maxTotalScore: number;
  note: string | null;
  items: ScoringItem[];
};

export default function ScoringClient({
  examId,
  examStatus,
  review,
}: {
  examId: string;
  examStatus: string;
  review: ReviewData | null;
}) {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Scoring form state
  const [items, setItems] = useState<ScoringItem[]>(
    review?.items.map((item) => ({ ...item, score: item.score, note: item.note })) ?? []
  );
  const [reviewNote, setReviewNote] = useState(review?.note ?? "");

  async function handleStartReview() {
    setStarting(true);
    setError("");
    const result = await startReview(examId);
    setStarting(false);
    if (result.error) { setError(result.error); return; }
    router.refresh();
  }

  async function handleSubmit() {
    for (const item of items) {
      if (item.score < 0 || item.score > item.standard.maxScore) {
        setError(`「${item.standard.name}」分数须在 0 ~ ${item.standard.maxScore} 之间`);
        return;
      }
    }
    setSubmitting(true);
    setError("");
    const result = await submitScores(
      examId,
      review!.id,
      items.map((i) => ({ id: i.id, score: i.score, note: i.note })),
      reviewNote
    );
    setSubmitting(false);
    if (result.error) { setError(result.error); return; }
    router.push("/admin/exams");
  }

  function updateItem(id: string, field: "score" | "note", value: string | number) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  // COMPLETED: read-only view
  if (examStatus === "COMPLETED" && review) {
    const passedCount = review.items.filter((i) => i.score >= i.standard.passScore).length;
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-700 font-medium">考核已完成</p>
            <p className="text-xs text-blue-500 mt-0.5">
              合格 {passedCount}/{review.items.length} 项
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-700">
              {review.totalScore}
              <span className="text-sm font-normal text-blue-400">/{review.maxTotalScore}</span>
            </p>
          </div>
        </div>
        {review.note && (
          <div className="bg-white border rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">总体评语</p>
            <p className="text-sm">{review.note}</p>
          </div>
        )}
        <div className="bg-white border rounded-lg divide-y">
          {review.items.map((item) => {
            const passed = item.score >= item.standard.passScore;
            return (
              <div key={item.id} className="p-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.standard.name}</p>
                  {item.note && <p className="text-xs text-gray-500 mt-1">{item.note}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm">
                    {item.score}
                    <span className="text-gray-400">/{item.standard.maxScore}</span>
                  </span>
                  <Badge variant={passed ? "default" : "destructive"} className="text-xs">
                    {passed ? "合格" : "不合格"}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // PENDING: start button
  if (!review) {
    return (
      <div className="bg-white border rounded-lg p-8 text-center space-y-4">
        <p className="text-gray-500">尚未开始评分，点击下方按钮开始</p>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button onClick={handleStartReview} disabled={starting} size="lg">
          {starting ? "创建中..." : "开始评分"}
        </Button>
      </div>
    );
  }

  // IN_PROGRESS: scoring form
  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg divide-y">
        {items.map((item) => (
          <div key={item.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{item.standard.name}</span>
              <span className="text-xs text-gray-400">
                满分 {item.standard.maxScore} · 合格线 {item.standard.passScore}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">得分（0 ~ {item.standard.maxScore}）</Label>
                <Input
                  type="number"
                  min={0}
                  max={item.standard.maxScore}
                  value={item.score}
                  onChange={(e) =>
                    updateItem(item.id, "score", Number(e.target.value))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">评语（可选）</Label>
                <Input
                  placeholder="具体反馈..."
                  value={item.note}
                  onChange={(e) => updateItem(item.id, "note", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border rounded-lg p-4 space-y-2">
        <Label className="text-xs">总体评语（可选）</Label>
        <Textarea
          rows={3}
          placeholder="对本次考核的整体评价..."
          value={reviewNote}
          onChange={(e) => setReviewNote(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push("/admin/exams")} className="flex-1">
          暂存返回
        </Button>
        <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
          {submitting ? "提交中..." : "提交考核"}
        </Button>
      </div>
    </div>
  );
}
