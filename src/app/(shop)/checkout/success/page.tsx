import Link from "next/link";

type CheckoutSuccessPageProps = {
  searchParams?: Promise<{
    order?: string;
  }>;
};

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto max-w-3xl px-5 py-16 text-center md:px-8">
      <div className="hm-surface p-8 md:p-12">
        <p className="text-sm uppercase tracking-[0.24em] text-taupe dark:text-copper">Đã nhận đơn</p>
        <h1 className="hm-page-title mt-4">Đặt hàng thành công</h1>
        <p className="mt-5 leading-8 text-ink/65 dark:text-ivory/70">
          Cảm ơn bạn đã mua sắm tại TMDT Shop. Đơn hàng của bạn đã được ghi nhận và đang chờ admin xác nhận.
        </p>
        {params?.order ? (
          <p className="mt-5 text-sm text-ink/55 dark:text-ivory/60">Mã đơn hàng: TS-{params.order.padStart(5, "0")}</p>
        ) : null}
        <p className="mt-5 text-sm text-ink/55 dark:text-ivory/60">Bạn có thể đánh giá sản phẩm trong chi tiết đơn hàng sau khi đơn được chuyển sang Hoàn thành.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/account/orders" className="hm-btn-secondary inline-flex h-12 w-full sm:w-auto">
            Xem đơn hàng
          </Link>
          <Link href="/products" className="hm-btn-primary inline-flex h-12 w-full sm:w-auto">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </main>
  );
}
