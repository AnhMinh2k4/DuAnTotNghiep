import { AdminSettingsPanel } from "@/components/admin/admin-settings-panel";
import { Role } from "@prisma/client";
import { requireAdminRole } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-settings";
import { updateHomepageMedia } from "../actions";

export default async function AdminSettingsPage() {
  const [user, siteSettings] = await Promise.all([
    requireAdminRole([Role.SUPER_ADMIN]),
    getSiteSettings(),
  ]);

  return (
    <div className="space-y-8">
      <section className="hm-surface overflow-hidden">
        <div className="border-b border-ink/5 bg-porcelain/50 px-5 py-5 dark:border-white/10 dark:bg-white/[0.06] sm:px-8 sm:py-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-copper">Trang chủ Shop</p>
          <h2 className="mt-2 font-serif text-2xl">Ảnh khối đăng ký bản tin</h2>
          <p className="mt-2 text-sm text-ink/50 dark:text-ivory/60">
            Ảnh này đang dùng ở section newsletter ngoài trang chủ.
          </p>
        </div>
        <form action={updateHomepageMedia} className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[280px_1fr_auto] lg:items-end">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-porcelain dark:bg-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={siteSettings.newsletterImageUrl} alt="Ảnh newsletter hiện tại" className="h-full w-full object-cover" />
          </div>
          <div className="grid gap-4">
            <label className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink/45 dark:text-ivory/60">
                1. Lưu bằng đường link
              </span>
              <input
                name="newsletterImageUrl"
                type="url"
                defaultValue={siteSettings.newsletterImageUrl.startsWith("/uploads/") ? "" : siteSettings.newsletterImageUrl}
                placeholder="https://..."
                className="hm-field w-full"
              />
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink/45 dark:text-ivory/60">
                2. Tải ảnh từ máy lên
              </span>
              <input
                name="newsletterImageFile"
                type="file"
                accept="image/*"
                className="block w-full rounded-xl border border-ink/10 bg-white/60 px-4 py-3 text-sm text-ink/70 file:mr-4 file:rounded-lg file:border-0 file:bg-ink file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-widest file:text-ivory dark:border-white/10 dark:bg-white/10 dark:text-ivory/70 dark:file:bg-ivory dark:file:text-ink"
              />
              <span className="block text-xs text-ink/45 dark:text-ivory/55">
                Nếu chọn file, hệ thống sẽ ưu tiên ảnh tải lên. Dung lượng tối đa 5MB.
              </span>
            </label>
          </div>
          <button className="hm-btn-primary h-12 w-full px-8 lg:w-auto">Lưu ảnh</button>
        </form>
      </section>

      <AdminSettingsPanel
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }}
      />
    </div>
  );
}
