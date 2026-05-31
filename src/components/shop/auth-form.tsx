"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PasswordField } from "@/components/common/password-field";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setErrorCode("");

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";

    setIsSubmitting(true);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(data.message ?? "Không thể xử lý yêu cầu.");
      setErrorCode(typeof data.code === "string" ? data.code : "");
      return;
    }

    router.push(searchParams.get("next") ?? "/account");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="hm-surface-lift mx-auto max-w-xl p-5 sm:p-8">
      <p className="hm-kicker">Tài khoản</p>
      <h1 className="mt-3 font-serif text-3xl sm:text-4xl">{isRegister ? "Đăng ký khách hàng" : "Đăng nhập"}</h1>
      <p className="mt-3 text-sm leading-6 text-ink/60 dark:text-ivory/65">
        {isRegister ? "Tạo tài khoản để theo dõi đơn hàng và đánh giá sản phẩm đã mua." : "Đăng nhập để xem lịch sử đơn hàng và thanh toán nhanh hơn."}
      </p>
      <div className="mt-7 grid gap-4">
        {isRegister ? (
          <input name="name" required placeholder="Họ và tên" className="hm-field h-12" />
        ) : null}
        <input name="email" type="email" required placeholder="Email" className="hm-field h-12" />
        <PasswordField name="password" required minLength={6} placeholder="Mật khẩu" />
        {isRegister ? (
          <>
            <input name="phone" placeholder="Số điện thoại" className="hm-field h-12" />
            <textarea name="address" rows={3} placeholder="Địa chỉ mặc định" className="hm-field p-4" />
          </>
        ) : null}
      </div>
      {error ? (
        errorCode === "ACCOUNT_LOCKED" ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm dark:border-red-400/25 dark:bg-red-500/10 dark:text-red-100">
            <p className="font-bold">Tài khoản đang bị tạm khóa</p>
            <p className="mt-1 leading-6">{error}</p>
            <Link href="/contact" className="mt-3 inline-flex font-bold text-copper hover:text-ink dark:hover:text-ivory">
              Liên hệ shop để được hỗ trợ
            </Link>
          </div>
        ) : (
          <p className="mt-4 text-sm text-red-600 dark:text-red-300">{error}</p>
        )
      ) : null}
      <button disabled={isSubmitting} className="hm-btn-primary mt-6 h-12 w-full">
        {isSubmitting ? "Đang xử lý..." : isRegister ? "Tạo tài khoản" : "Đăng nhập"}
      </button>
      <p className="mt-5 text-sm text-ink/60 dark:text-ivory/65">
        {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
        <Link href={isRegister ? "/login" : "/register"} className="font-semibold text-ink hover:text-copper dark:text-ivory dark:hover:text-copper">
          {isRegister ? "Đăng nhập" : "Đăng ký"}
        </Link>
      </p>
    </form>
  );
}
