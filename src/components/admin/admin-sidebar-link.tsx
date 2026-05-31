"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderTree,
  HelpCircle,
  LayoutDashboard,
  MessageSquareText,
  Package,
  Percent,
  BarChart3,
  Bot,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  reports: BarChart3,
  products: Package,
  categories: FolderTree,
  orders: ShoppingCart,
  coupons: Percent,
  reviews: MessageSquareText,
  questions: HelpCircle,
  aiTraining: Bot,
  shipping: Truck,
  users: Users,
  settings: Settings,
  support: ShieldCheck,
};

export function AdminSidebarLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: keyof typeof icons;
  label: string;
}) {
  const pathname = usePathname();
  const Icon = icons[icon];
  const isActive = href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`group flex h-11 shrink-0 items-center gap-2.5 rounded-xl px-3.5 text-xs font-bold transition-all duration-300 lg:gap-3 lg:px-4 lg:text-sm lg:font-medium ${
        isActive
          ? "bg-ink text-ivory shadow-lg shadow-ink/12 dark:bg-ivory dark:text-ink lg:bg-ivory lg:text-ink lg:shadow-black/20 lg:dark:bg-ivory lg:dark:text-ink"
          : "border border-ink/5 bg-white/70 text-ink/55 hover:border-copper/40 hover:text-copper dark:border-white/10 dark:bg-white/5 dark:text-ivory/65 lg:border-transparent lg:bg-transparent lg:text-ivory/50 lg:hover:bg-ivory/5 lg:hover:text-ivory"
      }`}
    >
      <Icon
        size={18}
        className={`transition-all group-hover:scale-110 ${
          isActive ? "text-copper" : "group-hover:text-copper"
        }`}
      />
      <span className="whitespace-nowrap">{label}</span>
    </Link>
  );
}
