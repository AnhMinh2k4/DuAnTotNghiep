import { CartPageClient } from "@/components/shop/cart-page-client";

export default function CartPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-12 md:px-8">
      <div className="mb-8 border-b border-ink/10 pb-8">
        <p className="text-sm uppercase tracking-[0.24em] text-taupe">Giỏ hàng</p>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Giỏ hàng</h1>
      </div>
      <CartPageClient />
    </main>
  );
}
