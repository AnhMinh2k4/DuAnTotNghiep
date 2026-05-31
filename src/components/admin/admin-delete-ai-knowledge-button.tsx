"use client";

import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";
import { deleteAiKnowledgeItem } from "@/app/(admin)/admin/actions";

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-500 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Trash2 size={14} />
      {pending ? "Đang xóa" : "Xóa"}
    </button>
  );
}

export function AdminDeleteAiKnowledgeButton({ id, title }: { id: number; title: string }) {
  return (
    <form
      action={deleteAiKnowledgeItem}
      onSubmit={(event) => {
        if (!window.confirm(`Xóa dữ liệu training "${title}"?`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <DeleteButton />
    </form>
  );
}
