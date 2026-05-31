import Link from "next/link";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { AdminCommandSearch } from "@/components/admin/admin-command-search";
import { AdminNotificationMenu } from "@/components/admin/admin-notification-menu";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { AdminSidebarGroup } from "@/components/admin/admin-sidebar-group";
import { AdminSidebarLink } from "@/components/admin/admin-sidebar-link";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { canManageCatalog, canManageOperations, canManageUsers, getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const links = [
  { label: "Bảng điều khiển", href: "/admin", icon: "dashboard", description: "Xem tổng quan doanh thu, đơn hàng và hoạt động.", keywords: "dashboard tong quan thong ke", canSee: () => true },
  { label: "Báo cáo", href: "/admin/reports", icon: "reports", description: "Doanh thu, sản phẩm bán chạy, tồn kho và trạng thái đơn.", keywords: "bao cao thong ke doanh thu san pham ban chay ton kho", canSee: canManageOperations },
  { label: "Sản phẩm", href: "/admin/products", icon: "products", description: "Quản lý danh sách sản phẩm, giá bán và tồn kho.", keywords: "san pham product sku gia ton kho", canSee: canManageCatalog },
  { label: "Danh mục", href: "/admin/categories", icon: "categories", description: "Sắp xếp nhóm sản phẩm và đường dẫn danh mục.", keywords: "danh muc category nhom san pham", canSee: canManageCatalog },
  { label: "Mã giảm giá", href: "/admin/coupons", icon: "coupons", description: "Tạo và quản lý coupon áp dụng khi thanh toán.", keywords: "ma giam gia coupon khuyen mai voucher", canSee: canManageCatalog },
  { label: "Đơn hàng", href: "/admin/orders", icon: "orders", description: "Theo dõi, xác nhận và cập nhật trạng thái đơn hàng.", keywords: "don hang order van don trang thai", canSee: canManageOperations },
  { label: "Đánh giá", href: "/admin/reviews", icon: "reviews", description: "Duyệt, ẩn hiện và xóa đánh giá sản phẩm.", keywords: "danh gia review binh luan san pham", canSee: canManageOperations },
  { label: "Câu hỏi khách", href: "/admin/questions", icon: "questions", description: "Xử lý câu hỏi và phản hồi từ khách hàng.", keywords: "cau hoi khach hang lien he ho tro", canSee: canManageOperations },
  { label: "Bảo hành/đổi trả", href: "/admin/support-requests", icon: "support", description: "Theo dõi yêu cầu bảo hành và đổi trả sau bán.", keywords: "bao hanh doi tra ho tro sau ban", canSee: canManageOperations },
  { label: "Training chatbox", href: "/admin/ai-training", icon: "aiTraining", description: "Huấn luyện câu trả lời tự động cho chatbox.", keywords: "ai chatbox chatbot training cau tra loi tu dong", canSee: canManageOperations },
  { label: "Vận chuyển", href: "/admin/shipping", icon: "shipping", description: "Quản lý nhà cung cấp, shipper và tỉnh thành.", keywords: "van chuyen shipper nha cung cap tinh thanh", canSee: canManageCatalog },
  { label: "Người dùng", href: "/admin/users", icon: "users", description: "Quản lý khách hàng, nhân sự và phân quyền.", keywords: "nguoi dung user nhan vien khach hang phan quyen", canSee: canManageUsers },
];

const settingsLink = {
  label: "Cài đặt",
  href: "/admin/settings",
  icon: "settings",
  description: "Tùy chỉnh hồ sơ, cửa hàng, thông báo và bảo mật.",
  keywords: "cai dat setting ho so bao mat thong bao",
  canSee: canManageUsers,
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getAdminSession();

  if (!user) {
    return children;
  }

  const visibleLinks = links.filter((item) => item.canSee(user.role));
  const canSeeOperations = canManageOperations(user.role);
  const [pendingOrderCount, unresolvedQuestionCount, openSupportCount] = canSeeOperations ? await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.customerQuestion.count({ where: { isResolved: false } }),
    prisma.supportRequest.count({ where: { status: { in: ["OPEN", "PROCESSING"] } } }),
  ]) : [0, 0, 0];
  const visibleSettingsLink = settingsLink.canSee(user.role) ? settingsLink : null;
  const sidebarGroups = [
    {
      title: "Tổng quan",
      icon: "overview" as const,
      defaultOpen: true,
      items: visibleLinks.filter((item) => ["/admin", "/admin/reports"].includes(item.href)),
    },
    {
      title: "Bán hàng",
      icon: "catalog" as const,
      items: visibleLinks.filter((item) => ["/admin/products", "/admin/categories", "/admin/coupons", "/admin/shipping"].includes(item.href)),
    },
    {
      title: "Vận hành",
      icon: "operations" as const,
      items: visibleLinks.filter((item) => ["/admin/orders", "/admin/support-requests", "/admin/reviews", "/admin/questions", "/admin/ai-training"].includes(item.href)),
    },
    {
      title: "Hệ thống",
      icon: "system" as const,
      items: [
        ...visibleLinks.filter((item) => item.href === "/admin/users"),
        ...(visibleSettingsLink ? [visibleSettingsLink] : []),
      ],
    },
  ];
  const searchItems = (settingsLink.canSee(user.role) ? [...visibleLinks, settingsLink] : visibleLinks).map((item) => ({
    label: item.label,
    href: item.href,
    icon: item.icon,
    description: item.description,
    keywords: item.keywords,
  }));

  return (
    <div className="hm-admin-scope min-h-screen bg-[#fcfcfc] text-ink selection:bg-copper selection:text-white transition-colors dark:bg-zinc-950 dark:text-ivory">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 overflow-y-auto overscroll-contain border-r border-ink/5 bg-ink px-5 pb-24 pt-6 text-ivory [scrollbar-width:thin] [scrollbar-color:rgba(247,243,237,0.22)_transparent] lg:block">
        <div className="flex min-h-full flex-col">
          <Link href="/" className="group flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-ivory font-serif text-lg text-ink transition-all duration-300 group-hover:rotate-6">TS</div>
            <span className="font-serif text-2xl tracking-tight">TMDT Shop</span>
          </Link>

          <div className="mt-7 rounded-2xl border border-ivory/10 bg-ivory/5 p-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-gradient-to-tr from-sage to-copper flex items-center justify-center text-sm font-bold shadow-lg shadow-black/20">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-bold leading-tight">{user.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-sage animate-pulse" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-ivory/40">{user.role}</p>
                </div>
              </div>
            </div>
          </div>

          <nav className="mt-6 space-y-3">
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.3em] text-ivory/20">Menu quản trị</p>
            {sidebarGroups.map((group) => (
              <AdminSidebarGroup
                key={group.title}
                title={group.title}
                icon={group.icon}
                defaultOpen={group.defaultOpen}
                items={group.items.map((item) => ({ href: item.href, icon: item.icon, label: item.label }))}
              />
            ))}
          </nav>

          <div className="mt-6 space-y-2 border-t border-ivory/5 pt-5">
            <Link 
              href="/" 
              target="_blank" 
              className="flex h-12 items-center gap-3 rounded-xl px-4 text-[11px] font-bold uppercase tracking-widest text-ivory/30 transition-all hover:text-ivory hover:bg-ivory/5"
            >
              <ExternalLink size={16} />
              Cửa hàng
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-ink/5 bg-white/85 px-4 shadow-[0_1px_0_rgba(21,21,21,0.03)] backdrop-blur-2xl transition-all dark:border-white/5 dark:bg-zinc-950/82 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4 lg:gap-8">
            <Link href="/admin" className="flex min-w-0 items-center gap-3 lg:hidden">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink font-serif text-sm text-ivory dark:bg-ivory dark:text-ink">TS</span>
              <span className="min-w-0">
                <span className="block truncate font-serif text-lg leading-none">CMS</span>
                <span className="mt-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-copper">
                  <ShieldCheck size={11} />
                  Admin
                </span>
              </span>
            </Link>
            <AdminCommandSearch items={searchItems} />
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <ThemeToggle />
            <AdminNotificationMenu
              pendingOrderCount={pendingOrderCount}
              unresolvedQuestionCount={unresolvedQuestionCount}
              openSupportCount={openSupportCount}
            />
            <div className="h-8 w-px bg-ink/5 dark:bg-white/5" />
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <p className="text-xs font-bold leading-none">{user.name}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-copper mt-1.5">{user.role}</p>
              </div>
              <AdminLogoutButton />
            </div>
          </div>
        </header>

        <nav className="sticky top-20 z-30 flex gap-2 overflow-x-auto border-b border-ink/5 bg-white/90 px-4 py-3 text-ink shadow-[0_12px_28px_rgba(21,21,21,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/90 dark:text-ivory lg:hidden">
          {visibleLinks.map((item) => <AdminSidebarLink key={item.label} href={item.href} icon={item.icon} label={item.label} />)}
          {visibleSettingsLink ? <AdminSidebarLink href={visibleSettingsLink.href} icon={visibleSettingsLink.icon} label={visibleSettingsLink.label} /> : null}
        </nav>

        <div className="mx-auto max-w-[1600px] animate-slide-up p-4 sm:p-8 lg:p-12">
          {children}
        </div>
      </div>
    </div>
  );
}
