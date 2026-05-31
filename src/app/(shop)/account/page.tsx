import Link from "next/link";
import { MessageCircle, PackageCheck, Settings, ShieldCheck, UserRound } from "lucide-react";
import { AccountSettingsPanel } from "@/components/shop/account-settings-panel";
import { AccountProfileForm } from "@/components/shop/account-profile-form";
import { CustomerLogoutButton } from "@/components/shop/customer-logout-button";
import { requireCurrentUser } from "@/lib/auth";

export default async function AccountPage() {
  const user = await requireCurrentUser();

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 md:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-ink/5 bg-white shadow-soft dark:border-white/10 dark:bg-zinc-900/80">
        <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(135deg,rgba(194,106,69,0.18),rgba(143,174,154,0.18),transparent)]" />
        <div className="relative flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between lg:p-10">
          <div className="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-end">
            <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-3xl border-4 border-white bg-ink font-serif text-4xl text-ivory shadow-xl dark:border-zinc-900 dark:bg-ivory dark:text-ink sm:size-28">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 pb-1">
              <p className="hm-kicker mb-0">Tài khoản khách hàng</p>
              <h1 className="mt-2 font-serif text-4xl leading-tight text-ink dark:text-ivory sm:text-5xl">
                <span className="break-words">{user.name}</span>
              </h1>
              <p className="mt-3 break-all text-sm text-ink/55 dark:text-ivory/60">{user.email}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-sage/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-sage">
                  Đang hoạt động
                </span>
                <span className="rounded-full bg-copper/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-copper">
                  Khách hàng
                </span>
              </div>
            </div>
          </div>
          <CustomerLogoutButton />
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-4">
        <Link href="/account/orders" className="group rounded-3xl border border-ink/5 bg-white p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-copper/30 dark:border-white/10 dark:bg-white/10">
          <PackageCheck className="text-copper transition-transform group-hover:scale-110" size={22} />
          <p className="mt-4 text-sm font-bold">Lịch sử đơn hàng</p>
          <p className="mt-1 text-xs leading-5 text-ink/50 dark:text-ivory/55">Theo dõi trạng thái mua hàng.</p>
        </Link>
        <a href="#profile" className="group rounded-3xl border border-ink/5 bg-white p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-copper/30 dark:border-white/10 dark:bg-white/10">
          <UserRound className="text-copper transition-transform group-hover:scale-110" size={22} />
          <p className="mt-4 text-sm font-bold">Hồ sơ cá nhân</p>
          <p className="mt-1 text-xs leading-5 text-ink/50 dark:text-ivory/55">Tên, avatar, số điện thoại.</p>
        </a>
        <a href="#settings" className="group rounded-3xl border border-ink/5 bg-white p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-copper/30 dark:border-white/10 dark:bg-white/10">
          <Settings className="text-copper transition-transform group-hover:scale-110" size={22} />
          <p className="mt-4 text-sm font-bold">Cài đặt</p>
          <p className="mt-1 text-xs leading-5 text-ink/50 dark:text-ivory/55">Giao diện và mật khẩu.</p>
        </a>
        <Link href="/contact" className="group rounded-3xl border border-ink/5 bg-white p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-copper/30 dark:border-white/10 dark:bg-white/10">
          <MessageCircle className="text-copper transition-transform group-hover:scale-110" size={22} />
          <p className="mt-4 text-sm font-bold">Hỗ trợ shop</p>
          <p className="mt-1 text-xs leading-5 text-ink/50 dark:text-ivory/55">Gửi câu hỏi và ý kiến.</p>
        </Link>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div id="profile" className="space-y-8">
          <AccountProfileForm user={user} />
          <section className="hm-surface overflow-hidden">
            <div className="border-b border-ink/5 bg-porcelain/50 px-6 py-5 dark:border-white/10 dark:bg-white/[0.06]">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-copper" />
                <h2 className="font-serif text-2xl">Bảo mật tài khoản</h2>
              </div>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-ink/5 p-4 dark:border-white/10">
                <p className="text-sm font-bold">Email đăng nhập</p>
                <p className="mt-2 break-all text-sm text-ink/55 dark:text-ivory/60">{user.email}</p>
              </div>
              <div className="rounded-2xl border border-ink/5 p-4 dark:border-white/10">
                <p className="text-sm font-bold">Thông tin giao hàng</p>
                <p className="mt-2 text-sm text-ink/55 dark:text-ivory/60">{user.address ? "Đã cập nhật" : "Chưa cập nhật địa chỉ"}</p>
              </div>
            </div>
          </section>
        </div>

        <aside id="settings" className="space-y-8 lg:sticky lg:top-32 lg:self-start">
          <AccountSettingsPanel avatarUrl={user.avatarUrl} name={user.name} />
          <section className="hm-surface p-6">
            <h2 className="font-serif text-3xl">Đơn hàng</h2>
            <p className="mt-3 text-sm leading-6 text-ink/60 dark:text-ivory/65">
              Kiểm tra lịch sử mua hàng, trạng thái xử lý, hóa đơn và yêu cầu hủy đơn khi còn trong giai đoạn chờ xác nhận.
            </p>
            <Link href="/account/orders" className="hm-btn-primary mt-6 w-full">
              Xem lịch sử đơn
            </Link>
          </section>
        </aside>
      </div>
    </main>
  );
}
