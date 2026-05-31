"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Check, KeyRound, MessageCircle, Shield, UserRound } from "lucide-react";
import { PasswordField } from "@/components/common/password-field";
import { ThemeToggle } from "@/components/common/theme-toggle";

export function AccountSettingsPanel({ avatarUrl, name }: { avatarUrl: string | null; name: string }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSaving(true);

    const response = await fetch("/api/auth/me/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await response.json().catch(() => ({}));
    setIsSaving(false);

    if (!response.ok) {
      setError(data.message ?? "Không thể đổi mật khẩu.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setMessage("Đã đổi mật khẩu.");
  }

  return (
    <section className="hm-surface p-6 sm:p-7">
      <div className="flex items-start gap-4">
        <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-ink text-lg font-bold text-ivory dark:bg-ivory dark:text-ink">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-copper">Cài đặt cá nhân</p>
          <h2 className="mt-2 font-serif text-3xl">Tùy chọn tài khoản</h2>
          <p className="mt-2 text-sm leading-6 text-ink/55 dark:text-ivory/60">Đổi giao diện, cập nhật avatar trong hồ sơ và gửi câu hỏi cho shop.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        <div className="flex items-center justify-between rounded-2xl border border-ink/5 bg-porcelain/60 p-4 dark:border-white/10 dark:bg-white/[0.06]">
          <div className="flex items-center gap-3">
            <Shield size={18} className="text-copper" />
            <div>
              <p className="text-sm font-bold">Giao diện sáng/tối</p>
              <p className="text-xs text-ink/50 dark:text-ivory/55">Cài đặt hiển thị được đặt trong tài khoản.</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <Link href="/contact" className="flex items-center justify-between rounded-2xl border border-ink/5 bg-porcelain/60 p-4 transition-colors hover:border-copper/30 hover:bg-white dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/10">
          <span className="flex items-center gap-3">
            <MessageCircle size={18} className="text-copper" />
            <span>
              <span className="block text-sm font-bold">Câu hỏi và ý kiến</span>
              <span className="block text-xs text-ink/50 dark:text-ivory/55">Gửi yêu cầu hỗ trợ cho shop.</span>
            </span>
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-copper">Mở</span>
        </Link>

        <div className="rounded-2xl border border-ink/5 bg-porcelain/60 p-4 dark:border-white/10 dark:bg-white/[0.06]">
          <div className="flex items-center gap-3">
            <UserRound size={18} className="text-copper" />
            <div>
              <p className="text-sm font-bold">Đổi avatar</p>
              <p className="text-xs text-ink/50 dark:text-ivory/55">Nhập URL ảnh đại diện trong khung Thông tin cá nhân.</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4 border-t border-ink/5 pt-6 dark:border-white/10">
        <div className="flex items-center gap-3">
          <KeyRound size={18} className="text-copper" />
          <h3 className="font-serif text-2xl">Đổi mật khẩu</h3>
        </div>
        <PasswordField value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Mật khẩu hiện tại" inputClassName="hm-field w-full" />
        <PasswordField value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Mật khẩu mới" inputClassName="hm-field w-full" minLength={6} />
        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-200">{error}</p> : null}
        {message ? <p className="rounded-xl bg-sage/10 px-4 py-3 text-xs font-semibold text-sage"><Check size={14} className="mr-1 inline" />{message}</p> : null}
        <button disabled={isSaving} className="hm-btn-primary h-11 w-full px-5 text-xs">
          {isSaving ? "Đang lưu" : "Đổi mật khẩu"}
        </button>
      </form>
    </section>
  );
}
