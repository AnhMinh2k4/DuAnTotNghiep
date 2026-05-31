import Link from "next/link";
import { Role } from "@prisma/client";
import { Eye, EyeOff, MessageSquareText, Star, Trash2 } from "lucide-react";
import { requireAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteReview, updateReviewVisibility } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  await requireAdminRole([Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]);

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { name: true, slug: true } },
    },
  });

  const hiddenCount = reviews.filter((review) => !review.isVisible).length;

  return (
    <main className="space-y-10">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="hm-page-title tracking-tight">Duyệt đánh giá</h1>
          <p className="mt-3 text-ink/55 dark:text-ivory/65">Ẩn/hiện phản hồi của khách hàng trên trang chi tiết sản phẩm.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="hm-surface px-6 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink/35 dark:text-ivory/55">Tổng đánh giá</p>
            <p className="mt-1 font-serif text-xl">{reviews.length}</p>
          </div>
          <div className="hm-surface border-red-200/60 px-6 py-3 dark:border-red-400/20">
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">Đang ẩn</p>
            <p className="mt-1 font-serif text-xl text-red-500">{hiddenCount}</p>
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <section className="hm-surface grid min-h-72 place-items-center p-10 text-center text-ink/45 dark:text-ivory/55">
          <div>
            <MessageSquareText size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-serif text-2xl">Chưa có đánh giá sản phẩm.</p>
          </div>
        </section>
      ) : (
        <section className="grid gap-5">
          {reviews.map((review) => (
            <article key={review.id} className={`hm-surface overflow-hidden transition-all ${review.isVisible ? "border-sage/20" : "border-red-200/70 opacity-75 dark:border-red-400/20"}`}>
              <div className="grid gap-6 p-5 lg:grid-cols-[1fr_auto] sm:p-7">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${review.isVisible ? "bg-sage/10 text-sage" : "bg-red-50 text-red-500 dark:bg-red-500/15 dark:text-red-300"}`}>
                      {review.isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
                      {review.isVisible ? "Đang hiển thị" : "Đang ẩn"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-copper">
                      {Array.from({ length: review.rating }, (_, index) => (
                        <Star key={index} size={14} fill="currentColor" />
                      ))}
                      <span className="ml-1">{review.rating}/5</span>
                    </span>
                    <span className="text-xs text-ink/45 dark:text-ivory/55">{review.createdAt.toLocaleString("vi-VN")}</span>
                  </div>

                  <div>
                    <Link href={`/products/${review.product.slug}`} target="_blank" className="font-serif text-2xl transition-colors hover:text-copper">
                      {review.product.name}
                    </Link>
                    <p className="mt-2 text-sm text-ink/55 dark:text-ivory/65">
                      {review.user.name} • {review.user.email}
                    </p>
                  </div>

                  <blockquote className="rounded-2xl border border-ink/5 bg-porcelain/60 p-5 text-sm italic leading-relaxed text-ink/70 dark:border-white/10 dark:bg-white/[0.06] dark:text-ivory/75">
                    &ldquo;{review.comment || "Khách hàng chỉ chấm điểm, không để lại bình luận."}&rdquo;
                  </blockquote>
                </div>

                <div className="flex gap-3 lg:flex-col lg:items-stretch">
                  <form action={updateReviewVisibility} className="flex-1 lg:flex-none">
                    <input type="hidden" name="id" value={review.id} />
                    <input type="hidden" name="isVisible" value={review.isVisible ? "" : "on"} />
                    <button className="hm-btn-secondary h-11 w-full px-4 text-xs">
                      {review.isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                      {review.isVisible ? "Ẩn" : "Hiện"}
                    </button>
                  </form>
                  <form action={deleteReview}>
                    <input type="hidden" name="id" value={review.id} />
                    <button className="hm-btn-secondary h-11 border-red-200 px-4 text-xs text-red-500 hover:border-red-500 hover:bg-red-500 hover:text-white dark:border-red-400/30 dark:text-red-300">
                      <Trash2 size={14} />
                      Xóa
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
