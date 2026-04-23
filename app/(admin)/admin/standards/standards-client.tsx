"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createStandard, updateStandard, toggleStandardActive } from "./actions";
import type { PeriodType } from "@/types/global";

const CATEGORIES = [
  { value: "SERVICE", label: "服务" },
  { value: "PRODUCT", label: "产品" },
  { value: "SALES", label: "销售" },
  { value: "SAFETY", label: "安全" },
];

const PERIOD_TYPES = [
  { value: "DAILY", label: "日常" },
  { value: "WEEKLY", label: "每周" },
  { value: "MONTHLY", label: "每月" },
];

type Store = { id: string; name: string };
type Standard = {
  id: string;
  name: string;
  category: string;
  description: string;
  maxScore: number;
  passScore: number;
  periodType: PeriodType;
  isActive: boolean;
  storeId: string;
  store: { name: string };
};

type FormData = {
  storeId: string;
  name: string;
  category: string;
  description: string;
  maxScore: string;
  passScore: string;
  periodType: PeriodType;
};

const defaultForm: FormData = {
  storeId: "",
  name: "",
  category: "SERVICE",
  description: "",
  maxScore: "10",
  passScore: "7",
  periodType: "DAILY",
};

function toActionData(f: FormData) {
  return {
    ...f,
    maxScore: parseInt(f.maxScore) || 0,
    passScore: parseInt(f.passScore) || 0,
  };
}

export default function StandardsClient({
  standards,
  stores,
}: {
  standards: Standard[];
  stores: Store[];
}) {
  const [editing, setEditing] = useState<Standard | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  function openAdd() {
    setForm(defaultForm);
    setFormError("");
    setShowAdd(true);
  }

  function openEdit(s: Standard) {
    setForm({
      storeId: s.storeId,
      name: s.name,
      category: s.category,
      description: s.description,
      maxScore: String(s.maxScore),
      passScore: String(s.passScore),
      periodType: s.periodType,
    });
    setFormError("");
    setEditing(s);
  }

  async function handleSubmit() {
    setFormError("");
    setSubmitting(true);
    const result = editing
      ? await updateStandard(editing.id, toActionData(form))
      : await createStandard(toActionData(form));
    setSubmitting(false);
    if (result.error) { setFormError(result.error); return; }
    setShowAdd(false);
    setEditing(null);
  }

  async function handleToggle(id: string, current: boolean) {
    setToggling(id);
    await toggleStandardActive(id, !current);
    setToggling(null);
  }

  const isOpen = showAdd || !!editing;

  const categoryLabel = (v: string) => CATEGORIES.find((c) => c.value === v)?.label ?? v;
  const periodLabel = (v: string) => PERIOD_TYPES.find((p) => p.value === v)?.label ?? v;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">培训标准</h1>
        <Button onClick={openAdd}>新增标准</Button>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>周期</TableHead>
              <TableHead>满分</TableHead>
              <TableHead>合格线</TableHead>
              <TableHead>门店</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="w-32">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standards.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-400 py-8">
                  暂无培训标准
                </TableCell>
              </TableRow>
            )}
            {standards.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{categoryLabel(s.category)}</TableCell>
                <TableCell>{periodLabel(s.periodType)}</TableCell>
                <TableCell>{s.maxScore}</TableCell>
                <TableCell>{s.passScore}</TableCell>
                <TableCell>{s.store.name}</TableCell>
                <TableCell>
                  <Badge variant={s.isActive ? "default" : "outline"}>
                    {s.isActive ? "启用" : "停用"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(s)}>
                      编辑
                    </Button>
                    <Switch
                      checked={s.isActive}
                      disabled={toggling === s.id}
                      onCheckedChange={() => handleToggle(s.id, s.isActive)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={(o) => { if (!o) { setShowAdd(false); setEditing(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "编辑标准" : "新增培训标准"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-1.5">
              <Label>标准名称 *</Label>
              <Input
                placeholder="如：开店准时度"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>分类 *</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v ?? "SERVICE" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>考核周期 *</Label>
                <Select value={form.periodType} onValueChange={(v) => setForm({ ...form, periodType: (v ?? "DAILY") as PeriodType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PERIOD_TYPES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>满分 *</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.maxScore}
                  onChange={(e) => setForm({ ...form, maxScore: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>合格线 *</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.passScore}
                  onChange={(e) => setForm({ ...form, passScore: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>所属门店 *</Label>
              <Select value={form.storeId} onValueChange={(v) => setForm({ ...form, storeId: v ?? "" })}>
                <SelectTrigger><SelectValue placeholder="选择门店" /></SelectTrigger>
                <SelectContent>
                  {stores.map((st) => (
                    <SelectItem key={st.id} value={st.id}>{st.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>评分说明 *</Label>
              <Textarea
                placeholder="如：9点前到店得满分，9:05-9:15扣5分，9:15后到为0分"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAdd(false); setEditing(null); }}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "保存中..." : editing ? "保存修改" : "确认创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
