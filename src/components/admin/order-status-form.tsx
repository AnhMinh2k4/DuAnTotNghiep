"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statusMapping = [
  { value: "PENDING", label: "Đang chờ xử lý" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "SHIPPING", label: "Đang giao hàng" },
  { value: "COMPLETED", label: "Đã hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

type OrderStatusFormProps = {
  orderId: number;
  status: string;
};

export function OrderStatusForm({ orderId, status }: OrderStatusFormProps) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [isSaving, setIsSaving] = useState(false);

  async function handleChange(nextStatus: string) {
    setValue(nextStatus);
    setIsSaving(true);

    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    setIsSaving(false);

    if (!response.ok) {
      setValue(status);
      return;
    }

    router.refresh();
  }

  return (
    <label className="inline-flex w-full flex-col gap-2 sm:w-auto">
      <span className="text-[10px] font-bold uppercase tracking-widest text-ink/45 dark:text-ivory/60">Trạng thái đơn hàng</span>
      <select
        value={value}
        disabled={isSaving}
        onChange={(event) => handleChange(event.target.value)}
        className="h-10 w-full min-w-0 appearance-none rounded-xl border border-ink/10 bg-white px-4 pr-10 text-xs font-bold text-ink outline-none transition-all focus:border-copper disabled:opacity-50 dark:border-white/10 dark:bg-zinc-900 dark:text-ivory dark:[color-scheme:dark] sm:min-w-48"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(194,106,69,0.85)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
      >
        {statusMapping.map((item) => (
          <option key={item.value} value={item.value}>{item.label}</option>
        ))}
      </select>
    </label>
  );
}
