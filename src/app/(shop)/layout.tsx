import Link from "next/link";
import { UserRound, Github, Instagram, Twitter, Facebook, MapPin, Phone, Mail } from "lucide-react";
import { getShopShellData } from "@/lib/shop-shell";
import { AiSupportChat } from "@/components/shop/ai-support-chat";
import { CartLink } from "@/components/shop/cart-link";
import { ShopSearch } from "@/components/shop/shop-search";
import { ShopNavigation } from "@/components/shop/shop-navigation";
import { ShopBottomNav } from "@/components/shop/shop-bottom-nav";

export default async function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [categories, searchProducts, searchBrands] = await getShopShellData();
  const searchItems = [
    ...categories.map((category) => ({
      href: `/products?category=${category.slug}`,
      title: category.name,
      subtitle: "Danh mục sản phẩm",
      keywords: `${category.slug} ${category.description ?? ""}`,
      type: "category" as const,
    })),
    ...searchBrands
      .filter((item): item is { brand: string } => Boolean(item.brand))
      .map((item) => ({
        href: `/products?brand=${encodeURIComponent(item.brand)}`,
        title: item.brand,
        subtitle: "Thương hiệu",
        keywords: item.brand,
        type: "brand" as const,
      })),
    ...searchProducts.map((product) => ({
      href: `/products/${product.slug}`,
      title: product.name,
      subtitle: `${product.category.name}${product.brand ? ` • ${product.brand}` : ""}`,
      keywords: `${product.slug} ${product.sku} ${product.brand ?? ""} ${product.category.name}`,
      type: "product" as const,
    })),
  ];
  const navigationCategories = categories.map(({ id, name, slug }) => ({ id, name, slug }));
  const socialLinks = [
    {
      icon: Twitter,
      label: "Twitter",
      className:
        "hover:border-sky-500 hover:bg-sky-500 hover:text-white dark:hover:border-sky-500 dark:hover:bg-sky-500 dark:hover:text-white",
    },
    {
      icon: Instagram,
      label: "Instagram",
      className:
        "hover:border-pink-500 hover:bg-pink-500 hover:text-white dark:hover:border-pink-500 dark:hover:bg-pink-500 dark:hover:text-white",
    },
    {
      icon: Facebook,
      label: "Facebook",
      className:
        "hover:border-blue-600 hover:bg-blue-600 hover:text-white dark:hover:border-blue-600 dark:hover:bg-blue-600 dark:hover:text-white",
    },
    {
      icon: Github,
      label: "GitHub",
      className:
        "hover:border-zinc-900 hover:bg-zinc-900 hover:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-zinc-950",
    },
  ];

  return (
    <div className="flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-porcelain text-ink transition-colors dark:bg-zinc-950 dark:text-ivory">
      <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-ink/10 bg-white/95 shadow-[0_1px_0_rgba(21,21,21,0.04)] backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-zinc-950/95">
        <div className="mx-auto flex min-h-[64px] max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:min-h-20 sm:gap-6 sm:px-5 md:px-8 lg:min-h-24 lg:py-0">
          <Link href="/" className="group flex min-w-0 shrink items-center gap-2 sm:shrink-0 sm:gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink font-serif text-[13px] text-ivory transition-colors group-hover:bg-copper dark:bg-ivory dark:text-ink dark:group-hover:bg-copper dark:group-hover:text-white sm:size-11 sm:text-base">
              TS
            </div>
            <div className="min-w-0 leading-none">
              <span className="block truncate font-serif text-base text-ink dark:text-ivory sm:text-2xl">TMDT Shop</span>
              <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.22em] text-ink/35 dark:text-ivory/45 sm:text-[10px]">Shop</span>
            </div>
          </Link>

          <ShopNavigation categories={navigationCategories} variant="desktop" />

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <ShopSearch items={searchItems} variant="icon" />
            <Link href="/account" className="hm-icon-btn size-9 rounded-lg sm:size-11 sm:rounded-xl" aria-label="Tài khoản">
              <UserRound size={18} />
            </Link>
            <CartLink />
          </div>
        </div>
        <ShopNavigation categories={navigationCategories} variant="mobile" />
      </header>

      <main className="flex-1 pb-24 pt-[122px] sm:pt-[138px] lg:pb-0 lg:pt-24">
        {children}
      </main>

      <footer className="border-t border-ink/5 bg-white pb-12 pt-24 dark:border-white/10 dark:bg-zinc-950">
        <div className="hm-shell">
          <div className="grid gap-16 md:grid-cols-[1.2fr_0.8fr_0.8fr_1.2fr]">
            {/* Brand Info */}
            <div className="space-y-8">
              <Link href="/" className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-ink font-serif text-lg text-ivory">TS</span>
                <span className="font-serif text-2xl">TMDT Shop</span>
              </Link>
              <p className="text-lg italic leading-relaxed text-ink/55 dark:text-ivory/65">
                &ldquo;Hoàn thiện không gian công nghệ của bạn bằng những giải pháp tối ưu nhất.&rdquo;
              </p>
              <div className="flex gap-4">
                {socialLinks.map(({ icon: Icon, label, className }) => (
                  <Link
                    key={label}
                    href="#"
                    aria-label={label}
                    className={`grid size-10 place-items-center rounded-xl border border-ink/5 bg-porcelain text-ink/45 transition-all dark:border-white/10 dark:bg-white/10 dark:text-ivory/70 ${className}`}
                  >
                    <Icon size={18} />
                  </Link>
                ))}
              </div>
            </div>

            {/* Categories column */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-ink dark:text-ivory">Danh mục</h4>
              <nav className="mt-8 flex flex-col gap-4 text-sm text-ink/55 dark:text-ivory/65">
                {categories.map((cat) => (
                  <Link key={cat.id} href={`/products?category=${cat.slug}`} className="transition-colors hover:text-copper">{cat.name}</Link>
                ))}
              </nav>
            </div>

            {/* Customer Support */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-ink dark:text-ivory">Hỗ trợ khách hàng</h4>
              <nav className="mt-8 flex flex-col gap-4 text-sm text-ink/55 dark:text-ivory/65">
                <Link href="/support/warranty" className="transition-colors hover:text-copper">Chính sách bảo hành</Link>
                <Link href="/support/returns" className="transition-colors hover:text-copper">Đổi trả sản phẩm</Link>
                <Link href="/support/payment" className="transition-colors hover:text-copper">Phương thức thanh toán</Link>
                <Link href="/support/shipping" className="transition-colors hover:text-copper">Vận chuyển & Giao hàng</Link>
                <Link href="/contact" className="transition-colors hover:text-copper">Gửi câu hỏi cho shop</Link>
              </nav>
            </div>

            {/* Contact & Certification */}
            <div className="space-y-8">
              <div className="rounded-3xl border border-ink/5 bg-porcelain p-8 dark:border-white/10 dark:bg-white/10">
                <h4 className="mb-6 text-[10px] font-bold uppercase tracking-[0.25em] text-ink dark:text-ivory">Liên hệ trực tiếp</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Phone size={18} className="text-copper" />
                    <p className="text-sm font-bold text-ink dark:text-ivory">1800 6601 (Miễn phí)</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Mail size={18} className="text-copper" />
                    <p className="break-all text-sm font-bold text-ink dark:text-ivory">hotro@tmdtshop.local</p>
                  </div>
                  <div className="flex items-start gap-4 pt-2">
                    <MapPin size={18} className="text-copper shrink-0" />
                    <p className="text-xs leading-relaxed text-ink/55 dark:text-ivory/65">Đường Hùng Vương, <br />Thừa Thiên Huế</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 flex flex-col justify-between gap-6 border-t border-ink/5 pt-12 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/45 dark:border-white/10 dark:text-ivory/50 md:flex-row">
            <p>© 2024 CÔNG TY TNHH CÔNG NGHỆ TMDT. ĐKKD số: 0123456789 do Sở KH&ĐT Thừa Thiên Huế cấp.</p>
            <div className="flex flex-wrap gap-4 sm:gap-8">
              <Link href="/support/warranty" className="transition-colors hover:text-ink dark:hover:text-ivory">Chính sách bảo mật</Link>
              <Link href="/support/returns" className="transition-colors hover:text-ink dark:hover:text-ivory">Điều khoản mua sắm</Link>
            </div>
          </div>
        </div>
      </footer>
      <ShopBottomNav />
      <AiSupportChat />
    </div>
  );
}
