"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type OrderCancelButtonProps = {
  orderId: number;
};

export function OrderCancelButton({ orderId }: OrderCancelButtonProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCancel() {
    setError("");
    setIsSubmitting(true);
    const response = await fetch(`/api/account/orders/${orderId}/cancel`, { method: "PATCH" });
    const data = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(data.message ?? "Không thể hủy đơn hàng.");
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <button disabled={isSubmitting} onClick={handleCancel} className="h-11 rounded-lg border border-red-200 bg-white px-5 text-sm font-semibold uppercase tracking-[0.12em] text-red-700 transition hover:-translate-y-0.5 hover:bg-red-50 disabled:translate-y-0 disabled:opacity-60 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/15">
        {isSubmitting ? "Đang hủy..." : "Hủy đơn"}
      </button>
      {error ? <p className="mt-2 text-sm text-red-600 dark:text-red-300">{error}</p> : null}
    </div>
  );
}
