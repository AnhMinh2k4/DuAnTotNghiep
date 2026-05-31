import Link from "next/link";

const paymentMethods = [
  {
    title: "Thanh toán khi nhận hàng",
    description: "Khách hàng thanh toán trực tiếp cho nhân viên giao hàng sau khi kiểm tra thông tin đơn.",
  },
  {
    title: "Chuyển khoản ngân hàng",
    description: "Đơn hàng sẽ được ghi nhận thanh toán sau khi hệ thống xác nhận giao dịch thành công.",
  },
  {
    title: "Hóa đơn và xác nhận",
    description: "Thông tin thanh toán được lưu trong chi tiết đơn hàng để khách hàng theo dõi và in hóa đơn khi cần.",
  },
];

export default function PaymentPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 md:px-8">
      <p className="text-sm uppercase tracking-[0.24em] text-taupe dark:text-copper">Hỗ trợ khách hàng</p>
      <h1 className="hm-page-title mt-3">Phương thức thanh toán</h1>
      <p className="mt-5 max-w-2xl leading-7 text-ink/60 dark:text-ivory/65">
        TMDT Shop hiện hỗ trợ các phương thức thanh toán phù hợp với quy trình đặt hàng trực tuyến của cửa hàng.
      </p>

      <section className="mt-10 grid gap-5 md:grid-cols-3">
        {paymentMethods.map((method) => (
          <article key={method.title} className="rounded-3xl border border-ink/5 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/10">
            <h2 className="font-serif text-xl text-ink dark:text-ivory">{method.title}</h2>
            <p className="mt-4 text-sm leading-7 text-ink/60 dark:text-ivory/65">{method.description}</p>
          </article>
        ))}
      </section>

      <Link href="/checkout" className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-bold text-ivory transition-colors hover:bg-copper dark:bg-ivory dark:text-ink dark:hover:bg-copper dark:hover:text-white">
        Đi tới thanh toán
      </Link>
    </main>
  );
}
