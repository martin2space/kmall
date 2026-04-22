"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createExam, deleteExam } from "./actions";
import { PeriodType } from "@prisma/client";

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "outline" | "secondary" }> = {
  PENDING: { label: "待考核", variant: "outline" },
  IN_PROGRESS: { label: "评分中", variant: "secondary" },
  COMPLETED: { label: "已完成", variant: "default" },
};

const PERIOD_LABELS: Record<string, string> = {
  DAILY: "日常",
  WEEKLY: "每周",
  MONTHLY: "每月",
};

type Staff = { id: string; name: string; store: { name: string } };
type Standard = { id: string; name: string; category: string };
type Exam = {
  id: string;
  title: string;
  status: string;
  periodType: string;
  scheduledAt: Date | null;
  createdAt: Date;
  assignedTo: { name: string };
  _count: { standards: number };
};

const defaultForm = {
  title: "",
  assignedToId: "",
  periodType: "DAILY" as PeriodType,
  scheduledAt: "",
  standardIds: [] as string[],
};

export default function ExamsClient({
  exams,
  staffList,
  standards,
}: {
  exams: Exam[];
  staffList: Staff[];
  standards: Standard[];
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  function toggleStandard(id: string) {
    setForm((f) => ({
      ...f,
      standardIds: f.standardIds.includes(id)
        ? f.standardIds.filter((s) => s !== id)
        : [...f.standardIds, id],
    }));
  }

  async function handleCreate() {
    setFormError("");
    setSubmitting(true);
    const result = await createExam(form);
    setSubmitting(false);
    if (result.error) { setFormError(result.error); return; }
    setShowAdd(false);
    setForm(defaultForm);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await deleteExam(deleteId);
    setDeleting(false);
    setDeleteId(null);
  }

  const CATEGORY_LABELS: Record<string, string> = {
    SERVICE: "服务",
    PRODUCT: "产品",
    SALES: "销售",
    SAFETY: "安全",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">考核管理</h1>
        <Button onClick={() => { setForm(defaultForm); setFormError(""); setShowAdd(true); }}>
          新增考核
        </Button>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>考核标题</TableHead>
              <TableHead>被考核店员</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>标准数</TableHead>
              <TableHead>计划时间</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="w-28">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                  暂无考核任务
                </TableCell>
              </TableRow>
            )}
            {exams.map((exam) => {
              const status = STATUS_CONFIG[exam.status] ?? { label: exam.status, variant: "outline" as const };
              return (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.title}</TableCell>
                  <TableCell>{exam.assignedTo.name}</TableCell>
                  <TableCell>{PERIOD_LABELS[exam.periodType] ?? exam.periodType}</TableCell>
                  <TableCell>{exam._count.standards}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {exam.scheduledAt
                      ? new Date(exam.scheduledAt).toLocaleDateString("zh-CN")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/exams/${exam.id}`}
                        className="text-xs px-2 py-1 border rounded hover:bg-gray-50 transition-colors"
                      >
                        {exam.status === "PENDING" ? "开始评分" : "查看"}
                      </Link>
                      {exam.status === "PENDING" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-600 text-xs"
                          onClick={() => setDeleteId(exam.id)}
                        >
                          删除
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* 新增考核弹窗 */}
      <Dialog open={showAdd} onOpenChange={(o) => !o && setShowAdd(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>新增考核任务</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            <div className="space-y-1.5">
              <Label>考核标题 *</Label>
              <Input
                placeholder="如：4月份店员月度考核"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>被考核店员 *</Label>
                <Select
                  value={form.assignedToId}
                  onValueChange={(v) => setForm({ ...form, assignedToId: v ?? "" })}
                >
                  <SelectTrigger><SelectValue placeholder="选择店员" /></SelectTrigger>
                  <SelectContent>
                    {staffList.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}（{s.store.name}）
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>考核类型 *</Label>
                <Select
                  value={form.periodType}
                  onValueChange={(v) => setForm({ ...form, periodType: (v ?? "DAILY") as PeriodType })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">日常</SelectItem>
                    <SelectItem value="WEEKLY">每周</SelectItem>
                    <SelectItem value="MONTHLY">每月</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>计划考核时间</Label>
              <Input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>关联考核标准 * <span className="text-gray-400 font-normal text-xs">（已选 {form.standardIds.length} 项）</span></Label>
              <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                {standards.length === 0 && (
                  <p className="text-xs text-gray-400 p-3">暂无可用标准</p>
                )}
                {standards.map((s) => {
                  const checked = form.standardIds.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleStandard(s.id)}
                        className="rounded"
                      />
                      <span className="text-sm flex-1">{s.name}</span>
                      <span className="text-xs text-gray-400">
                        {CATEGORY_LABELS[s.category] ?? s.category}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>取消</Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? "创建中..." : "确认创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              删除后无法恢复，确认删除该考核任务？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "删除中..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
