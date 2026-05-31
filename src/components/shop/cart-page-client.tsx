"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { getCartItemKey, useCartStore } from "@/store/cart-store";

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function CartPageClient() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="hm-surface-lift mx-auto max-w-3xl p-8 text-center">
        <h1 className="font-serif text-4xl">Giỏ hàng đang trống</h1>
        <p className="mt-4 text-ink/60 dark:text-ivory/65">Hãy chọn một sản phẩm yêu thích để bắt đầu đơn hàng.</p>
        <Link href="/products" className="hm-btn-primary mt-8 h-12">
          Mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        {items.map((item) => {
          const key = getCartItemKey(item);
          return (
            <article key={key} className="hm-surface grid grid-cols-[92px_minmax(0,1fr)] gap-4 p-4 sm:grid-cols-[120px_1fr_auto]">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-linen dark:bg-zinc-800">
                <Image src={item.imageUrl} alt={item.name} fill sizes="120px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <Link href={`/products/${item.slug}`} className="break-words font-serif text-xl leading-snug sm:text-2xl">
                  {item.name}
                </Link>
                {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 ? (
                  <p className="mt-2 text-sm text-ink/55 dark:text-ivory/60">
                    {Object.entries(item.selectedOptions).map(([name, value]) => `${name}: ${value}`).join(" / ")}
                  </p>
                ) : null}
                {item.variantSku ? <p className="mt-2 break-all text-xs font-bold uppercase tracking-widest text-ink/35 dark:text-ivory/45">SKU biến thể: {item.variantSku}</p> : null}
                <p className="mt-3 text-ink/70 dark:text-ivory/75">{formatVnd(item.price)}</p>
                <div className="mt-4 inline-flex items-center rounded-lg border border-ink/10 bg-white dark:border-white/10 dark:bg-white/10">
                  <button type="button" onClick={() => updateQuantity(key, item.quantity - 1)} className="grid size-10 place-items-center transition hover:bg-ivory dark:hover:bg-white/10" aria-label="Giảm số lượng">
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center">{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(key, item.quantity + 1)} className="grid size-10 place-items-center transition hover:bg-ivory dark:hover:bg-white/10" aria-label="Tăng số lượng">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <button type="button" onClick={() => removeItem(key)} className="col-span-2 grid size-10 place-items-center justify-self-end text-ink/45 transition hover:text-ink dark:text-ivory/55 dark:hover:text-red-300 sm:col-span-1 sm:justify-self-auto" aria-label="Xóa sản phẩm">
                <Trash2 size={18} />
              </button>
            </article>
          );
        })}
      </div>
      <aside className="hm-surface-lift p-6 lg:sticky lg:top-28 lg:self-start">
        <h2 className="font-serif text-3xl">Tóm tắt đơn hàng</h2>
        <div className="mt-6 space-y-4 border-y border-ink/10 py-5 dark:border-white/10">
          <div className="flex justify-between text-ink/65 dark:text-ivory/70">
            <span>Tạm tính</span>
            <span>{formatVnd(subtotal)}</span>
          </div>
          <div className="flex justify-between text-ink/65 dark:text-ivory/70">
            <span>Phí giao hàng</span>
            <span>0 VND</span>
          </div>
          <div className="flex items-start justify-between gap-4 text-lg font-semibold">
            <span>Tổng cộng</span>
            <span className="text-right">{formatVnd(subtotal)}</span>
          </div>
        </div>
        <Link href="/checkout" className="hm-btn-primary mt-6 h-12 w-full">
          Thanh toán COD
        </Link>
      </aside>
    </div>
  );
}
