import { Role } from "@prisma/client";
import { BadgePercent, CalendarDays, Save, Ticket, Trash2 } from "lucide-react";
import { requireAdminRole } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { createCoupon, deleteCoupon, updateCoupon } from "../actions";

export const dynamic = "force-dynamic";

function toInputDate(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

function discountLabel(type: string, value: { toNumber?: () => number; toString: () => string }) {
  const number = typeof value.toNumber === "function" ? value.toNumber() : Number(value.toString());
  return type === "PERCENT" ? `${number}%` : formatCurrency(value);
}

export default async function AdminCouponsPage() {
  await requireAdminRole([Role.ADMIN, Role.SUPER_ADMIN]);

  const coupons = await prisma.coupon.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });

  const activeCount = coupons.filter((coupon) => coupon.isActive).length;

  return (
    <main className="space-y-10">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="hm-page-title tracking-tight">Mã giảm giá</h1>
          <p className="mt-3 text-ink/55 dark:text-ivory/65">Tạo và quản lý coupon áp dụng trong bước thanh toán.</p>
        </div>
        <div className="hm-surface px-6 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink/35 dark:text-ivory/55">Đang bật</p>
          <p className="mt-1 font-serif text-xl text-copper">{activeCount}/{coupons.length} mã</p>
        </div>
      </div>

      <section className="grid gap-8 2xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="hm-surface overflow-hidden xl:sticky xl:top-32 xl:self-start">
          <div className="border-b border-ink/5 bg-porcelain/60 p-6 dark:border-white/10 dark:bg-white/[0.06]">
            <div className="flex items-center gap-3">
              <BadgePercent className="text-copper" size={20} />
              <h2 className="font-serif text-2xl">Tạo coupon</h2>
            </div>
          </div>
          <form action={createCoupon} className="grid gap-4 p-5 sm:p-8">
            <input name="code" required placeholder="VD: HM10" className="hm-field w-full font-bold uppercase" />
            <textarea name="description" placeholder="Mô tả ngắn cho mã giảm giá" className="hm-field min-h-[90px] w-full py-3" />
            <div className="grid gap-4 sm:grid-cols-2">
              <select name="discountType" defaultValue="PERCENT" className="hm-field dark:[color-scheme:dark]">
                <option value="PERCENT">Theo phần trăm</option>
                <option value="FIXED">Số tiền cố định</option>
              </select>
              <input name="discountValue" required placeholder="Giá trị" className="hm-field" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input name="minOrderTotal" placeholder="Đơn tối thiểu" className="hm-field" />
              <input name="usageLimit" placeholder="Giới hạn lượt dùng" className="hm-field" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input name="startsAt" type="date" className="hm-field dark:[color-scheme:dark]" />
              <input name="expiresAt" type="date" className="hm-field dark:[color-scheme:dark]" />
            </div>
            <label className="flex items-center justify-between rounded-2xl border border-ink/5 bg-porcelain/60 px-4 py-3 text-sm font-semibold dark:border-white/10 dark:bg-white/[0.06]">
              Kích hoạt coupon
              <input name="isActive" type="checkbox" defaultChecked className="size-4 accent-copper" />
            </label>
            <button className="hm-btn-primary hm-hover-glow h-14 w-full">Lưu coupon</button>
          </form>
        </div>

        <div className="grid gap-5">
          {coupons.length === 0 ? (
            <div className="hm-surface grid min-h-56 place-items-center p-10 text-center text-ink/45 dark:text-ivory/55">
              <div>
                <Ticket size={42} className="mx-auto mb-4 opacity-30" />
                <p className="font-serif text-2xl">Chưa có mã giảm giá nào.</p>
              </div>
            </div>
          ) : coupons.map((coupon) => (
            <article key={coupon.id} className="hm-surface overflow-hidden">
              <div className="grid min-w-0 gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start sm:p-7">
                <form id={`coupon-${coupon.id}`} action={updateCoupon} className="grid min-w-0 gap-4">
                  <input type="hidden" name="id" value={coupon.id} />
                  <div className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(150px,200px)_minmax(120px,180px)]">
                    <input name="code" required defaultValue={coupon.code} className="hm-field font-bold uppercase" title="Mã coupon" />
                    <select name="discountType" defaultValue={coupon.discountType} className="hm-field dark:[color-scheme:dark]" title="Loại giảm">
                      <option value="PERCENT">Phần trăm</option>
                      <option value="FIXED">Cố định</option>
                    </select>
                    <input name="discountValue" required defaultValue={coupon.discountValue.toString()} className="hm-field" title="Giá trị" />
                  </div>
                  <textarea name="description" defaultValue={coupon.description ?? ""} placeholder="Mô tả" className="hm-field min-h-[80px] py-3" />
                  <div className="grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                    <input name="minOrderTotal" defaultValue={coupon.minOrderTotal?.toString() ?? ""} placeholder="Đơn tối thiểu" className="hm-field" />
                    <input name="usageLimit" defaultValue={coupon.usageLimit ?? ""} placeholder="Giới hạn" className="hm-field" />
                    <input name="startsAt" type="date" defaultValue={toInputDate(coupon.startsAt)} className="hm-field dark:[color-scheme:dark]" />
                    <input name="expiresAt" type="date" defaultValue={toInputDate(coupon.expiresAt)} className="hm-field dark:[color-scheme:dark]" />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-ink/55 dark:text-ivory/65">
                    <span className="inline-flex items-center gap-2 rounded-full bg-copper/10 px-3 py-1 font-bold text-copper">
                      <Ticket size={13} />
                      {discountLabel(coupon.discountType, coupon.discountValue)}
                    </span>
                    <span>Đã dùng {coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ""} lượt</span>
                    {coupon.expiresAt ? (
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays size={13} />
                        Hết hạn {coupon.expiresAt.toLocaleDateString("vi-VN")}
                      </span>
                    ) : null}
                    <label className="inline-flex items-center gap-2 font-bold sm:ml-auto">
                      <input name="isActive" type="checkbox" defaultChecked={coupon.isActive} className="size-4 accent-copper" />
                      {coupon.isActive ? "Đang bật" : "Đang tắt"}
                    </label>
                  </div>
                </form>

                <div className="flex min-w-0 flex-wrap gap-3 xl:flex-col xl:items-stretch">
                  <button form={`coupon-${coupon.id}`} className="hm-btn-secondary h-11 min-w-28 flex-1 px-4 text-xs xl:flex-none">
                    <Save size={14} />
                    Lưu
                  </button>
                  <form action={deleteCoupon} className="flex-1 xl:flex-none">
                    <input type="hidden" name="id" value={coupon.id} />
                    <button className="hm-btn-secondary h-11 w-full min-w-28 border-red-200 px-4 text-xs text-red-500 hover:border-red-500 hover:bg-red-500 hover:text-white dark:border-red-400/30 dark:text-red-300">
                      <Trash2 size={14} />
                      Xóa
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
