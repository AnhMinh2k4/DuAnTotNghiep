"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PasswordField } from "@/components/common/password-field";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });
    const data = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(data.message ?? "Không thể đăng nhập.");
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md rounded-lg border border-ivory/10 bg-white p-5 text-ink shadow-soft dark:border-white/10 dark:bg-zinc-900 dark:text-ivory sm:p-8">
      <p className="hm-kicker">Administrator</p>
      <h1 className="mt-3 font-serif text-3xl sm:text-4xl">Đăng nhập quản trị</h1>
      <p className="mt-3 text-sm leading-6 text-ink/60 dark:text-ivory/65">Sử dụng tài khoản được cấp quyền để vào CMS.</p>
      <div className="mt-8 grid gap-4">
        <input
          name="email"
          type="email"
          defaultValue="admin@tmdtshop.local"
          required
          className="hm-field h-12"
          placeholder="Email"
        />
        <PasswordField
          name="password"
          defaultValue="admin123"
          required
          placeholder="Mật khẩu"
        />
      </div>
      {error ? <p className="mt-4 text-sm text-red-600 dark:text-red-300">{error}</p> : null}
      <button disabled={isSubmitting} className="hm-btn-primary mt-6 h-12 w-full">
        {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
