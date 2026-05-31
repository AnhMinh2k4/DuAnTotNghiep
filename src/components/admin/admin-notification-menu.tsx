"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, ClipboardList, HelpCircle, ShieldCheck } from "lucide-react";

type AdminNotificationMenuProps = {
  pendingOrderCount: number;
  unresolvedQuestionCount: number;
  openSupportCount: number;
};

export function AdminNotificationMenu({
  pendingOrderCount,
  unresolvedQuestionCount,
  openSupportCount,
}: AdminNotificationMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const notificationCount = pendingOrderCount + unresolvedQuestionCount + openSupportCount;
  const items = [
    {
      label: "Đơn chờ xác nhận",
      description: "Các đơn mới cần admin hoặc staff kiểm tra.",
      count: pendingOrderCount,
      href: "/admin/orders?status=PENDING",
      icon: ClipboardList,
    },
    {
      label: "Câu hỏi chưa xử lý",
      description: "Tin nhắn liên hệ khách gửi từ storefront.",
      count: unresolvedQuestionCount,
      href: "/admin/questions",
      icon: HelpCircle,
    },
    {
      label: "Bảo hành / đổi trả",
      description: "Yêu cầu sau bán đang mở hoặc đang xử lý.",
      count: openSupportCount,
      href: "/admin/support-requests",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="relative grid size-11 place-items-center rounded-2xl border border-ink/10 bg-white/80 text-ink/55 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-copper/40 hover:bg-copper hover:text-white hover:shadow-lg hover:shadow-copper/15 dark:border-white/10 dark:bg-white/5 dark:text-ivory/60 dark:hover:bg-copper dark:hover:text-white"
        aria-label="Thông báo quản trị"
        aria-expanded={isOpen}
      >
        <Bell size={18} />
        {notificationCount > 0 ? (
          <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-copper px-1.5 py-0.5 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-950">
            {notificationCount > 99 ? "99+" : notificationCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-14 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-2xl shadow-ink/10 dark:border-white/10 dark:bg-zinc-900 dark:shadow-black/30">
          <div className="border-b border-ink/5 px-5 py-4 dark:border-white/10">
            <p className="text-sm font-bold text-ink dark:text-ivory">Thông báo quản trị</p>
            <p className="mt-1 text-xs text-ink/45 dark:text-ivory/55">
              {notificationCount > 0 ? `${notificationCount} việc cần kiểm tra` : "Không có việc tồn đọng."}
            </p>
          </div>

          <div className="p-2">
            {items.map(({ label, description, count, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className="flex items-start gap-3 rounded-xl p-3 transition hover:bg-porcelain dark:hover:bg-white/5"
              >
                <span className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl ${count > 0 ? "bg-copper/10 text-copper" : "bg-ink/5 text-ink/35 dark:bg-white/10 dark:text-ivory/40"}`}>
                  <Icon size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-ink dark:text-ivory">{label}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${count > 0 ? "bg-copper text-white" : "bg-ink/5 text-ink/40 dark:bg-white/10 dark:text-ivory/45"}`}>
                      {count}
                    </span>
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-ink/50 dark:text-ivory/55">{description}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
