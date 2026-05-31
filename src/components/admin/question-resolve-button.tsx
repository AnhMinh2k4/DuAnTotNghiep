"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type QuestionResolveButtonProps = {
  questionId: number;
  isResolved: boolean;
};

export function QuestionResolveButton({ questionId, isResolved }: QuestionResolveButtonProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  async function handleClick() {
    setIsSaving(true);
    await fetch(`/api/admin/questions/${questionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isResolved: !isResolved }),
    });
    setIsSaving(false);
    router.refresh();
  }

  return (
    <button onClick={handleClick} disabled={isSaving} className="h-10 w-full rounded-xl border border-ink/10 bg-white px-4 text-sm font-semibold uppercase tracking-[0.14em] text-ink transition hover:bg-ink hover:text-ivory disabled:opacity-50 dark:border-white/10 dark:bg-white/10 dark:text-ivory dark:hover:bg-copper sm:w-auto">
      {isSaving ? "Đang lưu..." : isResolved ? "Mở lại" : "Đã xử lý"}
    </button>
  );
}
