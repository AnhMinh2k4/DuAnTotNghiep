import { Role } from "@prisma/client";
import { requireAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCategory, deleteCategory, updateCategory } from "../actions";
import { Plus, Save, Trash2, Package, ImageIcon } from "lucide-react";
import { AdminListSearch } from "@/components/admin/admin-list-search";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdminRole([Role.ADMIN, Role.SUPER_ADMIN]);

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
  const categorySearchItems = categories.map((category) => ({
    id: category.id.toString(),
    title: category.name,
    subtitle: category.slug,
    meta: category.description ?? "Chưa có mô tả",
    badge: `${category._count.products} SP`,
    keywords: `${category.name} ${category.slug} ${category.description ?? ""}`,
  }));

  return (
    <main className="space-y-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="hm-page-title tracking-tight">Danh mục sản phẩm</h1>
          <p className="mt-3 text-ink/40 dark:text-ivory/60">Phân loại và tổ chức hệ thống sản phẩm của cửa hàng.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="hm-surface px-6 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink/30 dark:text-ivory/55">Tổng cộng</p>
              <p className="mt-1 font-serif text-xl">{categories.length} danh mục</p>
           </div>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Create Form */}
        <section className="lg:col-span-1">
          <div className="hm-surface overflow-hidden lg:sticky lg:top-32">
            <div className="border-b border-ink/5 bg-porcelain/50 px-5 py-5 dark:border-white/10 dark:bg-white/[0.06] sm:px-8 sm:py-6">
              <div className="flex items-center gap-3">
                <Plus className="text-copper" size={20} />
                <h2 className="font-serif text-xl">Thêm danh mục mới</h2>
              </div>
            </div>
            <form action={createCategory} className="space-y-5 p-5 sm:p-8">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-ivory/60">Tên danh mục *</label>
                <input name="name" required placeholder="VD: Laptop Gaming, Phụ kiện..." className="hm-field w-full" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-ivory/60">Đường dẫn (Slug)</label>
                <input name="slug" placeholder="Để trống để tự tạo" className="hm-field w-full" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-ivory/60">Tải hình ảnh</label>
                <input name="imageFile" type="file" accept="image/*" className="block w-full rounded-xl border border-ink/10 bg-white/60 px-4 py-3 text-sm text-ink/70 file:mr-4 file:rounded-lg file:border-0 file:bg-ink file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-widest file:text-ivory dark:border-white/10 dark:bg-white/10 dark:text-ivory/70 dark:file:bg-ivory dark:file:text-ink" />
                <input name="imageUrl" placeholder="URL cũ nếu cần" className="hm-field w-full text-[10px]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-ivory/60">Mô tả ngắn</label>
                <textarea name="description" placeholder="Giới thiệu về danh mục này..." className="hm-field w-full min-h-[100px] py-3" />
              </div>
              <button className="hm-btn-primary hm-hover-glow w-full h-14 mt-4">
                Lưu danh mục
              </button>
            </form>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="lg:col-span-2 space-y-6">
          <div className="hm-surface flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-copper">Tìm kiếm danh mục</p>
              <p className="mt-1 text-xs text-ink/40 dark:text-ivory/60">Nhập để xem card gợi ý theo tên danh mục, slug hoặc mô tả.</p>
            </div>
            <AdminListSearch items={categorySearchItems} placeholder="Tìm danh mục, slug..." />
          </div>

          <div className="grid max-h-[680px] gap-6 overflow-y-auto pr-1 md:grid-cols-2 md:pr-2">
          {categories.length > 0 ? categories.map((category) => (
            <article key={category.id} className="hm-surface group overflow-hidden border-ink/5 hover:border-copper/20 transition-all hover:shadow-soft">
              <div className="relative h-40 w-full overflow-hidden bg-porcelain">
                {category.imageUrl ? (
                  <Image src={category.imageUrl} alt={category.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="grid h-full place-items-center">
                    <ImageIcon className="text-ink/10" size={40} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between text-white">
                  <div>
                     <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Danh mục</p>
                     <h3 className="font-serif text-2xl">{category.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold backdrop-blur-md">
                    <Package size={12} />
                    {category._count.products}
                  </div>
                </div>
              </div>

              <div className="p-6">
                 <form action={updateCategory} id={`update-form-${category.id}`} className="space-y-4">
                   <input type="hidden" name="id" value={category.id} />
                   <div className="grid gap-4">
                      <input name="name" required defaultValue={category.name} className="hm-field text-sm font-bold" title="Tên danh mục" />
                      <input name="slug" defaultValue={category.slug} className="hm-field text-[10px] font-mono" title="Slug" />
                      <input name="imageFile" type="file" accept="image/*" className="block w-full rounded-xl border border-ink/10 bg-white/60 px-3 py-2 text-xs text-ink/70 file:mr-3 file:rounded-lg file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-[10px] file:font-bold file:uppercase file:tracking-widest file:text-ivory dark:border-white/10 dark:bg-white/10 dark:text-ivory/70 dark:file:bg-ivory dark:file:text-ink" title="Tải ảnh mới" />
                      <input name="imageUrl" defaultValue={category.imageUrl ?? ""} placeholder="URL ảnh cũ nếu cần" className="hm-field text-[10px]" title="URL ảnh" />
                   </div>
                 </form>

                 <div className="mt-4 flex items-center justify-between border-t border-ink/5 pt-4 dark:border-white/10">
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={category.id} />
                      <button 
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 disabled:opacity-20"
                        disabled={category._count.products > 0}
                      >
                        <Trash2 size={14} />
                        {category._count.products > 0 ? "Bận" : "Xóa"}
                      </button>
                    </form>
                    <button 
                      type="submit" 
                      form={`update-form-${category.id}`}
                      className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-sage hover:text-ink"
                    >
                      <Save size={14} />
                      Cập nhật
                    </button>
                 </div>
              </div>
            </article>
          )) : (
            <div className="hm-surface p-12 text-center md:col-span-2">
              <p className="font-serif text-2xl text-ink/60">Không tìm thấy danh mục</p>
              <p className="mt-2 text-sm text-ink/35">Thử nhập tên danh mục hoặc slug khác.</p>
            </div>
          )}
          </div>
        </section>
      </div>
    </main>
  );
}
