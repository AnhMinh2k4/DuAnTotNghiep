import Link from "next/link";
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

export default async function AccountOrdersPage() {
  const user = await requireCurrentUser();
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 md:px-8">
      <div className="flex flex-col justify-between gap-5 border-b border-ink/10 pb-8 dark:border-white/10 md:flex-row md:items-end">
        <div>
          <p className="hm-kicker">Tài khoản</p>
          <h1 className="hm-page-title mt-3">Lịch sử đơn hàng</h1>
        </div>
        <Link href="/account" className="hm-btn-secondary w-full sm:w-auto">Thông tin tài khoản</Link>
      </div>

      {orders.length === 0 ? (
        <div className="hm-surface mt-8 p-8 text-ink/65 dark:text-ivory/70">
          Bạn chưa có đơn hàng nào. <Link href="/products" className="font-semibold text-ink hover:text-copper dark:text-ivory dark:hover:text-copper">Mua sắm ngay</Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/account/orders/${order.id}`} className="hm-surface grid gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lift md:grid-cols-[1fr_auto_auto] md:items-center">
              <div>
                <p className="font-serif text-2xl">Đơn #{order.id}</p>
                <p className="mt-1 text-sm text-ink/55 dark:text-ivory/60">{order.items.length} sản phẩm • {order.createdAt.toLocaleDateString("vi-VN")}</p>
                <p className="mt-2 text-xs font-semibold text-ink/45 dark:text-ivory/55">
                  {order.status === "COMPLETED" ? "Có thể đánh giá trong chi tiết đơn hàng." : "Đánh giá mở khi đơn hàng hoàn thành."}
                </p>
              </div>
              <p className="hm-pill">{statusLabels[order.status] ?? order.status}</p>
              <p className="font-semibold md:text-right">{formatCurrency(order.total)}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
