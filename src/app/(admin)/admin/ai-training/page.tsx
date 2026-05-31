import Link from "next/link";
import { Bot, CheckCircle2, Database, Plus, Save, Search, SlidersHorizontal, Trash2, XCircle } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { ADMIN_ROLES, requireAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminDeleteAiKnowledgeButton } from "@/components/admin/admin-delete-ai-knowledge-button";
import { createAiKnowledgeItem, updateAiKnowledgeItem } from "../actions";

export const dynamic = "force-dynamic";

type AdminAiTrainingPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
};

const statusOptions = {
  active: "Đang dùng",
  inactive: "Đang tắt",
} as const;

export default async function AdminAiTrainingPage({ searchParams }: AdminAiTrainingPageProps) {
  const currentUser = await requireAdminRole(ADMIN_ROLES);
  const params = await searchParams;
  const q = String(params.q ?? "").trim();
  const status = params.status === "active" || params.status === "inactive" ? params.status : "";
  const hasFilters = Boolean(q || status);
  const where: Prisma.AiKnowledgeItemWhereInput = {
    isActive: status === "active" ? true : status === "inactive" ? false : undefined,
    OR: q ? [
      { title: { contains: q } },
      { keywords: { contains: q } },
      { answer: { contains: q } },
    ] : undefined,
  };

  const [items, totalItemCount, activeItemCount, inactiveItemCount] = await Promise.all([
    prisma.aiKnowledgeItem.findMany({
      where,
      orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
    }),
    prisma.aiKnowledgeItem.count(),
    prisma.aiKnowledgeItem.count({ where: { isActive: true } }),
    prisma.aiKnowledgeItem.count({ where: { isActive: false } }),
  ]);
  const canDeleteTraining = currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN";

  return (
    <main className="space-y-12">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="hm-page-title tracking-tight">Training chatbox</h1>
          <p className="mt-3 max-w-2xl text-ink/40 dark:text-ivory/60">
            Nhập câu hỏi mẫu, từ khóa và câu trả lời để chatbox chỉ trả lời theo nội dung shop đã duyệt.
          </p>
        </div>
        <div className="grid w-full grid-cols-1 gap-3 min-[420px]:grid-cols-3 md:w-auto">
          {[
            { label: "Tổng", value: totalItemCount, color: "text-ink dark:text-ivory" },
            { label: "Đang bật", value: activeItemCount, color: "text-sage" },
            { label: "Đang tắt", value: inactiveItemCount, color: "text-copper" },
          ].map((stat) => (
            <div key={stat.label} className="hm-surface px-4 py-3 text-center min-[420px]:min-w-24 sm:min-w-28">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink/35 dark:text-ivory/55">{stat.label}</p>
              <p className={`mt-1 font-serif text-xl ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <section className="lg:col-span-1">
          <div className="hm-surface overflow-hidden lg:sticky lg:top-32">
            <div className="border-b border-ink/5 bg-porcelain/50 px-5 py-5 dark:border-white/10 dark:bg-white/[0.06] sm:px-8 sm:py-6">
              <div className="flex items-center gap-3">
                <Plus className="text-copper" size={20} />
                <h2 className="font-serif text-xl">Thêm dữ liệu training</h2>
              </div>
            </div>
            <form action={createAiKnowledgeItem} className="space-y-5 p-5 sm:p-8">
              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-ivory/60">Chủ đề *</span>
                <input name="title" required placeholder="VD: Chính sách bảo hành" className="hm-field w-full" />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-ivory/60">Từ khóa *</span>
                <textarea name="keywords" required placeholder="bao hanh, lỗi sản phẩm, hỏng máy" className="hm-field min-h-[92px] w-full py-3" />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-ivory/60">Câu trả lời *</span>
                <textarea name="answer" required placeholder="Nội dung chatbox sẽ trả lời..." className="hm-field min-h-[150px] w-full py-3" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-ivory/60">Ưu tiên</span>
                  <input name="priority" type="number" defaultValue={0} className="hm-field w-full" />
                </label>
                <label className="flex items-center gap-3 pt-6 text-sm font-semibold text-ink/70 dark:text-ivory/70">
                  <input name="isActive" type="checkbox" defaultChecked className="size-4 accent-copper" />
                  Kích hoạt
                </label>
              </div>
              <button className="hm-btn-primary h-14 w-full">
                Lưu training
              </button>
            </form>
          </div>
        </section>

        <section className="space-y-6 lg:col-span-2">
          <form className="hm-surface grid gap-4 p-5 md:grid-cols-[1fr_180px_auto_auto] md:items-end">
            <label className="space-y-2">
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ink/45 dark:text-ivory/60">
                <Search size={13} />
                Tìm dữ liệu
              </span>
              <input name="q" defaultValue={q} placeholder="Chủ đề, từ khóa hoặc nội dung trả lời..." className="hm-field h-11 w-full" />
            </label>
            <label className="space-y-2">
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ink/45 dark:text-ivory/60">
                <SlidersHorizontal size={13} />
                Trạng thái
              </span>
              <select name="status" defaultValue={status} className="hm-field h-11 bg-white dark:bg-white/10 dark:[color-scheme:dark]">
                <option value="">Tất cả</option>
                {Object.entries(statusOptions).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <button className="hm-btn-primary h-11 w-full md:w-auto">Lọc</button>
            {hasFilters ? (
              <Link href="/admin/ai-training" className="flex h-11 items-center justify-center gap-2 rounded-xl border border-ink/10 px-4 text-[10px] font-bold uppercase tracking-widest text-ink/45 transition hover:border-copper hover:text-copper dark:border-white/10 dark:text-ivory/60 dark:hover:border-copper dark:hover:text-copper">
                <XCircle size={15} />
                Xóa lọc
              </Link>
            ) : null}
          </form>

          {totalItemCount === 0 ? (
            <div className="hm-surface flex flex-col items-center justify-center px-6 py-20 text-center">
              <Bot size={48} className="text-ink/15 dark:text-ivory/20" />
              <p className="mt-4 font-serif text-2xl text-ink/60 dark:text-ivory/65">Chưa có dữ liệu training</p>
              <p className="mt-2 max-w-lg text-sm leading-6 text-ink/40 dark:text-ivory/55">
                Khi chưa có dữ liệu trong DB, chatbox sẽ dùng bộ câu trả lời dự phòng. Thêm kịch bản đầu tiên để kiểm soát nội dung trả lời.
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="hm-surface flex flex-col items-center justify-center px-6 py-16 text-center">
              <Search size={42} className="text-ink/15 dark:text-ivory/20" />
              <p className="mt-4 font-serif text-2xl text-ink/60 dark:text-ivory/65">Không tìm thấy dữ liệu phù hợp</p>
              <p className="mt-2 max-w-lg text-sm leading-6 text-ink/40 dark:text-ivory/55">
                Thử đổi từ khóa, bỏ lọc trạng thái hoặc thêm kịch bản training mới ở biểu mẫu bên trái.
              </p>
              <Link href="/admin/ai-training" className="mt-6 text-xs font-bold uppercase tracking-widest text-copper hover:text-ink dark:hover:text-ivory">Xóa bộ lọc</Link>
            </div>
          ) : (
            <div className="grid gap-6">
              <div className="flex items-center justify-between gap-4 px-1">
                <p className="text-xs font-bold uppercase tracking-widest text-ink/35 dark:text-ivory/50">
                  Hiển thị {items.length} / {totalItemCount} kịch bản
                </p>
                {hasFilters ? (
                  <p className="hidden text-xs font-medium text-ink/40 dark:text-ivory/55 sm:block">
                    Bộ lọc: {q ? `"${q}"` : "mọi từ khóa"}{status ? `, ${statusOptions[status]}` : ""}
                  </p>
                ) : null}
              </div>

              {items.map((item) => (
                <article key={item.id} className={`hm-surface overflow-hidden transition-all hover:shadow-soft ${item.isActive ? "border-sage/20" : "opacity-80"}`}>
                  <form action={updateAiKnowledgeItem} id={`ai-training-${item.id}`} className="space-y-5 p-5 sm:p-7">
                    <input type="hidden" name="id" value={item.id} />
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="min-w-0 flex-1">
                        <input name="title" required defaultValue={item.title} className="hm-field w-full font-serif text-xl" />
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${item.isActive ? "bg-sage/10 text-sage" : "bg-ink/5 text-ink/35 dark:bg-white/10 dark:text-ivory/45"}`}>
                            <CheckCircle2 size={12} />
                            {item.isActive ? "Đang dùng" : "Đang tắt"}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-ink/35 dark:text-ivory/50">Ưu tiên {item.priority}</span>
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-ink/30 dark:text-ivory/45">
                            <Database size={12} />
                            {new Date(item.updatedAt).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </div>
                      <label className="flex items-center gap-3 rounded-xl border border-ink/5 px-4 py-3 text-sm font-semibold text-ink/65 dark:border-white/10 dark:text-ivory/65">
                        <input name="isActive" type="checkbox" defaultChecked={item.isActive} className="size-4 accent-copper" />
                        Kích hoạt
                      </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-[1fr_120px]">
                      <label className="block space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-ivory/60">Từ khóa</span>
                        <textarea name="keywords" required defaultValue={item.keywords} className="hm-field min-h-[90px] w-full py-3" />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-ivory/60">Ưu tiên</span>
                        <input name="priority" type="number" defaultValue={item.priority} className="hm-field w-full" />
                      </label>
                    </div>

                    <label className="block space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-ivory/60">Câu trả lời</span>
                      <textarea name="answer" required defaultValue={item.answer} className="hm-field min-h-[130px] w-full py-3" />
                    </label>
                  </form>

                  <div className="flex flex-col-reverse gap-3 border-t border-ink/5 px-5 py-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                    {canDeleteTraining ? (
                      <AdminDeleteAiKnowledgeButton id={item.id} title={item.title} />
                    ) : (
                      <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ink/30 dark:text-ivory/40">
                        <Trash2 size={14} />
                        Chỉ admin được xóa
                      </span>
                    )}
                    <button type="submit" form={`ai-training-${item.id}`} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-sage hover:text-ink dark:hover:text-ivory">
                      <Save size={14} />
                      Cập nhật
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
