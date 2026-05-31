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

const paymentMapping = [
  { value: "UNPAID", label: "Chưa thanh toán" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
];

type Option = {
  id: number;
  name: string;
};

type OrderFulfillmentFormProps = {
  orderId: number;
  status: string;
  paymentStatus: string;
  shipperId?: number | null;
  provinceId?: number | null;
  shippers: Option[];
  provinces: Option[];
};

export function OrderFulfillmentForm({
  orderId,
  status,
  paymentStatus,
  shipperId,
  provinceId,
  shippers,
  provinces,
}: OrderFulfillmentFormProps) {
  const router = useRouter();
  const [values, setValues] = useState({
    status,
    paymentStatus,
    shipperId: shipperId ? String(shipperId) : "",
    provinceId: provinceId ? String(provinceId) : "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const canEditDelivery = values.status === "PENDING" || values.status === "CONFIRMED";

  async function save(nextValues: typeof values) {
    setIsSaving(true);

    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: nextValues.status,
        paymentStatus: nextValues.paymentStatus,
        shipperId: nextValues.shipperId || null,
        provinceId: nextValues.provinceId || null,
      }),
    });

    setIsSaving(false);

    if (!response.ok) {
      setValues({
        status,
        paymentStatus,
        shipperId: shipperId ? String(shipperId) : "",
        provinceId: provinceId ? String(provinceId) : "",
      });
      return;
    }

    router.refresh();
  }

  function handleChange(key: keyof typeof values, value: string) {
    const nextValues = { ...values, [key]: value };
    setValues(nextValues);
    void save(nextValues);
  }

  const selectClass = "h-10 w-full min-w-0 appearance-none rounded-xl border border-ink/10 bg-white px-4 pr-10 text-xs font-bold text-ink outline-none transition-all focus:border-copper disabled:opacity-50 dark:border-white/10 dark:bg-zinc-900 dark:text-ivory dark:[color-scheme:dark]";

  return (
    <div className="grid w-full gap-3 sm:grid-cols-2 lg:min-w-[520px]">
      <label className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-ink/45 dark:text-ivory/60">Trạng thái đơn</span>
        <select value={values.status} disabled={isSaving} onChange={(event) => handleChange("status", event.target.value)} className={selectClass}>
          {statusMapping.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </label>
      <label className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-ink/45 dark:text-ivory/60">Thanh toán</span>
        <select value={values.paymentStatus} disabled={isSaving} onChange={(event) => handleChange("paymentStatus", event.target.value)} className={selectClass}>
          {paymentMapping.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </label>
      <label className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-ink/45 dark:text-ivory/60">Shipper</span>
        <select value={values.shipperId} disabled={isSaving || !canEditDelivery} onChange={(event) => handleChange("shipperId", event.target.value)} className={selectClass}>
          <option value="">Chưa gán</option>
          {shippers.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </label>
      <label className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-ink/45 dark:text-ivory/60">Tỉnh/thành</span>
        <select value={values.provinceId} disabled={isSaving || !canEditDelivery} onChange={(event) => handleChange("provinceId", event.target.value)} className={selectClass}>
          <option value="">Chưa gán</option>
          {provinces.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </label>
      {!canEditDelivery ? (
        <p className="text-[10px] font-medium text-ink/45 dark:text-ivory/55 sm:col-span-2">
          Thông tin giao hàng đã khóa khi đơn ở trạng thái đang giao, hoàn tất hoặc đã hủy.
        </p>
      ) : null}
    </div>
  );
}
