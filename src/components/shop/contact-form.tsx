"use client";

import { FormEvent, useEffect, useState } from "react";

export function ContactForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjectValue, setSubjectValue] = useState("");
  const [messageValue, setMessageValue] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSubjectValue(params.get("subject") ?? "");
    setMessageValue(params.get("message") ?? "");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setMessage("");
    setError("");

    const formData = new FormData(form);
    const customerName = String(formData.get("customerName") ?? "").trim();
    const customerEmail = String(formData.get("customerEmail") ?? "").trim();
    const customerPhone = String(formData.get("customerPhone") ?? "").trim();
    const subject = String(formData.get("subject") ?? "").trim();
    const questionMessage = String(formData.get("message") ?? "").trim();

    if (!customerName || !customerEmail || !subject || !questionMessage) {
      setError("Vui lòng nhập đầy đủ họ tên, email, chủ đề và nội dung.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/customer-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName,
        customerEmail,
        customerPhone,
        subject,
        message: questionMessage,
      }),
    });
    const data = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(data.message ?? "Không thể gửi câu hỏi.");
      return;
    }

    form.reset();
    setSubjectValue("");
    setMessageValue("");
    setMessage("Câu hỏi của bạn đã được gửi. Shop sẽ phản hồi sớm nhất.");
  }

  return (
    <form onSubmit={handleSubmit} className="hm-surface p-6 md:p-8">
      <h2 className="font-serif text-3xl">Gửi câu hỏi cho shop</h2>
      <div className="mt-6 grid gap-4">
        <input name="customerName" required placeholder="Họ và tên" className="hm-field h-12" />
        <input name="customerEmail" type="email" required placeholder="Email" className="hm-field h-12" />
        <input name="customerPhone" placeholder="Số điện thoại" className="hm-field h-12" />
        <input name="subject" required value={subjectValue} onChange={(event) => setSubjectValue(event.target.value)} placeholder="Chủ đề" className="hm-field h-12" />
        <textarea name="message" required value={messageValue} onChange={(event) => setMessageValue(event.target.value)} placeholder="Nội dung câu hỏi/ý kiến" rows={5} className="hm-field p-4" />
      </div>
      {error ? <p className="mt-4 text-sm text-red-600 dark:text-red-300">{error}</p> : null}
      {message ? <p className="mt-4 text-sm text-green-700 dark:text-sage">{message}</p> : null}
      <button disabled={isSubmitting} className="hm-btn-primary mt-6 h-12 w-full sm:w-auto">
        {isSubmitting ? "Đang gửi..." : "Gửi câu hỏi"}
      </button>
    </form>
  );
}
