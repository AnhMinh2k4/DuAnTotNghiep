import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderCancelButton } from "@/components/shop/order-cancel-button";
import { SupportRequestForm } from "@/components/shop/support-request-form";
import { requireCurrentUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";

const statusLabels: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

type AccountOrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AccountOrderDetailPage({ params }: AccountOrderDetailPageProps) {
  const user = await requireCurrentUser();
  const { id } = await params;
  const orderId = Number(id);

  if (!Number.isInteger(orderId) || orderId < 1) {
    notFound();
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: user.id,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              slug: true,
            },
          },
        },
      },
      statusHistory: {
        orderBy: { createdAt: "asc" },
      },
      supportRequests: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-12 md:px-8">
      <div className="flex flex-col justify-between gap-5 border-b border-ink/10 pb-8 dark:border-white/10 md:flex-row md:items-end">
        <div>
          <p className="hm-kicker">Đơn hàng</p>
          <h1 className="hm-page-title mt-3">Đơn #{order.id}</h1>
          <p className="mt-2 text-ink/60 dark:text-ivory/65">{statusLabels[order.status] ?? order.status}</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          {order.status === "PENDING" ? <OrderCancelButton orderId={order.id} /> : null}
          <Link href={`/account/orders/${order.id}/invoice`} className="hm-btn-primary w-full sm:w-auto">In hóa đơn</Link>
          <Link href="/account/orders" className="hm-btn-secondary w-full sm:w-auto">Quay lại</Link>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="hm-surface p-6">
          <h2 className="font-serif text-3xl">Sản phẩm</h2>
          <div className="mt-5 space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex flex-col justify-between gap-3 border-b border-ink/10 pb-4 text-sm dark:border-white/10 sm:flex-row">
                <div className="min-w-0">
                  <p className="break-words font-semibold">{item.name}</p>
                  <p className="mt-1 break-all text-ink/55 dark:text-ivory/60">SKU: {item.sku} • Số lượng: {item.quantity}</p>
                  {order.status === "COMPLETED" && item.product?.slug ? (
                    <Link href={`/products/${item.product.slug}#reviews`} className="mt-3 inline-flex text-xs font-bold uppercase tracking-widest text-copper transition hover:text-ink dark:hover:text-ivory">
                      Đánh giá sản phẩm
                    </Link>
                  ) : order.status !== "CANCELLED" ? (
                    <p className="mt-3 text-xs font-semibold text-ink/45 dark:text-ivory/55">Đánh giá mở khi đơn hàng hoàn thành.</p>
                  ) : null}
                </div>
                <p className="shrink-0 font-semibold sm:text-right">{formatCurrency(item.total)}</p>
              </div>
            ))}
          </div>
        </section>
        <aside className="hm-surface-lift p-6">
          <h2 className="font-serif text-3xl">Tổng kết</h2>
          <div className="mt-5 space-y-3 text-sm text-ink/70 dark:text-ivory/70">
            <p><span className="font-semibold text-ink dark:text-ivory">Người nhận:</span> {order.customerName}</p>
            <p className="break-all"><span className="font-semibold text-ink dark:text-ivory">Email:</span> {order.customerEmail}</p>
            <p><span className="font-semibold text-ink dark:text-ivory">Điện thoại:</span> {order.customerPhone}</p>
            <p className="break-words"><span className="font-semibold text-ink dark:text-ivory">Địa chỉ:</span> {order.shippingAddress}</p>
          </div>
          <div className="mt-6 space-y-2 border-t border-ink/10 pt-5 text-sm dark:border-white/10">
            <p className="flex items-start justify-between gap-4"><span>Tạm tính</span><span className="text-right">{formatCurrency(order.subtotal)}</span></p>
            <p className="flex items-start justify-between gap-4"><span>Phí vận chuyển</span><span className="text-right">{formatCurrency(order.shippingFee)}</span></p>
            <p className="flex items-start justify-between gap-4"><span>Giảm giá</span><span className="text-right">{formatCurrency(order.discountTotal)}</span></p>
            <p className="flex items-start justify-between gap-4 text-lg font-semibold"><span>Tổng cộng</span><span className="text-right">{formatCurrency(order.total)}</span></p>
          </div>
        </aside>
      </div>
      <section className="hm-surface mt-6 p-6">
        <h2 className="font-serif text-3xl">Timeline đơn hàng</h2>
        <div className="mt-5 grid gap-3">
          {order.statusHistory.length === 0 ? (
            <p className="text-sm text-ink/55 dark:text-ivory/60">Chưa có lịch sử cập nhật.</p>
          ) : order.statusHistory.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-ink/10 p-4 text-sm dark:border-white/10">
              <p className="font-semibold">{statusLabels[entry.nextStatus] ?? entry.nextStatus}</p>
              <p className="mt-1 text-ink/55 dark:text-ivory/60">{new Date(entry.createdAt).toLocaleString("vi-VN")}</p>
              {entry.note ? <p className="mt-2 text-ink/65 dark:text-ivory/70">{entry.note}</p> : null}
            </div>
          ))}
        </div>
      </section>
      <SupportRequestForm
        orderId={order.id}
        customerName={order.customerName}
        customerEmail={order.customerEmail}
        customerPhone={order.customerPhone}
      />
      {order.supportRequests.length > 0 ? (
        <section className="hm-surface mt-6 p-6">
          <h2 className="font-serif text-3xl">Yêu cầu đã gửi</h2>
          <div className="mt-5 grid gap-3">
            {order.supportRequests.map((request) => (
              <div key={request.id} className="rounded-xl border border-ink/10 p-4 text-sm dark:border-white/10">
                <p className="font-semibold">{request.subject}</p>
                <p className="mt-1 text-ink/55 dark:text-ivory/60">
                  {request.type === "WARRANTY" ? "Bảo hành" : "Đổi trả"} • {request.status}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
