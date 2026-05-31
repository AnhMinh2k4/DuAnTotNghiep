import Link from "next/link";

const returnItems = [
  "Sản phẩm có thể đổi trả trong 7 ngày kể từ khi nhận hàng nếu còn nguyên tem, hộp, phụ kiện và chưa có dấu hiệu sử dụng sai cách.",
  "TMDT Shop hỗ trợ đổi mới khi sản phẩm giao sai mẫu, thiếu phụ kiện hoặc phát sinh lỗi kỹ thuật ngay khi nhận hàng.",
  "Sản phẩm đổi trả cần được gửi kèm hóa đơn, mã đơn hàng hoặc thông tin mua hàng để đối soát.",
  "Chi phí vận chuyển đổi trả sẽ được thông báo sau khi đội ngũ hỗ trợ xác nhận nguyên nhân và tình trạng sản phẩm.",
];

export default function ReturnsPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 md:px-8">
      <p className="text-sm uppercase tracking-[0.24em] text-taupe dark:text-copper">Hỗ trợ khách hàng</p>
      <h1 className="hm-page-title mt-3">Đổi trả sản phẩm</h1>
      <p className="mt-5 max-w-2xl leading-7 text-ink/60 dark:text-ivory/65">
        Chính sách đổi trả giúp khách hàng yên tâm hơn khi mua sắm thiết bị công nghệ tại TMDT Shop.
      </p>

      <section className="mt-10 grid gap-4">
        {returnItems.map((item) => (
          <div key={item} className="rounded-2xl border border-ink/5 bg-white p-5 leading-7 text-ink/70 shadow-soft dark:border-white/10 dark:bg-white/10 dark:text-ivory/70">
            {item}
          </div>
        ))}
      </section>

      <Link href="/account/orders" className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-bold text-ivory transition-colors hover:bg-copper dark:bg-ivory dark:text-ink dark:hover:bg-copper dark:hover:text-white">
        Xem đơn hàng của tôi
      </Link>
    </main>
  );
}
