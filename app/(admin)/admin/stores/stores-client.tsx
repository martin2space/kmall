"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createStore, deleteStore } from "./actions";

type Store = {
  id: string;
  name: string;
  city: string;
  address: string | null;
  createdAt: Date;
};

export default function StoresClient({ stores }: { stores: Store[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", city: "", address: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate() {
    setFormError("");
    setSubmitting(true);
    const result = await createStore(form);
    setSubmitting(false);
    if (result.error) { setFormError(result.error); return; }
    setShowAdd(false);
    setForm({ name: "", city: "", address: "" });
  }

  async function handleDelete() {
    if (!deletingId) return;
    const result = await deleteStore(deletingId);
    setDeletingId(null);
    if (result.error) alert(result.error);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">门店管理</h1>
        <Button onClick={() => setShowAdd(true)}>新增门店</Button>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>门店名称</TableHead>
              <TableHead>城市</TableHead>
              <TableHead>地址</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="w-20">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                  暂无门店数据
                </TableCell>
              </TableRow>
            )}
            {stores.map((store) => (
              <TableRow key={store.id}>
                <TableCell className="font-medium">{store.name}</TableCell>
                <TableCell>{store.city}</TableCell>
                <TableCell>{store.address ?? "—"}</TableCell>
                <TableCell>{new Date(store.createdAt).toLocaleDateString("zh-CN")}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeletingId(store.id)}
                  >
                    删除
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 新增弹窗 */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增门店</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>门店名称 *</Label>
              <Input
                placeholder="如：快猫女装清远店"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>城市 *</Label>
              <Input
                placeholder="如：清远"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>地址（选填）</Label>
              <Input
                placeholder="详细地址"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
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

      {/* 删除确认 */}
      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除？</AlertDialogTitle>
            <AlertDialogDescription>
              删除后不可恢复，且该门店下所有关联数据将无法操作。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
