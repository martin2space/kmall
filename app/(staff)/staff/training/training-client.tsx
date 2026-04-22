"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { markAsLearned } from "./actions";

const CATEGORY_LABELS: Record<string, string> = {
  SERVICE: "服务",
  PRODUCT: "产品",
  SALES: "销售",
  SAFETY: "安全",
};

type Standard = {
  id: string;
  name: string;
  category: string;
  description: string;
  maxScore: number;
  passScore: number;
};

export default function TrainingClient({
  userId,
  standards,
  completedIds: initialCompletedIds,
}: {
  userId: string;
  standards: Standard[];
  completedIds: string[];
}) {
  const [completedIds, setCompletedIds] = useState(new Set(initialCompletedIds));
  const [selected, setSelected] = useState<Standard | null>(null);
  const [marking, setMarking] = useState(false);

  async function handleMarkLearned(standardId: string) {
    setMarking(true);
    const result = await markAsLearned(userId, standardId);
    setMarking(false);
    if (result.success) {
      setCompletedIds((prev) => new Set([...prev, standardId]));
      setSelected(null);
    }
  }

  const groups = standards.reduce<Record<string, Standard[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-lg font-semibold">培训学习</h1>

      {standards.length === 0 && (
        <div className="text-center py-12 text-gray-400">暂无培训内容</div>
      )}

      {Object.entries(groups).map(([category, items]) => (
        <div key={category}>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-gray-700">
              {CATEGORY_LABELS[category] ?? category}
            </h2>
            <span className="text-xs text-gray-400">
              {items.filter((i) => completedIds.has(i.id)).length}/{items.length} 已完成
            </span>
          </div>
          <div className="space-y-2">
            {items.map((item) => {
              const done = completedIds.has(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className="w-full bg-white border rounded-lg p-3 text-left hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium flex-1">{item.name}</span>
                    {done ? (
                      <Badge className="bg-green-500 hover:bg-green-500 text-xs shrink-0">
                        ✓ 已完成
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs shrink-0">
                        未学习
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{selected.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {CATEGORY_LABELS[selected.category] ?? selected.category}
                </Badge>
                <Badge variant="outline">满分 {selected.maxScore} 分</Badge>
                <Badge variant="outline">合格线 {selected.passScore} 分</Badge>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {selected.description}
              </p>
            </div>
            <DialogFooter className="gap-2 flex-row">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelected(null)}
              >
                关闭
              </Button>
              {!completedIds.has(selected.id) && (
                <Button
                  className="flex-1"
                  onClick={() => handleMarkLearned(selected.id)}
                  disabled={marking}
                >
                  {marking ? "标记中..." : "标记已学习"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
