import { CheckoutForm } from "@/components/shop/checkout-form";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CheckoutPage() {
  const [user, provinces] = await Promise.all([
    getCurrentUser(),
    prisma.province.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-5 py-12 md:px-8">
      <div className="mb-8 border-b border-ink/10 pb-8">
        <p className="text-sm uppercase tracking-[0.24em] text-taupe">Checkout</p>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Thanh toán</h1>
      </div>
      <CheckoutForm user={user} provinces={provinces} />
    </main>
  );
}
