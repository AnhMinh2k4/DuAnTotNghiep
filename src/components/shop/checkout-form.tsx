"use client";

import { FormEvent, MouseEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import type { CheckoutPayload } from "@/types/cart";

type CheckoutFormProps = {
  user?: {
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
  } | null;
  provinces: Array<{
    id: number;
    name: string;
  }>;
};

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function CheckoutForm({ user, provinces }: CheckoutFormProps) {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const [error, setError] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [provinceId, setProvinceId] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const subtotal = useMemo(() => items.reduce((total, item) => total + item.price * item.quantity, 0), [items]);
  const total = Math.max(subtotal + shippingFee - couponDiscount, 0);

  useEffect(() => {
    let cancelled = false;

    async function quoteShipping() {
      if (!provinceId || items.length === 0) {
        setShippingFee(0);
        return;
      }

      const response = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provinceId, subtotal }),
      });
      const data = await response.json();

      if (!cancelled) {
        setShippingFee(response.ok ? Number(data.shippingFee ?? 0) : 0);
      }
    }

    void quoteShipping();
    return () => {
      cancelled = true;
    };
  }, [items.length, provinceId, subtotal]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (items.length === 0) {
      setError("Giỏ hàng đang trống.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const payload: CheckoutPayload = {
      customerName: String(formData.get("customerName") ?? "").trim(),
      customerEmail: String(formData.get("customerEmail") ?? "").trim(),
      customerPhone: String(formData.get("customerPhone") ?? "").trim(),
      provinceId: Number(formData.get("provinceId") ?? 0),
      shippingAddress: String(formData.get("shippingAddress") ?? "").trim(),
      paymentMethod: formData.get("paymentMethod") === "BANK_TRANSFER" ? "BANK_TRANSFER" : "COD",
      note: String(formData.get("note") ?? "").trim(),
      couponCode: String(formData.get("couponCode") ?? "").trim(),
      items: items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        selectedOptions: item.selectedOptions,
        quantity: item.quantity,
      })),
    };

    setIsSubmitting(true);
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(data.message ?? "Không thể tạo đơn hàng.");
      return;
    }

    clearCart();
    router.push(`/checkout/success?order=${data.orderId}`);
  }

  async function handleValidateCoupon(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setError("");
    setCouponMessage("");
    setCouponDiscount(0);

    const form = event.currentTarget.form;
    if (!form) {
      return;
    }

    const code = String(new FormData(form).get("couponCode") ?? "").trim();
    if (!code) {
      setCouponMessage("Nhập mã giảm giá nếu có.");
      return;
    }

    const response = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, subtotal }),
    });
    const data = await response.json();

    if (!response.ok) {
      setCouponMessage(data.message ?? "Mã giảm giá không hợp lệ.");
      return;
    }

    setCouponDiscount(Number(data.coupon.discountTotal ?? 0));
    setCouponMessage(`Đã áp dụng ${data.coupon.code}.`);
  }

  if (items.length === 0) {
    return (
      <div className="hm-surface-lift p-8 text-center">
        <h1 className="font-serif text-4xl">Chưa có sản phẩm để thanh toán</h1>
        <Link href="/products" className="hm-btn-primary mt-8 h-12">
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <section className="hm-surface p-5 sm:p-6">
        <h2 className="font-serif text-3xl">Thông tin giao hàng</h2>
        <div className="mt-6 grid gap-4">
          <input name="customerName" required defaultValue={user?.name ?? ""} placeholder="Họ và tên" className="hm-field h-12" />
          <input name="customerEmail" type="email" required defaultValue={user?.email ?? ""} placeholder="Email" className="hm-field h-12" />
          <input name="customerPhone" required defaultValue={user?.phone ?? ""} placeholder="Số điện thoại" className="hm-field h-12" />
          <select
            name="provinceId"
            required
            defaultValue=""
            onChange={(event) => setProvinceId(Number(event.target.value))}
            className="hm-field h-12 bg-white dark:bg-white/10 dark:[color-scheme:dark]"
          >
            <option value="">Chọn tỉnh/thành giao hàng</option>
            {provinces.map((province) => (
              <option key={province.id} value={province.id}>{province.name}</option>
            ))}
          </select>
          <textarea name="shippingAddress" required defaultValue={user?.address ?? ""} placeholder="Địa chỉ chi tiết: số nhà, đường, phường/xã, quận/huyện..." rows={4} className="hm-field p-4" />
          <div className="rounded-xl border border-ink/10 bg-porcelain p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-semibold uppercase tracking-[0.16em]">Phương thức thanh toán</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer gap-3 rounded-lg border border-ink/10 bg-white p-4 text-sm transition hover:border-copper dark:border-white/10 dark:bg-white/5">
                <input type="radio" name="paymentMethod" value="COD" defaultChecked className="mt-1" />
                <span>
                  <span className="block font-semibold">COD</span>
                  <span className="mt-1 block text-ink/55 dark:text-ivory/60">Thanh toán khi nhận hàng.</span>
                </span>
              </label>
              <label className="flex cursor-pointer gap-3 rounded-lg border border-ink/10 bg-white p-4 text-sm transition hover:border-copper dark:border-white/10 dark:bg-white/5">
                <input type="radio" name="paymentMethod" value="BANK_TRANSFER" className="mt-1" />
                <span>
                  <span className="block font-semibold">Chuyển khoản demo</span>
                  <span className="mt-1 block text-ink/55 dark:text-ivory/60">Mô phỏng thanh toán điện tử, tự ghi nhận đã thanh toán.</span>
                </span>
              </label>
            </div>
          </div>
          <textarea name="note" placeholder="Ghi chú tùy chọn" rows={3} className="hm-field p-4" />
        </div>
      </section>
      <aside className="hm-surface-lift p-5 sm:p-6 lg:sticky lg:top-28 lg:self-start">
        <h2 className="font-serif text-3xl">Đơn hàng</h2>
        <div className="mt-5 space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}-${JSON.stringify(item.selectedOptions ?? {})}`} className="flex items-start justify-between gap-4 border-b border-ink/10 pb-4 text-sm dark:border-white/10">
              <div className="min-w-0">
                <p className="break-words font-semibold">{item.name}</p>
                {item.variantSku ? <p className="mt-1 break-all text-xs text-ink/45 dark:text-ivory/55">SKU biến thể: {item.variantSku}</p> : null}
                <p className="mt-1 text-ink/55 dark:text-ivory/60">Số lượng: {item.quantity}</p>
              </div>
              <p className="shrink-0 text-right">{formatVnd(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-start justify-between gap-4 text-lg font-semibold">
          <span>Tạm tính</span>
          <span className="text-right">{formatVnd(subtotal)}</span>
        </div>
        <div className="mt-3 flex items-start justify-between gap-4 text-sm text-ink/65 dark:text-ivory/70">
          <span>Phí vận chuyển</span>
          <span className="text-right">{provinceId ? formatVnd(shippingFee) : "Chọn tỉnh/thành"}</span>
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <input name="couponCode" placeholder="Mã giảm giá" className="hm-field h-11 min-w-0 flex-1" />
          <button onClick={handleValidateCoupon} className="hm-btn-secondary h-11 px-4 text-xs">
            Áp dụng
          </button>
        </div>
        {couponMessage ? <p className="mt-2 text-sm text-ink/55 dark:text-ivory/60">{couponMessage}</p> : null}
        {couponDiscount > 0 ? (
          <div className="mt-4 flex items-start justify-between gap-4 text-sm text-ink/65 dark:text-ivory/70">
            <span>Giảm giá</span>
            <span className="text-right">-{formatVnd(couponDiscount)}</span>
          </div>
        ) : null}
        <div className="mt-3 flex items-start justify-between gap-4 text-lg font-semibold">
          <span>Tổng cộng</span>
          <span className="text-right">{formatVnd(total)}</span>
        </div>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        <button disabled={isSubmitting} className="hm-btn-primary mt-6 h-12 w-full">
          {isSubmitting ? "Đang tạo đơn..." : "Đặt hàng"}
        </button>
      </aside>
    </form>
  );
}
