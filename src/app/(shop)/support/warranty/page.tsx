import Link from "next/link";

const warrantyItems = [
  "Sản phẩm được bảo hành theo thời hạn công bố trên từng trang chi tiết sản phẩm.",
  "Bảo hành áp dụng cho lỗi kỹ thuật từ nhà sản xuất, không áp dụng cho hư hỏng do rơi vỡ, vào nước, cháy nổ hoặc tự ý tháo sửa.",
  "Khách hàng vui lòng giữ hóa đơn hoặc thông tin đơn hàng để TMDT Shop kiểm tra lịch sử mua hàng.",
  "Thời gian tiếp nhận và xử lý bảo hành thông thường từ 3 đến 15 ngày làm việc tùy tình trạng sản phẩm.",
];

export default function WarrantyPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 md:px-8">
      <p className="text-sm uppercase tracking-[0.24em] text-taupe dark:text-copper">Hỗ trợ khách hàng</p>
      <h1 className="hm-page-title mt-3">Chính sách bảo hành</h1>
      <p className="mt-5 max-w-2xl leading-7 text-ink/60 dark:text-ivory/65">
        TMDT Shop hỗ trợ kiểm tra, tiếp nhận và chuyển bảo hành cho các sản phẩm còn đủ điều kiện theo chính sách của hãng.
      </p>

      <section className="mt-10 space-y-4 rounded-3xl border border-ink/5 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-white/10 md:p-8">
        {warrantyItems.map((item, index) => (
          <div key={item} className="flex gap-4">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-copper/10 text-sm font-bold text-copper">{index + 1}</span>
            <p className="leading-7 text-ink/70 dark:text-ivory/70">{item}</p>
          </div>
        ))}
      </section>

      <Link href="/contact" className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-bold text-ivory transition-colors hover:bg-copper dark:bg-ivory dark:text-ink dark:hover:bg-copper dark:hover:text-white">
        Gửi yêu cầu hỗ trợ
      </Link>
    </main>
  );
}
