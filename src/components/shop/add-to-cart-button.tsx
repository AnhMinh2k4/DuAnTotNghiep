"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

type AddToCartButtonProps = {
  product: {
    id: number;
    slug: string;
    name: string;
    imageUrl?: string;
    images?: { url: string }[];
    price: number;
    stock: number;
    variants?: Array<{
      id: number;
      name: string;
      sku: string;
      priceDelta: number;
      stock: number;
      options?: Record<string, string> | null;
    }>;
  };
};

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [variantId, setVariantId] = useState(product.variants?.[0]?.id ?? 0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const finalImageUrl = product.imageUrl || product.images?.[0]?.url || "";
  const selectedVariant = product.variants?.find((variant) => variant.id === variantId);
  const availableStock = selectedVariant?.stock ?? product.stock;
  const unitPrice = product.price + (selectedVariant?.priceDelta ?? 0);
  const canBuy = availableStock > 0;

  return (
    <div className="mt-8 space-y-6">
      {product.variants && product.variants.length > 0 ? (
        <div>
          <label htmlFor="variant" className="text-sm font-semibold uppercase tracking-[0.16em]">
            Biến thể
          </label>
          <select
            id="variant"
            value={variantId}
            onChange={(event) => {
              setVariantId(Number(event.target.value));
              setQuantity(1);
              setAdded(false);
            }}
            className="hm-field mt-3 h-11 w-full bg-ivory dark:bg-white/10 dark:[color-scheme:dark]"
          >
            {product.variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.name} - {variant.sku} - còn {variant.stock}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <label htmlFor="quantity" className="text-sm font-semibold uppercase tracking-[0.16em]">
            Số lượng
          </label>
          <div className="mt-3 inline-flex h-12 overflow-hidden rounded-xl border border-ink/10 bg-ivory dark:border-white/10 dark:bg-white/10">
            <button
              type="button"
              onClick={() => {
                setQuantity((current) => Math.max(1, current - 1));
                setAdded(false);
              }}
              className="grid w-12 place-items-center text-ink/55 transition hover:bg-white hover:text-ink dark:text-ivory/65 dark:hover:bg-white/10"
              aria-label="Giảm số lượng"
            >
              <Minus size={16} />
            </button>
            <input
              id="quantity"
              type="number"
              min={1}
              max={availableStock}
              value={quantity}
              onChange={(event) => {
                const nextQuantity = Number(event.target.value);
                setQuantity(Number.isFinite(nextQuantity) ? Math.max(1, Math.min(nextQuantity, Math.max(availableStock, 1))) : 1);
                setAdded(false);
              }}
              className="w-14 border-x border-ink/10 bg-transparent text-center text-sm font-bold outline-none dark:border-white/10"
            />
            <button
              type="button"
              onClick={() => {
                setQuantity((current) => Math.min(Math.max(availableStock, 1), current + 1));
                setAdded(false);
              }}
              className="grid w-12 place-items-center text-ink/55 transition hover:bg-white hover:text-ink dark:text-ivory/65 dark:hover:bg-white/10"
              aria-label="Tăng số lượng"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        <div className="rounded-2xl bg-porcelain px-4 py-3 text-sm text-ink/60 dark:bg-white/5 dark:text-ivory/65">
          Còn <span className="font-bold text-ink dark:text-ivory">{availableStock}</span> sản phẩm
        </div>
      </div>

      <button
        type="button"
        disabled={!canBuy}
        onClick={() => {
          addItem({
            productId: product.id,
            slug: product.slug,
            name: selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name,
            imageUrl: finalImageUrl,
            price: unitPrice,
            quantity: Math.max(1, Math.min(quantity, availableStock)),
            stock: availableStock,
            variantId: selectedVariant?.id,
            variantSku: selectedVariant?.sku,
            variantName: selectedVariant?.name,
            selectedOptions: selectedVariant?.options ?? undefined,
          });
          setAdded(true);
        }}
        className="hm-btn-primary h-14 w-full rounded-2xl disabled:cursor-not-allowed"
      >
        {added ? <Check size={18} /> : <ShoppingBag size={18} />}
        {!canBuy ? "Hết hàng" : added ? "Đã thêm vào giỏ" : "Thêm vào giỏ"}
      </button>
    </div>
  );
}
