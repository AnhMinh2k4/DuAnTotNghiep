import Link from "next/link";

const highlights = [
  "Tư vấn thiết bị công nghệ theo nhu cầu sử dụng thực tế.",
  "Quy trình bán hàng rõ ràng, có theo dõi đơn và hóa đơn.",
  "Hỗ trợ sau mua về bảo hành, đổi trả, thanh toán và vận chuyển.",
];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-14 md:px-8">
      <p className="text-sm uppercase tracking-[0.24em] text-taupe dark:text-copper">Về chúng tôi</p>
      <h1 className="hm-page-title mt-3">TMDT Shop</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-ink/60 dark:text-ivory/65">
        TMDT Shop là mô hình thương mại điện tử chuyên cung cấp laptop, điện thoại, linh kiện và phụ kiện công nghệ. Cửa hàng tập trung vào trải nghiệm mua sắm dễ hiểu, thông tin minh bạch và hỗ trợ khách hàng nhanh chóng.
      </p>

      <section className="mt-12 grid gap-5 md:grid-cols-3">
        {highlights.map((item) => (
          <article key={item} className="rounded-3xl border border-ink/5 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/10">
            <p className="leading-7 text-ink/70 dark:text-ivory/70">{item}</p>
          </article>
        ))}
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/products" className="hm-btn-primary">Xem sản phẩm</Link>
        <Link href="/contact" className="hm-btn-secondary">Liên hệ shop</Link>
      </div>
    </main>
  );
}
