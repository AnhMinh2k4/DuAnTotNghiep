import Link from "next/link";
import { OrderStatus, PaymentStatus, Role, type Prisma } from "@prisma/client";
import { requireAdminRole } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { OrderFulfillmentForm } from "@/components/admin/order-fulfillment-form";
import { ShoppingBag, User, Truck, Calendar, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

type AdminOrdersPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    payment?: string;
  }>;
};

const orderStatusLabels: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const paymentStatusLabels: Record<string, string> = {
  UNPAID: "Chưa thanh toán",
  PAID: "Đã thanh toán",
  REFUNDED: "Đã hoàn tiền",
};

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  await requireAdminRole([Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]);
  const params = await searchParams;
  const q = String(params.q ?? "").trim();
  const status = Object.values(OrderStatus).includes(params.status as OrderStatus) ? params.status as OrderStatus : "";
  const payment = Object.values(PaymentStatus).includes(params.payment as PaymentStatus) ? params.payment as PaymentStatus : "";
  const numericOrderId = q.match(/^#?(?:HM-?)?0*(\d+)$/i)?.[1];
  const where: Prisma.OrderWhereInput = {
    status: status || undefined,
    paymentStatus: payment || undefined,
    OR: q ? [
      numericOrderId ? { id: Number(numericOrderId) } : {},
      { customerName: { contains: q } },
      { customerEmail: { contains: q } },
      { customerPhone: { contains: q } },
    ].filter((item) => Object.keys(item).length > 0) : undefined,
  };

  const [orders, shippers, provinces] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        province: true,
        shipper: true,
        statusHistory: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
    }),
    prisma.shipper.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.province.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <main className="space-y-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="hm-page-title tracking-tight">Quản lý Đơn hàng</h1>
          <p className="mt-3 text-ink/55 dark:text-ivory/65">Theo dõi và xử lý các đơn đặt hàng từ khách hàng trên toàn quốc.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="hm-surface border-emerald-900/15 bg-emerald-900/10 px-6 py-3 dark:border-sage/20 dark:bg-sage/10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-900/70 dark:text-sage">Doanh thu tháng này</p>
              <p className="mt-1 font-serif text-xl text-emerald-950 dark:text-sage">
                {formatCurrency(orders.filter(o => o.status === "COMPLETED").reduce((acc, o) => acc + Number(o.total), 0))}
              </p>
           </div>
        </div>
      </div>

      <form className="hm-surface grid gap-4 p-5 md:grid-cols-[1.2fr_220px_220px_auto] md:items-end">
        <label className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink/45 dark:text-ivory/60">Tìm đơn hàng</span>
          <input name="q" defaultValue={q} placeholder="Mã đơn, tên, email, số điện thoại..." className="hm-field h-11 w-full" />
        </label>
        <label className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink/45 dark:text-ivory/60">Trạng thái đơn</span>
          <select name="status" defaultValue={status} className="hm-field h-11 bg-white dark:bg-white/10 dark:[color-scheme:dark]">
            <option value="">Tất cả</option>
            {Object.entries(orderStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink/45 dark:text-ivory/60">Thanh toán</span>
          <select name="payment" defaultValue={payment} className="hm-field h-11 bg-white dark:bg-white/10 dark:[color-scheme:dark]">
            <option value="">Tất cả</option>
            {Object.entries(paymentStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <button className="hm-btn-primary h-11 w-full md:w-auto">Lọc</button>
      </form>

      <section className="space-y-8">
        {orders.length === 0 ? (
          <div className="hm-surface flex flex-col items-center justify-center py-24 text-ink/35 dark:text-ivory/45">
            <ShoppingBag size={64} className="mb-4 opacity-30" />
            <p className="font-serif text-2xl">{q || status || payment ? "Không tìm thấy đơn hàng phù hợp." : "Chưa có đơn hàng nào."}</p>
            {(q || status || payment) ? <Link href="/admin/orders" className="mt-5 text-sm font-bold text-copper">Xóa bộ lọc</Link> : null}
          </div>
        ) : (
          <div className="grid gap-8">
            {orders.map((order) => (
              <article key={order.id} className="hm-surface group overflow-hidden border-ink/5 transition-all hover:border-copper/20 hover:shadow-soft dark:border-white/10 dark:hover:border-copper/40">
                {/* Order Top Info */}
                <div className="border-b border-ink/5 bg-porcelain/60 p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
                  <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                    <div className="space-y-2">
                       <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                          <h2 className="font-serif text-2xl text-ink dark:text-ivory sm:text-3xl">HM-{String(order.id).padStart(5, "0")}</h2>
                          <span className={`rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest ${order.paymentStatus === "PAID" ? "bg-sage/10 text-sage dark:bg-sage/15 dark:text-[#a9d7b8]" : "bg-red-50 text-red-500 dark:bg-red-500/15 dark:text-red-300"}`}>
                            {order.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
                          </span>
                       </div>
                       <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-ink/55 dark:text-ivory/60">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {new Date(order.createdAt).toLocaleString("vi-VN")}
                          </span>
                       </div>
                    </div>
                    <div className="flex flex-col gap-4 lg:items-end">
                      <OrderFulfillmentForm
                        orderId={order.id}
                        status={order.status}
                        paymentStatus={order.paymentStatus}
                        shipperId={order.shipperId}
                        provinceId={order.provinceId}
                        shippers={shippers}
                        provinces={provinces}
                      />
                      <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                        <Link href={`/admin/orders/${order.id}`} className="hm-btn-primary h-11 w-full justify-center text-xs lg:w-auto">
                          Xem chi tiết
                        </Link>
                        <Link href={`/admin/orders/${order.id}/invoice`} className="hm-btn-secondary h-11 w-full justify-center text-xs lg:w-auto">
                          In hóa đơn
                        </Link>
                      </div>
                      <div className="text-left lg:text-right">
                         <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-ink/45 dark:text-ivory/55">Tổng cộng</p>
                         <p className="font-serif text-3xl text-copper">{formatCurrency(order.total)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-10 p-5 sm:p-8 lg:grid-cols-12">
                   {/* Customer & Shipping */}
                   <div className="lg:col-span-4 space-y-8">
                      <div className="space-y-4">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-copper">Thông tin khách hàng</p>
                         <div className="space-y-3">
                            <div className="flex items-start gap-3">
                               <User size={16} className="mt-0.5 text-ink/35 dark:text-ivory/45" />
                               <div>
                                  <p className="text-sm font-bold text-ink dark:text-ivory">{order.customerName}</p>
                                  <p className="text-xs text-ink/60 dark:text-ivory/65">{order.customerPhone} • {order.customerEmail}</p>
                               </div>
                            </div>
                            <div className="flex items-start gap-3">
                               <MapPin size={16} className="mt-0.5 text-ink/35 dark:text-ivory/45" />
                           <p className="text-xs leading-relaxed text-ink/65 dark:text-ivory/70">{order.shippingAddress}{order.province ? `, ${order.province.name}` : ""}</p>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-copper">Vận chuyển</p>
                         <div className="flex items-center gap-3 rounded-2xl border border-ink/5 bg-porcelain/70 p-4 dark:border-white/10 dark:bg-white/[0.06]">
                            <Truck size={20} className="text-sage" />
                            <div>
                               <p className="text-xs font-bold text-ink dark:text-ivory">{order.shipper?.name || "Chưa rõ đơn vị"}</p>
                               <p className="text-[10px] font-medium text-ink/55 dark:text-ivory/60">Hotline: {order.shipper?.phone || "N/A"}</p>
                            </div>
                         </div>
                      </div>

                      {order.note && (
                        <div className="space-y-3">
                           <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">Ghi chú từ khách</p>
                           <p className="rounded-xl border border-red-100 bg-red-50/50 p-4 text-xs italic text-red-600/80 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200">&ldquo;{order.note}&rdquo;</p>
                        </div>
                      )}
                      <div className="space-y-4">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-copper">Timeline</p>
                         <div className="space-y-3 rounded-2xl border border-ink/5 bg-porcelain/70 p-4 text-xs dark:border-white/10 dark:bg-white/[0.06]">
                            {order.statusHistory.length === 0 ? (
                              <p className="text-ink/50 dark:text-ivory/55">Chưa có lịch sử cập nhật.</p>
                            ) : order.statusHistory.map((entry) => (
                              <div key={entry.id} className="border-b border-ink/5 pb-3 last:border-0 last:pb-0 dark:border-white/10">
                                <p className="font-bold">{orderStatusLabels[entry.nextStatus] ?? entry.nextStatus}</p>
                                <p className="mt-1 text-ink/50 dark:text-ivory/55">{new Date(entry.createdAt).toLocaleString("vi-VN")}</p>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   {/* Order Items */}
                   <div className="lg:col-span-8">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-copper mb-4">Chi tiết sản phẩm</p>
                      <div className="overflow-x-auto rounded-2xl border border-ink/5 dark:border-white/10">
                        <table className="min-w-[720px] text-left text-xs">
                          <thead>
                            <tr className="bg-porcelain/70 dark:bg-white/[0.06]">
                              <th className="px-6 py-4 font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/65">Sản phẩm</th>
                              <th className="px-6 py-4 text-center font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/65">SL</th>
                              <th className="px-6 py-4 text-right font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/65">Đơn giá</th>
                              <th className="px-6 py-4 text-right font-bold uppercase tracking-widest text-ink/50 dark:text-ivory/65">Thành tiền</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-ink/5 dark:divide-white/10">
                            {order.items.map((item) => (
                              <tr key={item.id} className="group/item transition-colors hover:bg-porcelain/40 dark:hover:bg-white/[0.04]">
                                <td className="px-6 py-4">
                                  <p className="font-bold text-ink dark:text-ivory">{item.name}</p>
                                  <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-ink/45 dark:text-ivory/55">{item.sku}</p>
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-ink/60 dark:text-ivory/70">{item.quantity}</td>
                                <td className="px-6 py-4 text-right font-medium text-ink/65 dark:text-ivory/70">{formatCurrency(item.price)}</td>
                                <td className="px-6 py-4 text-right font-bold text-ink dark:text-ivory">{formatCurrency(item.total)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                   </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
