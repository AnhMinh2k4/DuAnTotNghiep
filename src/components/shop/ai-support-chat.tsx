"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { Bot, MessageCircle, Send, X } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  contactUrl?: string | null;
};

const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    content: "Xin chào, mình là trợ lý TMDT Shop. Bạn cần hỏi về sản phẩm, bảo hành, đổi trả, thanh toán hay giao hàng?",
  },
];

export function AiSupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function openChat() {
    setIsOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextInput = input.trim();

    if (!nextInput || isSending) return;

    const nextMessages = [...messages, { role: "user" as const, content: nextInput }];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/ai-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: nextInput,
          messages: messages.slice(-8),
        }),
      });
      const data = await response.json();
      const reply = response.ok ? String(data.reply ?? "") : String(data.message ?? "Mình chưa thể trả lời ngay lúc này.");
      const contactUrl = typeof data.contactUrl === "string" ? data.contactUrl : null;

      setMessages([...nextMessages, { role: "assistant", content: reply || "Mình chưa thể trả lời ngay lúc này.", contactUrl }]);
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: "Kết nối hỗ trợ đang gián đoạn. Bạn có thể gửi câu hỏi tại trang Liên hệ để admin xử lý.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="fixed bottom-24 right-3 z-[60] print:hidden sm:right-5 lg:bottom-5">
      {isOpen ? (
        <section className="flex h-[min(520px,calc(100vh-96px))] w-[min(calc(100vw-24px),380px)] flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-950 sm:w-[min(calc(100vw-40px),380px)]">
          <header className="flex items-center justify-between border-b border-ink/5 px-4 py-3 dark:border-white/10">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-ink text-ivory dark:bg-ivory dark:text-ink">
                <Bot size={20} />
              </span>
              <div>
                <p className="text-sm font-bold text-ink dark:text-ivory">Trợ lý TMDT Shop</p>
                <p className="text-xs text-sage">Đang hỗ trợ tự động</p>
              </div>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="hm-icon-btn size-9" aria-label="Đóng chat">
              <X size={18} />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-porcelain/60 p-4 dark:bg-white/[0.03]">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "bg-ink text-ivory dark:bg-ivory dark:text-ink"
                      : "border border-ink/5 bg-white text-ink/75 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-ivory/75"
                  }`}
                >
                  <p>{message.content}</p>
                  {message.contactUrl ? (
                    <Link href={message.contactUrl} className="mt-3 inline-flex rounded-full bg-copper px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-ink dark:hover:bg-ivory dark:hover:text-ink">
                      Gửi câu hỏi cho shop
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
            {isSending ? (
              <div className="inline-flex rounded-2xl border border-ink/5 bg-white px-4 py-3 text-sm text-ink/50 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-ivory/60">
                Đang trả lời...
              </div>
            ) : null}
          </div>

          <div className="border-t border-ink/5 p-3 dark:border-white/10">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                maxLength={1000}
                placeholder="Nhập câu hỏi..."
                className="hm-field h-11 min-w-0 flex-1 px-4"
              />
              <button type="submit" disabled={isSending || input.trim().length === 0} className="hm-icon-btn size-11 disabled:pointer-events-none disabled:opacity-50" aria-label="Gửi câu hỏi">
                <Send size={18} />
              </button>
            </form>
            <p className="mt-2 text-center text-[11px] text-ink/45 dark:text-ivory/50">
              Cần admin xử lý? <Link href="/contact" className="font-semibold text-copper">Gửi yêu cầu</Link>
            </p>
          </div>
        </section>
      ) : (
        <button type="button" onClick={openChat} className="flex size-12 items-center justify-center gap-3 rounded-full bg-ink text-sm font-bold text-ivory shadow-2xl transition-all hover:-translate-y-1 hover:bg-copper dark:bg-ivory dark:text-ink dark:hover:bg-copper dark:hover:text-white sm:h-14 sm:w-auto sm:px-5">
          <MessageCircle size={20} />
          <span className="hidden sm:inline">Hỏi AI</span>
        </button>
      )}
    </div>
  );
}
