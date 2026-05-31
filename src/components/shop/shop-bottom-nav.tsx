"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, ShoppingBag, UserRound, MessageCircle } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

const items = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/products", label: "Sản phẩm", icon: Package },
  { href: "/cart", label: "Giỏ hàng", icon: ShoppingBag },
  { href: "/account", label: "Tài khoản", icon: UserRound },
  { href: "/contact", label: "Liên hệ", icon: MessageCircle },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ShopBottomNav() {
  const pathname = usePathname() ?? "/";
  const totalQuantity = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-10px_35px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/95 lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActivePath(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              className={`relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-bold transition-colors ${
                active
                  ? "bg-ink text-ivory dark:bg-ivory dark:text-ink"
                  : "text-ink/55 hover:bg-porcelain hover:text-copper dark:text-ivory/60 dark:hover:bg-white/10"
              }`}
            >
              <span className="relative">
                <Icon size={18} />
                {href === "/cart" && totalQuantity > 0 ? (
                  <span className="absolute -right-2 -top-2 grid min-w-4 place-items-center rounded-full bg-copper px-1 text-[9px] leading-4 text-white">
                    {totalQuantity > 99 ? "99+" : totalQuantity}
                  </span>
                ) : null}
              </span>
              <span className="w-full truncate text-center">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
