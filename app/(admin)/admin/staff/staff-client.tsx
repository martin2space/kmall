"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { createStaff, toggleStaffActive } from "./actions";

type Store = { id: string; name: string };
type Staff = {
  id: string;
  name: string;
  phone: string;
  role: "ADMIN" | "STAFF";
  isActive: boolean;
  createdAt: Date;
  store: { name: string };
};

const defaultForm = { name: "", phone: "", role: "STAFF" as "ADMIN" | "STAFF", storeId: "" };

export default function StaffClient({
  staffList,
  stores,
}: {
  staffList: Staff[];
  stores: Store[];
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  async function handleCreate() {
    setFormError("");
    setSubmitting(true);
    const result = await createStaff(form);
    setSubmitting(false);
    if (result.error) { setFormError(result.error); return; }
    setShowAdd(false);
    setForm(defaultForm);
  }

  async function handleToggle(id: string, current: boolean) {
    setToggling(id);
    await toggleStaffActive(id, !current);
    setToggling(null);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">店员管理</h1>
        <Button onClick={() => setShowAdd(true)}>新增店员</Button>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>姓名</TableHead>
              <TableHead>手机号</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>所属门店</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="w-24">启用</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffList.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                  暂无店员数据
                </TableCell>
              </TableRow>
            )}
            {staffList.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.phone}</TableCell>
                <TableCell>
                  <Badge variant={s.role === "ADMIN" ? "default" : "secondary"}>
                    {s.role === "ADMIN" ? "管理员" : "店员"}
                  </Badge>
                </TableCell>
                <TableCell>{s.store.name}</TableCell>
                <TableCell>
                  <Badge variant={s.isActive ? "default" : "outline"}>
                    {s.isActive ? "在职" : "停用"}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(s.createdAt).toLocaleDateString("zh-CN")}</TableCell>
                <TableCell>
                  <Switch
                    checked={s.isActive}
                    disabled={toggling === s.id}
                    onCheckedChange={() => handleToggle(s.id, s.isActive)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增店员</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>姓名 *</Label>
              <Input
                placeholder="店员姓名"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>手机号 *</Label>
              <Input
                placeholder="登录账号将为：手机号@fastcat.com"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <p className="text-xs text-gray-400">默认密码：FastCat123456</p>
            </div>
            <div className="space-y-1.5">
              <Label>角色 *</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: (v ?? "STAFF") as "ADMIN" | "STAFF" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STAFF">店员</SelectItem>
                  <SelectItem value="ADMIN">管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>所属门店 *</Label>
              <Select
                value={form.storeId}
                onValueChange={(v) => setForm({ ...form, storeId: v ?? "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择门店" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              取消
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? "创建中..." : "确认创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
