import { ContactForm } from "@/components/shop/contact-form";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-12 md:px-8">
      <div className="mb-8 border-b border-ink/10 pb-8 dark:border-white/10">
        <p className="text-sm uppercase tracking-[0.24em] text-taupe dark:text-copper">Hỗ trợ</p>
        <h1 className="hm-page-title mt-3">Câu hỏi và ý kiến</h1>
        <p className="mt-4 max-w-2xl leading-7 text-ink/60 dark:text-ivory/65">
          Khách hàng có thể gửi câu hỏi về sản phẩm, đơn hàng, bảo hành hoặc góp ý cho TMDT Shop.
        </p>
      </div>
      <ContactForm />
    </main>
  );
}
