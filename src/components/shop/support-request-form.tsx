"use client";

import { FormEvent, useState } from "react";

type SupportRequestFormProps = {
  orderId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};

export function SupportRequestForm({ orderId, customerName, customerEmail, customerPhone }: SupportRequestFormProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/support-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        customerName,
        customerEmail,
        customerPhone,
        type: formData.get("type"),
        subject: formData.get("subject"),
        message: formData.get("message"),
      }),
    });
    const data = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setMessage(data.message ?? "Không thể gửi yêu cầu hỗ trợ.");
      return;
    }

    event.currentTarget.reset();
    setMessage(`Đã gửi yêu cầu #${data.requestId}. Admin sẽ kiểm tra trong trang quản trị.`);
  }

  return (
    <form onSubmit={handleSubmit} className="hm-surface mt-6 p-6">
      <h2 className="font-serif text-3xl">Bảo hành / đổi trả</h2>
      <p className="mt-2 text-sm text-ink/55 dark:text-ivory/60">Gửi yêu cầu gắn với đơn hàng này để admin xử lý khi demo.</p>
      <div className="mt-5 grid gap-3">
        <select name="type" className="hm-field h-11 bg-white dark:bg-white/10 dark:[color-scheme:dark]">
          <option value="WARRANTY">Yêu cầu bảo hành</option>
          <option value="RETURN">Yêu cầu đổi trả</option>
        </select>
        <input name="subject" required placeholder="Tiêu đề yêu cầu" className="hm-field h-11" />
        <textarea name="message" required rows={4} placeholder="Mô tả sản phẩm, lỗi gặp phải, tình trạng hộp/phụ kiện..." className="hm-field p-4" />
      </div>
      {message ? <p className="mt-3 text-sm text-ink/65 dark:text-ivory/70">{message}</p> : null}
      <button disabled={isSubmitting} className="hm-btn-primary mt-5 h-11 w-full sm:w-auto">
        {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
      </button>
    </form>
  );
}
