"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

export default function ProfileClient({
  name,
  phone,
  storeName,
  role,
}: {
  name: string;
  phone: string;
  storeName: string;
  role: string;
}) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changing, setChanging] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function handleChangePassword() {
    if (!oldPassword || !newPassword) {
      setMsg({ type: "error", text: "请填写旧密码和新密码" });
      return;
    }
    if (newPassword.length < 6) {
      setMsg({ type: "error", text: "新密码至少 6 位" });
      return;
    }

    setChanging(true);
    setMsg(null);

    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: `${phone}@fastcat.com`,
      password: oldPassword,
    });

    if (signInError) {
      setChanging(false);
      setMsg({ type: "error", text: "旧密码不正确" });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChanging(false);

    if (error) {
      setMsg({ type: "error", text: error.message });
    } else {
      setMsg({ type: "success", text: "密码修改成功" });
      setOldPassword("");
      setNewPassword("");
      setShowPasswordForm(false);
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-semibold">个人信息</h1>

      <div className="bg-white rounded-xl border divide-y">
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-sm text-gray-500">姓名</span>
          <span className="text-sm font-medium">{name}</span>
        </div>
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-sm text-gray-500">手机号</span>
          <span className="text-sm">{phone}</span>
        </div>
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-sm text-gray-500">所属门店</span>
          <span className="text-sm">{storeName}</span>
        </div>
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-sm text-gray-500">角色</span>
          <Badge variant="outline">{role === "ADMIN" ? "管理员" : "店员"}</Badge>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-medium">修改密码</h2>
          <button
            className="text-xs text-primary"
            onClick={() => {
              setShowPasswordForm((v) => !v);
              setMsg(null);
              setOldPassword("");
              setNewPassword("");
            }}
          >
            {showPasswordForm ? "取消" : "修改"}
          </button>
        </div>

        {showPasswordForm && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">旧密码</Label>
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="输入当前密码"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">新密码</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="输入新密码（至少 6 位）"
              />
            </div>
            {msg && (
              <p
                className={`text-xs ${
                  msg.type === "error" ? "text-red-500" : "text-green-600"
                }`}
              >
                {msg.text}
              </p>
            )}
            <Button
              onClick={handleChangePassword}
              disabled={changing}
              className="w-full"
              size="sm"
            >
              {changing ? "修改中..." : "确认修改"}
            </Button>
          </div>
        )}
      </div>

      <Button variant="outline" className="w-full" onClick={handleLogout}>
        退出登录
      </Button>
    </div>
  );
}
