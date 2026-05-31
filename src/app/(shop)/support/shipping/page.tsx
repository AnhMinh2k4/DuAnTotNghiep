import Link from "next/link";

const shippingSteps = [
  {
    title: "Xác nhận đơn",
    description: "TMDT Shop kiểm tra thông tin người nhận, địa chỉ và tình trạng tồn kho trước khi đóng gói.",
  },
  {
    title: "Bàn giao vận chuyển",
    description: "Đơn hàng được chuyển cho đơn vị giao hàng hoặc nhân viên phụ trách theo khu vực.",
  },
  {
    title: "Theo dõi trạng thái",
    description: "Khách hàng có thể xem trạng thái giao hàng trong trang tài khoản và lịch sử đơn hàng.",
  },
];

export default function ShippingPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 md:px-8">
      <p className="text-sm uppercase tracking-[0.24em] text-taupe dark:text-copper">Hỗ trợ khách hàng</p>
      <h1 className="hm-page-title mt-3">Vận chuyển & Giao hàng</h1>
      <p className="mt-5 max-w-2xl leading-7 text-ink/60 dark:text-ivory/65">
        Cửa hàng hỗ trợ giao hàng theo thông tin khách hàng cung cấp khi đặt mua và cập nhật trạng thái trong hệ thống.
      </p>

      <section className="mt-10 space-y-5">
        {shippingSteps.map((step, index) => (
          <article key={step.title} className="flex gap-5 rounded-3xl border border-ink/5 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/10">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sage/10 text-sm font-bold text-sage">{index + 1}</span>
            <div>
              <h2 className="font-serif text-xl text-ink dark:text-ivory">{step.title}</h2>
              <p className="mt-2 text-sm leading-7 text-ink/60 dark:text-ivory/65">{step.description}</p>
            </div>
          </article>
        ))}
      </section>

      <Link href="/account/orders" className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-bold text-ivory transition-colors hover:bg-copper dark:bg-ivory dark:text-ink dark:hover:bg-copper dark:hover:text-white">
        Theo dõi đơn hàng
      </Link>
    </main>
  );
}
