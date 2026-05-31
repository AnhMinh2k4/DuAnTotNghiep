import Link from "next/link";
import { ArrowRight, BadgeCheck, Boxes, ClipboardList, LifeBuoy, PackageCheck, PackagePlus, Percent, PlusCircle } from "lucide-react";
import { canManageCatalog, canManageOperations, requireAdminSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const orderStatusLabel = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const orderStatusTone = {
  PENDING: "bg-copper/12 text-copper",
  CONFIRMED: "bg-skywash text-blue-900 dark:bg-sky-500/15 dark:text-sky-200",
  SHIPPING: "bg-ink/5 text-ink/65 dark:bg-white/10 dark:text-ivory/70",
  COMPLETED: "bg-sage/18 text-green-800 dark:bg-sage/15 dark:text-sage",
  CANCELLED: "bg-red-500/10 text-red-600 dark:text-red-300",
};

function getAvailableStock(product: { stock: number; variants: Array<{ stock: number; isActive: boolean }> }) {
  const activeVariants = product.variants.filter((variant) => variant.isActive);
  return activeVariants.length
    ? activeVariants.reduce((sum, variant) => sum + variant.stock, 0)
    : product.stock;
}

export default async function AdminPage() {
  const user = await requireAdminSession();

  const [orderCount, pendingOrders, productCount, inventoryProducts, completedOrders, recentOrders, openSupportRequests, unresolvedQuestions] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.findMany({
      where: { isActive: true },
      select: {
        stock: true,
        variants: {
          select: {
            stock: true,
            isActive: true,
          },
        },
      },
    }),
    prisma.order.findMany({
      where: { status: "COMPLETED" },
      select: { total: true },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    }),
    prisma.supportRequest.count({ where: { status: { in: ["OPEN", "PROCESSING"] } } }),
    prisma.customerQuestion.count({ where: { isResolved: false } }),
  ]);

  const revenue = completedOrders.reduce((sum, order) => sum + order.total.toNumber(), 0);
  const lowStockCount = inventoryProducts.filter((product) => {
    const availableStock = getAvailableStock(product);
    return availableStock > 0 && availableStock <= 5;
  }).length;

  const stats = [
    { label: "Doanh thu hoàn thành", value: formatCurrency({ toNumber: () => revenue }), note: "Tính trên đơn đã hoàn thành", icon: BadgeCheck, tone: "bg-sage/18 text-green-800 dark:bg-sage/15 dark:text-sage" },
    { label: "Tổng đơn hàng", value: String(orderCount), note: `${pendingOrders} đơn chờ xác nhận`, icon: PackageCheck, tone: "bg-skywash text-blue-900 dark:bg-sky-500/15 dark:text-sky-200" },
    { label: "Sản phẩm đang bán", value: String(productCount), note: `${lowStockCount} sản phẩm tồn kho thấp`, icon: Boxes, tone: "bg-copper/12 text-copper" },
  ];
  const quickActions = [
    { label: "Tạo sản phẩm", href: "/admin/products?add=true", icon: PackagePlus, canSee: canManageCatalog(user.role) },
    { label: "Đơn chờ xử lý", href: "/admin/orders?status=PENDING", icon: ClipboardList, canSee: canManageOperations(user.role), badge: pendingOrders },
    { label: "Yêu cầu hỗ trợ", href: "/admin/support-requests", icon: LifeBuoy, canSee: canManageOperations(user.role), badge: openSupportRequests },
    { label: "Tạo coupon", href: "/admin/coupons", icon: Percent, canSee: canManageCatalog(user.role) },
  ].filter((item) => item.canSee);
  const focusItems = [
    { label: "Đơn chờ xác nhận", value: pendingOrders, href: "/admin/orders?status=PENDING" },
    { label: "Câu hỏi chưa xử lý", value: unresolvedQuestions, href: "/admin/questions" },
    { label: "Bảo hành/đổi trả mở", value: openSupportRequests, href: "/admin/support-requests" },
    { label: "Sản phẩm tồn kho thấp", value: lowStockCount, href: "/admin/reports" },
  ];

  return (
    <main className="py-2 sm:py-4">
      <div className="relative overflow-hidden rounded-3xl bg-ink p-6 text-ivory shadow-[0_28px_80px_rgba(21,21,21,0.22)] dark:bg-zinc-900 sm:p-8">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_80%_30%,rgba(194,106,69,0.28),transparent_34%),radial-gradient(circle_at_50%_85%,rgba(143,174,154,0.22),transparent_36%)]" />
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-copper">Tổng quan vận hành</p>
            <h1 className="mt-3 font-serif text-3xl leading-tight sm:text-5xl lg:text-6xl">Bảng điều khiển CMS</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ivory/62">
              Theo dõi đơn hàng, tồn kho, hỗ trợ khách hàng và các việc cần xử lý trong ngày.
            </p>
            <p className="mt-4 inline-flex rounded-full border border-ivory/10 bg-white/8 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-ivory/60">
              {user.name} / {user.role}
            </p>
          </div>
          <Link href="/admin/orders" className="hm-btn-primary h-12 w-full bg-ivory text-ink hover:bg-sage hover:text-ink sm:w-auto">
            Quản lý đơn hàng
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <article key={stat.label} className="hm-surface-lift p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-ink/55 dark:text-ivory/65">{stat.label}</p>
              <span className={`grid size-10 place-items-center rounded-lg ${stat.tone}`}>
                <stat.icon size={18} />
              </span>
            </div>
            <p className="mt-3 break-words font-serif text-3xl sm:text-4xl">{stat.value}</p>
            <p className="mt-3 text-sm text-taupe dark:text-ivory/60">{stat.note}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <div className="hm-surface p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <PlusCircle size={20} className="text-copper" />
            <h2 className="font-serif text-3xl">Thao tác nhanh</h2>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {quickActions.map(({ label, href, icon: Icon, badge }) => (
              <Link key={href} href={href} className="group flex items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-white p-4 transition hover:-translate-y-0.5 hover:border-copper/40 hover:shadow-soft dark:border-white/10 dark:bg-white/5">
                <span className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-copper/10 text-copper transition group-hover:bg-copper group-hover:text-white">
                    <Icon size={18} />
                  </span>
                  <span className="text-sm font-bold">{label}</span>
                </span>
                {typeof badge === "number" ? <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-ivory dark:bg-ivory dark:text-ink">{badge}</span> : <ArrowRight size={16} className="text-ink/35 dark:text-ivory/45" />}
              </Link>
            ))}
          </div>
        </div>

        <div className="hm-surface p-5 sm:p-6">
          <h2 className="font-serif text-3xl">Cần chú ý</h2>
          <div className="mt-5 grid gap-3">
            {focusItems.map((item) => (
              <Link key={item.label} href={item.href} className="flex items-center justify-between rounded-xl border border-ink/10 p-4 transition hover:border-copper dark:border-white/10">
                <span className="text-sm font-semibold text-ink/70 dark:text-ivory/75">{item.label}</span>
                <span className={`font-serif text-2xl ${item.value > 0 ? "text-copper" : "text-sage"}`}>{item.value}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="hm-surface mt-8 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-ink/5 bg-porcelain/50 p-5 dark:border-white/10 dark:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-copper">Theo dõi nhanh</p>
            <h2 className="mt-1 font-serif text-3xl">Đơn hàng gần đây</h2>
          </div>
          <Link href="/admin/orders" className="hm-btn-secondary h-11 w-full sm:w-auto">
            Xem tất cả
          </Link>
        </div>
        <div className="overflow-x-auto p-5 sm:p-6">
          <table className="hm-table min-w-[760px]">
            <thead className="border-b border-ink/10 text-ink/45 dark:text-ivory/55">
              <tr>
                <th className="py-3 font-medium">Mã đơn</th>
                <th className="py-3 font-medium">Khách hàng</th>
                <th className="py-3 font-medium">Sản phẩm</th>
                <th className="py-3 font-medium">Tổng tiền</th>
                <th className="py-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-ink/55 dark:text-ivory/65">Chưa có đơn hàng nào.</td>
                </tr>
              ) : recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="py-4 text-ink/75 dark:text-ivory/75">HM-{String(order.id).padStart(5, "0")}</td>
                  <td className="py-4 text-ink/75 dark:text-ivory/75">{order.customerName}</td>
                  <td className="py-4 text-ink/75 dark:text-ivory/75">{order.items.length}</td>
                  <td className="py-4 text-ink/75 dark:text-ivory/75">{formatCurrency(order.total)}</td>
                  <td className="py-4 text-ink/75 dark:text-ivory/75">
                    <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${orderStatusTone[order.status]}`}>
                      {orderStatusLabel[order.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
