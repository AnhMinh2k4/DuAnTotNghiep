"use client";

import { useMemo, useState } from "react";
import { Calendar, CheckCircle2, Clock, Mail, MessageSquare, Phone, Search, User, X } from "lucide-react";
import { QuestionResolveButton } from "@/components/admin/question-resolve-button";

type QuestionItem = {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  subject: string;
  message: string;
  isResolved: boolean;
  createdAt: string;
};

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function QuestionSearchPanel({ questions }: { questions: QuestionItem[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeSearch(query);

  const filteredQuestions = useMemo(() => {
    if (!normalizedQuery) {
      return questions;
    }

    return questions.filter((question) => {
      const searchable = normalizeSearch([
        question.customerName,
        question.customerEmail,
        question.customerPhone ?? "",
        question.subject,
        question.message,
        question.isResolved ? "da xu ly" : "dang cho chua xu ly",
      ].join(" "));

      return searchable.includes(normalizedQuery);
    });
  }, [normalizedQuery, questions]);

  if (questions.length === 0) {
    return (
      <div className="hm-surface flex flex-col items-center justify-center py-20 text-ink/20 dark:text-ivory/40">
        <MessageSquare size={48} className="mb-4 opacity-10" />
        <p className="font-serif text-xl">Chưa có câu hỏi nào từ khách hàng.</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="hm-surface flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-copper">Tra cứu hotline</p>
          <p className="mt-1 text-xs text-ink/40 dark:text-ivory/60">
            Tìm theo tên khách, số điện thoại, email, chủ đề hoặc nội dung câu hỏi.
          </p>
        </div>
        <div className="relative w-full md:max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30 dark:text-ivory/45" size={18} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nhập tên, SĐT, Gmail hoặc chủ đề..."
            className="hm-field h-12 w-full bg-white pl-11 pr-12 placeholder:text-ink/40 dark:bg-white/10 dark:placeholder:text-ivory/50"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-ink/35 transition hover:bg-porcelain hover:text-ink dark:text-ivory/50 dark:hover:bg-white/10 dark:hover:text-ivory"
              aria-label="Xóa tìm kiếm"
            >
              <X size={15} />
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-ink/45 dark:text-ivory/55">
        <span>{filteredQuestions.length} / {questions.length} câu hỏi</span>
        <span>Danh sách có vùng cuộn để xử lý khi dữ liệu nhiều.</span>
      </div>

      {filteredQuestions.length === 0 ? (
        <div className="hm-surface p-12 text-center">
          <p className="font-serif text-2xl text-ink/60 dark:text-ivory/70">Không tìm thấy câu hỏi phù hợp</p>
          <p className="mt-2 text-sm text-ink/35 dark:text-ivory/50">Thử nhập số điện thoại, email hoặc tên khách theo cách khác.</p>
        </div>
      ) : (
        <div className="max-h-[720px] space-y-6 overflow-y-auto pr-1 md:pr-2">
          {filteredQuestions.map((question) => (
            <article key={question.id} className={`hm-surface group relative overflow-hidden transition-all hover:shadow-soft ${question.isResolved ? "opacity-60 grayscale-[0.5]" : "border-sage/20 ring-1 ring-sage/5"}`}>
              <div className="flex flex-col justify-between gap-8 p-5 sm:p-8 md:flex-row md:items-start">
                <div className="flex-1 space-y-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest ${question.isResolved ? "bg-sage/10 text-sage" : "bg-copper/10 text-copper animate-pulse"}`}>
                      {question.isResolved ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {question.isResolved ? "Đã xử lý" : "Đang chờ"}
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-ink/35 dark:text-ivory/55">
                      <Calendar size={12} />
                      {new Date(question.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <div>
                    <h2 className="font-serif text-2xl text-ink transition-colors group-hover:text-copper dark:text-ivory sm:text-3xl">{question.subject}</h2>
                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-ink/40 dark:text-ivory/60">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-copper/40" />
                        <span className="text-ink/80 dark:text-ivory/80">{question.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-copper/40" />
                        <span>{question.customerEmail}</span>
                      </div>
                      {question.customerPhone ? (
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-copper/40" />
                          <span>{question.customerPhone}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="relative rounded-2xl border border-ink/5 bg-porcelain/30 p-5 text-sm italic leading-relaxed text-ink/70 dark:border-white/10 dark:bg-white/[0.06] dark:text-ivory/75 sm:p-6">
                    &ldquo;{question.message}&rdquo;
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-end">
                  <QuestionResolveButton questionId={question.id} isResolved={question.isResolved} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
