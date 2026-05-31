"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReviewEligibility } from "@/lib/reviews";

type ReviewFormProps = {
  productId: number;
  eligibility: ReviewEligibility;
};

export function ReviewForm({ productId, eligibility }: ReviewFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    setIsSubmitting(true);
    const response = await fetch(`/api/products/${productId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: Number(formData.get("rating")),
        comment: String(formData.get("comment") ?? "").trim(),
      }),
    });
    const data = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(data.message ?? "Không thể gửi đánh giá.");
      return;
    }

    setMessage("Đã lưu đánh giá của bạn.");
    router.refresh();
  }

  if (!eligibility.canReview) {
    return (
      <div className="mt-5 rounded-xl border border-ink/10 bg-porcelain p-5 text-sm leading-6 text-ink/65 dark:border-white/10 dark:bg-white/5 dark:text-ivory/70">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-copper">Chưa mở đánh giá</p>
        <p>{eligibility.message}</p>
        <p className="mt-2">Điều kiện: đơn hàng phải ở trạng thái Đã hoàn thành và email đơn hàng trùng với tài khoản đang đăng nhập.</p>
        {eligibility.status === "guest" ? (
          <Link href="/login" className="mt-3 inline-flex font-semibold text-copper transition hover:text-ink dark:hover:text-ivory">
            Đăng nhập để đánh giá
          </Link>
        ) : (
          <Link href="/account/orders" className="mt-3 inline-flex font-semibold text-copper transition hover:text-ink dark:hover:text-ivory">
            Xem đơn hàng của tôi
          </Link>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 grid gap-3 rounded-xl border border-ink/10 bg-porcelain p-5 dark:border-white/10 dark:bg-white/5">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-copper">Phản hồi sau mua</p>
      <p className="text-sm text-ink/55 dark:text-ivory/60">{eligibility.message}</p>
      <select name="rating" defaultValue="5" className="hm-field h-11 dark:[color-scheme:dark]">
        <option value="5">5 sao</option>
        <option value="4">4 sao</option>
        <option value="3">3 sao</option>
        <option value="2">2 sao</option>
        <option value="1">1 sao</option>
      </select>
      <textarea name="comment" rows={4} placeholder="Bạn thích điểm nào? Chất lượng, giao hàng, đóng gói hay trải nghiệm sử dụng?" className="hm-field p-3" />
      {error ? <p className="text-sm text-red-600 dark:text-red-300">{error}</p> : null}
      {message ? <p className="text-sm text-green-700 dark:text-sage">{message}</p> : null}
      <button disabled={isSubmitting} className="hm-btn-primary w-full sm:w-auto">
        {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
      </button>
    </form>
  );
}
