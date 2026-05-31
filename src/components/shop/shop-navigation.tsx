"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Home, Info, MessageCircle, ShieldCheck, ShoppingBag } from "lucide-react";

type ShopNavigationCategory = {
  id: number;
  name: string;
  slug: string;
};

type ShopNavigationProps = {
  categories: ShopNavigationCategory[];
  variant: "desktop" | "mobile";
};

const desktopLinkClass = "transition-colors hover:text-copper";
const desktopActiveLinkClass = "text-copper";
const mobileBaseClass =
  "group inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-3.5 text-[10px] font-bold uppercase tracking-[0.12em] transition-all duration-300";
const mobileActiveClass = "bg-ink text-ivory shadow-[0_10px_28px_rgba(21,21,21,0.18)] dark:bg-ivory dark:text-ink";
const mobileInactiveClass =
  "border border-ink/10 bg-white/70 text-ink/58 hover:border-copper/40 hover:text-copper dark:border-white/10 dark:bg-white/10 dark:text-ivory/72 dark:hover:border-copper/50 dark:hover:text-copper";

const mobileLinks = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/products", label: "Sản phẩm", icon: ShoppingBag },
  { href: "/about", label: "Về shop", icon: Info },
  { href: "/support/warranty", activeHref: "/support", label: "Chính sách", icon: ShieldCheck },
  { href: "/contact", label: "Liên hệ", icon: MessageCircle },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function navClass(pathname: string, href: string, extraClass = "") {
  return [
    desktopLinkClass,
    isActivePath(pathname, href) ? desktopActiveLinkClass : "",
    extraClass,
  ]
    .filter(Boolean)
    .join(" ");
}

function mobileNavClass(pathname: string, href: string) {
  return [
    mobileBaseClass,
    isActivePath(pathname, href) ? mobileActiveClass : mobileInactiveClass,
  ].join(" ");
}

export function ShopNavigation({ categories, variant }: ShopNavigationProps) {
  const pathname = usePathname() ?? "/";

  if (variant === "desktop") {
    return (
      <nav className="hidden flex-1 items-center justify-center gap-8 text-[15px] font-semibold text-ink/65 dark:text-ivory/70 lg:flex">
        <Link href="/" className={navClass(pathname, "/")}>
          Trang chủ
        </Link>
        <Link href="/about" className={navClass(pathname, "/about")}>
          Về chúng tôi
        </Link>

        <div className="group relative">
          <Link href="/products" className={navClass(pathname, "/products", "flex items-center gap-1.5 py-9")}>
            Sản phẩm
            <ChevronDown size={15} className="transition-transform group-hover:rotate-180" />
          </Link>
          <div className="invisible absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 translate-y-3 rounded-2xl border border-ink/5 bg-white p-3 opacity-0 shadow-2xl shadow-ink/10 transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 dark:border-white/10 dark:bg-zinc-900">
            <Link href="/products" className="mb-2 block rounded-xl bg-porcelain px-4 py-3 text-sm font-bold text-ink transition-colors hover:text-copper dark:bg-white/10 dark:text-ivory">
              Tất cả sản phẩm
            </Link>
            {categories.map((cat) => (
              <Link key={cat.id} href={`/products?category=${cat.slug}`} className="block rounded-xl px-4 py-3 text-sm text-ink/65 transition-colors hover:bg-porcelain hover:text-copper dark:text-ivory/70 dark:hover:bg-white/10">
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="group relative">
          <button type="button" className={navClass(pathname, "/support", "flex items-center gap-1.5 py-9")}>
            Chính sách
            <ChevronDown size={15} className="transition-transform group-hover:rotate-180" />
          </button>
          <div className="invisible absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 translate-y-3 rounded-2xl border border-ink/5 bg-white p-3 opacity-0 shadow-2xl shadow-ink/10 transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 dark:border-white/10 dark:bg-zinc-900">
            <Link href="/support/warranty" className="block rounded-xl px-4 py-3 text-sm text-ink/65 transition-colors hover:bg-porcelain hover:text-copper dark:text-ivory/70 dark:hover:bg-white/10">Chính sách bảo hành</Link>
            <Link href="/support/returns" className="block rounded-xl px-4 py-3 text-sm text-ink/65 transition-colors hover:bg-porcelain hover:text-copper dark:text-ivory/70 dark:hover:bg-white/10">Đổi trả sản phẩm</Link>
            <Link href="/support/payment" className="block rounded-xl px-4 py-3 text-sm text-ink/65 transition-colors hover:bg-porcelain hover:text-copper dark:text-ivory/70 dark:hover:bg-white/10">Phương thức thanh toán</Link>
            <Link href="/support/shipping" className="block rounded-xl px-4 py-3 text-sm text-ink/65 transition-colors hover:bg-porcelain hover:text-copper dark:text-ivory/70 dark:hover:bg-white/10">Vận chuyển & Giao hàng</Link>
          </div>
        </div>

        <Link href="/contact" className={navClass(pathname, "/contact")}>
          Liên hệ
        </Link>
      </nav>
    );
  }

  return (
    <nav className="border-t border-ink/5 bg-white/92 px-3 py-2 shadow-[0_10px_28px_rgba(21,21,21,0.05)] backdrop-blur-xl dark:border-white/5 dark:bg-zinc-950/92 lg:hidden">
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-2 md:px-5">
        {mobileLinks.map(({ href, activeHref, label, icon: Icon }) => {
          const isActive = isActivePath(pathname, activeHref ?? href);

          return (
            <Link key={href} href={href} className={mobileNavClass(pathname, activeHref ?? href)} aria-current={isActive ? "page" : undefined}>
              <Icon size={15} className={isActive ? "text-copper" : "text-ink/35 transition-colors group-hover:text-copper dark:text-ivory/45"} />
              <span className="whitespace-nowrap">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
