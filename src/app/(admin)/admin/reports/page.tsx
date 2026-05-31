import Link from "next/link";
import { Role } from "@prisma/client";
import { AlertTriangle, BarChart3, Boxes, CircleDollarSign, ClipboardList } from "lucide-react";
import { requireAdminRole } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split("-");
  return `Tháng ${Number(month)}/${year}`;
}

function getAvailableStock(product: { stock: number; variants: Array<{ stock: number; isActive: boolean }> }) {
  const activeVariants = product.variants.filter((variant) => variant.isActive);
  return activeVariants.length
    ? activeVariants.reduce((sum, variant) => sum + variant.stock, 0)
    : product.stock;
}

export default async function AdminReportsPage() {
  await requireAdminRole([Role.STAFF, Role.ADMIN, Role.SUPER_ADMIN]);

  const now = new Date();
  const startOfWindow = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [orders, completedOrders, lowStockProducts] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    prisma.order.findMany({
      where: {
        status: "COMPLETED",
        createdAt: { gte: startOfWindow },
      },
      orderBy: { createdAt: "asc" },
      include: { items: true },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        category: true,
        variants: {
          select: {
            stock: true,
            isActive: true,
          },
        },
      },
    }),
  ]);

  const lowStockItems = lowStockProducts
    .map((product) => ({
      ...product,
      availableStock: getAvailableStock(product),
    }))
    .filter((product) => product.availableStock > 0 && product.availableStock <= 5)
    .sort((a, b) => a.availableStock - b.availableStock || a.name.localeCompare(b.name, "vi"))
    .slice(0, 8);

  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total.toNumber(), 0);
  const paidRevenue = orders
    .filter((order) => order.paymentStatus === "PAID")
    .reduce((sum, order) => sum + order.total.toNumber(), 0);
  const averageOrderValue = completedOrders.length ? totalRevenue / completedOrders.length : 0;

  const statusCounts = Object.entries(statusLabels).map(([status, label]) => ({
    status,
    label,
    count: orders.filter((order) => order.status === status).length,
  }));

  const monthKeys = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return monthKey(date);
  });
  const monthlyRevenue = monthKeys.map((key) => ({
    key,
    label: monthLabel(key),
    revenue: completedOrders
      .filter((order) => monthKey(order.createdAt) === key)
      .reduce((sum, order) => sum + order.total.toNumber(), 0),
  }));
  const maxMonthlyRevenue = Math.max(...monthlyRevenue.map((item) => item.revenue), 1);

  const bestSellerMap = new Map<string, { name: string; sku: string; quantity: number; revenue: number }>();
  for (const order of completedOrders) {
    for (const item of order.items) {
      const key = item.productId ? String(item.productId) : item.sku;
      const current = bestSellerMap.get(key) ?? { name: item.name, sku: item.sku, quantity: 0, revenue: 0 };
      current.quantity += item.quantity;
      current.revenue += item.total.toNumber();
      bestSellerMap.set(key, current);
    }
  }
  const bestSellers = [...bestSellerMap.values()]
    .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
    .slice(0, 8);

  const stats = [
    { label: "Doanh thu 6 tháng", value: formatCurrency(totalRevenue), note: `${completedOrders.length} đơn hoàn thành`, icon: CircleDollarSign },
    { label: "Giá trị đơn trung bình", value: formatCurrency(averageOrderValue), note: "Tính trên đơn hoàn thành", icon: BarChart3 },
    { label: "Đã thanh toán", value: formatCurrency(paidRevenue), note: "Gồm thanh toán điện tử demo", icon: ClipboardList },
    { label: "Tồn kho thấp", value: String(lowStockItems.length), note: "Tính cả tồn kho biến thể", icon: AlertTriangle },
  ];

  return (
    <main className="space-y-8">
      <div className="hm-surface flex flex-col justify-between gap-4 p-6 md:flex-row md:items-end">
        <div>
          <p className="hm-kicker">Báo cáo quản trị</p>
          <h1 className="hm-page-title mt-2">Thống kê kinh doanh</h1>
          <p className="mt-2 text-sm text-ink/55 dark:text-ivory/65">Tổng hợp doanh thu, sản phẩm bán chạy, tồn kho và trạng thái đơn hàng.</p>
        </div>
        <Link href="/admin/orders" className="hm-btn-primary w-full sm:w-auto">Xử lý đơn hàng</Link>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, note, icon: Icon }) => (
          <article key={label} className="hm-surface-lift p-6">
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-ink/55 dark:text-ivory/65">{label}</p>
              <span className="grid size-10 place-items-center rounded-lg bg-copper/10 text-copper">
                <Icon size={18} />
              </span>
            </div>
            <p className="mt-3 font-serif text-3xl">{value}</p>
            <p className="mt-3 text-sm text-taupe dark:text-ivory/60">{note}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="hm-surface p-6">
          <h2 className="font-serif text-3xl">Doanh thu theo tháng</h2>
          <div className="mt-6 space-y-4">
            {monthlyRevenue.map((item) => (
              <div key={item.key} className="grid gap-2 sm:grid-cols-[130px_1fr_140px] sm:items-center">
                <p className="text-sm font-semibold text-ink/65 dark:text-ivory/70">{item.label}</p>
                <div className="h-3 overflow-hidden rounded-full bg-ink/10 dark:bg-white/10">
                  <div className="h-full rounded-full bg-copper" style={{ width: `${Math.max(3, item.revenue / maxMonthlyRevenue * 100)}%` }} />
                </div>
                <p className="text-sm font-bold sm:text-right">{formatCurrency(item.revenue)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="hm-surface p-6">
          <h2 className="font-serif text-3xl">Trạng thái đơn</h2>
          <div className="mt-6 grid gap-3">
            {statusCounts.map((item) => (
              <div key={item.status} className="flex items-center justify-between rounded-xl border border-ink/10 p-4 dark:border-white/10">
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="font-serif text-2xl">{item.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <div className="hm-surface p-6">
          <div className="flex items-center gap-3">
            <Boxes size={22} className="text-copper" />
            <h2 className="font-serif text-3xl">Sản phẩm bán chạy</h2>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="hm-table min-w-[620px]">
              <thead className="border-b border-ink/10 text-ink/45 dark:text-ivory/55">
                <tr>
                  <th className="py-3 font-medium">Sản phẩm</th>
                  <th className="py-3 font-medium">Đã bán</th>
                  <th className="py-3 font-medium">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {bestSellers.length === 0 ? (
                  <tr><td colSpan={3} className="py-6 text-ink/55 dark:text-ivory/65">Chưa có đơn hoàn thành để thống kê.</td></tr>
                ) : bestSellers.map((item) => (
                  <tr key={item.sku}>
                    <td className="py-4">
                      <p className="font-semibold">{item.name}</p>
                      <p className="mt-1 text-xs text-ink/45 dark:text-ivory/55">{item.sku}</p>
                    </td>
                    <td className="py-4">{item.quantity}</td>
                    <td className="py-4">{formatCurrency(item.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="hm-surface p-6">
          <h2 className="font-serif text-3xl">Tồn kho thấp</h2>
          <div className="mt-6 grid gap-3">
            {lowStockItems.length === 0 ? (
              <p className="rounded-xl border border-ink/10 p-5 text-sm text-ink/55 dark:border-white/10 dark:text-ivory/60">Không có sản phẩm tồn kho thấp.</p>
            ) : lowStockItems.map((product) => (
              <Link key={product.id} href={`/admin/products?edit=${product.id}`} className="flex items-center justify-between gap-4 rounded-xl border border-ink/10 p-4 transition hover:border-copper dark:border-white/10">
                <span>
                  <span className="block text-sm font-semibold">{product.name}</span>
                  <span className="mt-1 block text-xs text-ink/45 dark:text-ivory/55">{product.category.name}</span>
                </span>
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-500 dark:bg-red-500/15 dark:text-red-300">{product.availableStock}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
