import Link from "next/link";
import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { OrderFulfillmentForm } from "@/components/admin/order-fulfillment-form";
import { requireAdminRole } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AdminOrderDetailPageProps = {
  params: Promise<{ id: string }>;
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

const supportStatusLabels: Record<string, string> = {
  OPEN: "Mới",
  PROCESSING: "Đang xử lý",
  RESOLVED: "Đã xử lý",
};

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  await requireAdminRole([Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]);
  const { id } = await params;
  const orderId = Number(id);

  if (!Number.isInteger(orderId) || orderId < 1) {
    notFound();
  }

  const [order, shippers, provinces] = await Promise.all([
    prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        province: true,
        shipper: true,
        statusHistory: {
          orderBy: { createdAt: "asc" },
        },
        supportRequests: {
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.shipper.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.province.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!order) {
    notFound();
  }

  return (
    <main className="space-y-8">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="hm-kicker">Chi tiết đơn hàng</p>
          <h1 className="hm-page-title mt-2">HM-{String(order.id).padStart(5, "0")}</h1>
          <p className="mt-2 text-sm text-ink/55 dark:text-ivory/65">
            {orderStatusLabels[order.status]} • {paymentStatusLabels[order.paymentStatus]} • {new Date(order.createdAt).toLocaleString("vi-VN")}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/admin/orders" className="hm-btn-secondary">Quay lại</Link>
          <Link href={`/admin/orders/${order.id}/invoice`} className="hm-btn-primary">In hóa đơn</Link>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1fr_440px]">
        <div className="hm-surface p-6">
          <div className="flex flex-col justify-between gap-4 border-b border-ink/10 pb-5 dark:border-white/10 lg:flex-row lg:items-start">
            <div>
              <h2 className="font-serif text-3xl">Thông tin khách hàng</h2>
              <div className="mt-4 grid gap-2 text-sm text-ink/65 dark:text-ivory/70">
                <p><span className="font-semibold text-ink dark:text-ivory">Người nhận:</span> {order.customerName}</p>
                <p className="break-all"><span className="font-semibold text-ink dark:text-ivory">Email:</span> {order.customerEmail}</p>
                <p><span className="font-semibold text-ink dark:text-ivory">SĐT:</span> {order.customerPhone}</p>
                <p className="break-words"><span className="font-semibold text-ink dark:text-ivory">Địa chỉ:</span> {order.shippingAddress}{order.province ? `, ${order.province.name}` : ""}</p>
                <p><span className="font-semibold text-ink dark:text-ivory">Shipper:</span> {order.shipper?.name ?? "Chưa gán"}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-porcelain p-4 dark:border-white/10 dark:bg-white/5">
              <OrderFulfillmentForm
                orderId={order.id}
                status={order.status}
                paymentStatus={order.paymentStatus}
                shipperId={order.shipperId}
                provinceId={order.provinceId}
                shippers={shippers}
                provinces={provinces}
              />
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="hm-table min-w-[760px]">
              <thead className="border-b border-ink/10 text-ink/45 dark:text-ivory/55">
                <tr>
                  <th>Sản phẩm</th>
                  <th>SKU</th>
                  <th className="text-center">SL</th>
                  <th className="text-right">Đơn giá</th>
                  <th className="text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-4 font-semibold">{item.name}</td>
                    <td className="py-4 text-xs text-ink/55 dark:text-ivory/60">{item.sku}</td>
                    <td className="py-4 text-center">{item.quantity}</td>
                    <td className="py-4 text-right">{formatCurrency(item.price)}</td>
                    <td className="py-4 text-right font-semibold">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="hm-surface-lift p-6">
            <h2 className="font-serif text-3xl">Tổng tiền</h2>
            <div className="mt-5 space-y-3 text-sm">
              <p className="flex justify-between gap-4"><span>Tạm tính</span><span>{formatCurrency(order.subtotal)}</span></p>
              <p className="flex justify-between gap-4"><span>Phí vận chuyển</span><span>{formatCurrency(order.shippingFee)}</span></p>
              <p className="flex justify-between gap-4"><span>Giảm giá</span><span>-{formatCurrency(order.discountTotal)}</span></p>
              {order.couponCode ? <p className="flex justify-between gap-4"><span>Coupon</span><span>{order.couponCode}</span></p> : null}
              <p className="flex justify-between gap-4 border-t border-ink/10 pt-4 text-lg font-bold dark:border-white/10"><span>Tổng cộng</span><span>{formatCurrency(order.total)}</span></p>
            </div>
          </div>

          <div className="hm-surface p-6">
            <h2 className="font-serif text-3xl">Timeline</h2>
            <div className="mt-5 grid gap-3">
              {order.statusHistory.length === 0 ? (
                <p className="text-sm text-ink/55 dark:text-ivory/60">Chưa có lịch sử cập nhật.</p>
              ) : order.statusHistory.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-ink/10 p-4 text-sm dark:border-white/10">
                  <p className="font-semibold">{orderStatusLabels[entry.nextStatus] ?? entry.nextStatus}</p>
                  <p className="mt-1 text-ink/55 dark:text-ivory/60">{new Date(entry.createdAt).toLocaleString("vi-VN")}</p>
                  {entry.note ? <p className="mt-2 text-ink/65 dark:text-ivory/70">{entry.note}</p> : null}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="hm-surface p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="font-serif text-3xl">Yêu cầu bảo hành / đổi trả</h2>
          <Link href="/admin/support-requests" className="text-sm font-bold uppercase tracking-widest text-copper">Xem tất cả</Link>
        </div>
        <div className="mt-5 grid gap-3">
          {order.supportRequests.length === 0 ? (
            <p className="rounded-xl border border-ink/10 p-5 text-sm text-ink/55 dark:border-white/10 dark:text-ivory/60">Đơn hàng này chưa có yêu cầu hỗ trợ sau bán.</p>
          ) : order.supportRequests.map((request) => (
            <div key={request.id} className="rounded-xl border border-ink/10 p-4 dark:border-white/10">
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-semibold">{request.subject}</p>
                <span className="rounded-full bg-copper/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-copper">{request.type === "WARRANTY" ? "Bảo hành" : "Đổi trả"}</span>
                <span className="rounded-full bg-sage/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-sage">{supportStatusLabels[request.status]}</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-ink/65 dark:text-ivory/70">{request.message}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
