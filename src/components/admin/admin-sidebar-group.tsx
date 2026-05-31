"use client";

import { useMemo, useState } from "react";
import { ChevronDown, FolderKanban, LifeBuoy, Settings2, Store, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { AdminSidebarLink } from "@/components/admin/admin-sidebar-link";

type AdminSidebarGroupProps = {
  title: string;
  icon: keyof typeof groupIcons;
  defaultOpen?: boolean;
  items: Array<{
    href: string;
    icon: Parameters<typeof AdminSidebarLink>[0]["icon"];
    label: string;
  }>;
};

const groupIcons: Record<string, LucideIcon> = {
  overview: FolderKanban,
  catalog: Store,
  operations: LifeBuoy,
  system: Settings2,
};

export function AdminSidebarGroup({ title, icon, defaultOpen, items }: AdminSidebarGroupProps) {
  const pathname = usePathname();
  const hasActiveItem = useMemo(
    () => items.some((item) => item.href === "/admin" ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)),
    [items, pathname],
  );
  const [isOpen, setIsOpen] = useState(defaultOpen ?? hasActiveItem);
  const Icon = groupIcons[icon];

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-ivory/5 bg-ivory/[0.025] p-1.5">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className={`flex h-11 w-full items-center justify-between rounded-xl px-3 text-left text-[11px] font-bold uppercase tracking-[0.18em] transition-all ${
          hasActiveItem ? "bg-ivory/10 text-ivory" : "text-ivory/35 hover:bg-ivory/5 hover:text-ivory/80"
        }`}
      >
        <span className="flex min-w-0 items-center gap-3">
          <Icon size={16} className={hasActiveItem ? "text-copper" : ""} />
          <span className="truncate">{title}</span>
        </span>
        <ChevronDown size={16} className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen ? (
        <div className="mt-1 space-y-1 px-1 pb-1">
          {items.map((item) => (
            <AdminSidebarLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
