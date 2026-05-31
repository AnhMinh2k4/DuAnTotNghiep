import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Headphones, Mail, ShieldCheck, ShoppingBag, Sparkles, Truck } from "lucide-react";
import { getHomeCatalog } from "@/lib/catalog";
import { formatCurrency } from "@/lib/format";
import { getSiteSettings } from "@/lib/site-settings";
import { FadeIn, FadeInStagger, FadeInStaggerItem } from "@/components/common/motion-viewport";

export const revalidate = 300;

const heroImages = [
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85",
];

const fallbackCategoryImage =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85";

const trustSignals = [
  { label: "Bảo hành rõ ràng", icon: ShieldCheck },
  { label: "Giao hàng toàn quốc", icon: Truck },
  { label: "Tư vấn cấu hình", icon: Headphones },
];

export default async function Home() {
  const [{ categories, products }, siteSettings] = await Promise.all([
    getHomeCatalog(),
    getSiteSettings(),
  ]);

  return (
    <main className="overflow-hidden">
      {/* Hero Section with Parallax Effect */}
      <section className="relative overflow-hidden bg-ink text-ivory">
        <div className="absolute inset-0">
          <Image
            src={heroImages[0]}
            alt="Sản phẩm công nghệ tại TMDT Shop"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[58%_center] opacity-35 grayscale-[10%] transition-transform duration-[20s] hover:scale-110 sm:object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(21,21,21,0.78)_0%,rgba(21,21,21,0.72)_40%,rgba(21,21,21,0.94)_100%)] md:bg-gradient-to-r md:from-ink md:via-ink/80 md:to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(194,106,69,0.18),transparent_32%),radial-gradient(circle_at_20%_80%,rgba(143,174,154,0.18),transparent_34%)] md:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
        </div>
        
        <div className="relative mx-auto grid min-h-[calc(100svh-112px)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-5 sm:py-16 md:grid-cols-[1.1fr_0.9fr] md:px-8">
          <FadeIn viewPortOnce={false}>
            <div className="max-w-3xl text-center md:text-left">
              <div className="mb-7 inline-flex max-w-full items-center gap-2 rounded-full border border-ivory/10 bg-white/10 px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-ivory/80 shadow-[0_10px_40px_rgba(0,0,0,0.22)] backdrop-blur-md animate-pulse-soft sm:px-4 sm:text-[10px] sm:tracking-[0.25em]">
                <Sparkles size={13} className="shrink-0 text-sage" />
                <span className="truncate">Hệ thống công nghệ đa tầng</span>
              </div>
              <h1 className="font-serif text-[3.15rem] leading-[0.95] tracking-normal sm:text-7xl md:text-9xl lg:text-[10rem]">
                <span className="block overflow-hidden">
                  <span className="block animate-slide-up">Nâng tầm</span>
                </span>
                <span className="hm-gradient-text block overflow-hidden pb-4">
                  <span className="block animate-slide-up" style={{ animationDelay: '0.2s' }}>Công nghệ.</span>
                </span>
              </h1>
              <p className="mx-auto mt-7 max-w-[34rem] text-[15px] font-light leading-7 text-ivory/72 sm:text-lg md:mx-0 md:mt-10 md:text-2xl">
                Laptop, PC build và phụ kiện chính hãng cho học tập, làm việc, gaming. Tư vấn dễ hiểu, giá minh bạch, hỗ trợ sau mua tại <span className="font-medium text-ivory">TMDT Shop.</span>
              </p>
              <div className="mx-auto mt-7 grid max-w-sm grid-cols-3 gap-2 text-left md:mx-0">
                {["Laptop", "PC build", "Gaming"].map((label) => (
                  <span key={label} className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-ivory/75 backdrop-blur-md">
                    {label}
                  </span>
                ))}
              </div>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row md:mt-12 md:gap-5">
                <Link href="/products" className="hm-btn-primary hm-hover-glow h-14 w-full rounded-2xl bg-ivory text-ink shadow-[0_18px_48px_rgba(247,243,237,0.14)] hover:bg-sage hover:text-ink sm:h-16 sm:w-auto">
                  <ShoppingBag size={18} />
                  Mua sắm ngay
                </Link>
                <Link href="#collections" className="hm-btn-secondary h-14 w-full rounded-2xl border-ivory/20 bg-white/5 text-ivory backdrop-blur-md hover:bg-white hover:text-ink sm:h-16 sm:w-auto">
                  Xem danh mục
                  <ArrowRight size={18} />
                </Link>
              </div>
              <div className="mt-8 grid gap-2 sm:grid-cols-3 md:max-w-2xl">
                {trustSignals.map(({ label, icon: Icon }) => (
                  <div key={label} className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-3 text-xs font-semibold text-ivory/76 backdrop-blur-md md:justify-start">
                    <Icon size={16} className="shrink-0 text-sage" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.3} viewPortOnce={false} className="hidden justify-end md:flex">
            <div className="group relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2.5rem] border border-ivory/20 bg-ivory/5 shadow-2xl transition-all duration-700 hover:rotate-2 hover:scale-[1.02] animate-float">
              <Image
                src={heroImages[1]}
                alt="Thiết bị công nghệ cao cấp"
                fill
                sizes="448px"
                className="object-cover transition-transform duration-[3s] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-0 left-0 right-0 p-10 backdrop-blur-sm transition-transform duration-500 group-hover:translate-y-[-10px]">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage mb-3">Sản phẩm tiêu biểu</p>
                <p className="font-serif text-4xl leading-tight">Vẻ đẹp của <br /> Hiệu năng.</p>
                <Link href="/products" aria-label="Xem sản phẩm tiêu biểu" className="mt-6 flex h-10 w-10 items-center justify-center rounded-full bg-ivory/10 text-ivory backdrop-blur-md transition-all hover:scale-110 hover:bg-sage hover:text-ink group-hover:bg-sage group-hover:text-ink">
                  <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Featured Collections with Reveal Animations */}
      <section id="collections" className="hm-shell py-16 md:py-40">
        <FadeIn>
          <div className="mb-10 flex flex-col justify-between gap-5 md:mb-24 md:flex-row md:items-end md:gap-12">
            <div className="max-w-2xl">
              <p className="hm-kicker">Digital Lifestyle</p>
              <h2 className="mt-3 font-serif text-4xl sm:text-6xl md:mt-4 md:text-8xl">Cảm hứng mới</h2>
            </div>
            <p className="max-w-md text-base leading-7 text-ink/55 dark:text-ivory/65 sm:text-xl sm:leading-relaxed">
              Mỗi danh mục sản phẩm là một lời cam kết về chất lượng và sự tinh tế trong từng đường nét thiết kế.
            </p>
          </div>
        </FadeIn>

        <FadeInStagger className="hm-category-grid grid gap-8 md:grid-cols-3 md:gap-12">
          {categories.length === 0 ? (
            <div className="hm-surface p-12 text-center text-ink/55 dark:text-ivory/65 md:col-span-3">
              Dữ liệu đang được cập nhật...
            </div>
          ) : categories.map((category) => (
            <FadeInStaggerItem key={category.id}>
              <Link href={`/products?category=${category.slug}`} className="group block">
                <article className="hm-category-card hm-surface-lift overflow-hidden rounded-[2rem]">
                  <div className="hm-category-card-media aspect-[4/5] overflow-hidden relative">
                    <Image 
                      src={category.imageUrl ?? fallbackCategoryImage} 
                      alt={category.name} 
                      width={900} 
                      height={1125} 
                      className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-[1.15]" 
                    />
                    <div className="hm-category-card-shine" />
                    <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[2px] flex items-center justify-center">
                       <span className="rounded-full bg-white px-8 py-3 text-xs font-bold uppercase tracking-widest text-ink transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">Xem ngay</span>
                    </div>
                  </div>
                  <div className="p-5 sm:p-10">
                    <h3 className="font-serif text-2xl transition-colors group-hover:text-copper sm:text-4xl">{category.name}</h3>
                    <p className="mt-4 min-h-[3rem] font-light italic leading-relaxed text-ink/55 dark:text-ivory/65">{category.description ?? "Khám phá những thiết bị công nghệ tiên tiến nhất hiện nay."}</p>
                    <div className="relative mt-10 h-px w-full overflow-hidden bg-ink/5 dark:bg-white/10">
                       <div className="absolute inset-0 bg-copper translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700" />
                    </div>
                  </div>
                </article>
              </Link>
            </FadeInStaggerItem>
          ))}
        </FadeInStagger>
      </section>

      {/* New Arrivals with List Hover Effect */}
      <section className="relative overflow-hidden border-y border-ink/5 bg-[#fcfcfc] py-16 dark:border-white/10 dark:bg-zinc-950 md:py-40">
        <div className="hm-dot-pattern absolute inset-0 opacity-[0.2]" />
        
        <div className="hm-shell relative">
          <FadeIn>
            <div className="mb-10 text-center md:mb-20">
              <p className="hm-kicker">New Standard</p>
              <h2 className="mt-4 font-serif text-4xl sm:text-6xl md:text-8xl">Bộ sưu tập mới</h2>
            </div>
          </FadeIn>

          <FadeInStagger className="space-y-4">
            {products.length === 0 ? (
              <div className="py-12 text-center text-ink/55 dark:text-ivory/65">
                Danh sách đang được làm mới...
              </div>
            ) : products.map((product) => (
              <FadeInStaggerItem key={product.id}>
                <Link href={`/products/${product.slug}`} className="group relative flex flex-col gap-6 rounded-3xl border border-transparent bg-white p-5 transition-all duration-500 hover:border-ink/5 hover:shadow-2xl dark:border-white/10 dark:bg-zinc-900/80 dark:hover:border-copper/40 sm:p-6 md:flex-row md:items-center md:gap-8">
                  <div className="relative size-32 shrink-0 overflow-hidden rounded-2xl bg-porcelain transition-transform duration-500 group-hover:scale-105 dark:bg-zinc-800">
                    <Image 
                      src={product.images[0]?.url ?? fallbackCategoryImage} 
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 128px, 128px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-taupe dark:text-copper sm:tracking-[0.3em]">{product.category.name}</p>
                    <h3 className="mt-2 font-serif text-2xl leading-tight transition-colors group-hover:text-copper sm:text-4xl">{product.name}</h3>
                    <p className="mt-2 line-clamp-1 max-w-2xl text-sm font-light text-ink/50 dark:text-ivory/60">{product.description}</p>
                  </div>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8 lg:gap-12">
                    <div className="text-left sm:text-right">
                      <p className="text-2xl font-medium text-ink dark:text-ivory sm:text-3xl">{formatCurrency(product.salePrice ?? product.price)}</p>
                      {product.salePrice && (
                        <p className="mt-1 text-sm text-ink/35 line-through dark:text-ivory/40">{formatCurrency(product.price)}</p>
                      )}
                    </div>
                    <div className="hidden size-14 translate-x-4 items-center justify-center rounded-full bg-ink text-ivory opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100 dark:bg-ivory dark:text-ink lg:flex">
                      <ArrowRight size={24} />
                    </div>
                  </div>
                </Link>
              </FadeInStaggerItem>
            ))}
          </FadeInStagger>
          
          <FadeIn className="mt-20 text-center">
            <Link href="/products" className="group inline-flex items-center gap-4 text-sm font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:text-copper dark:text-ivory dark:hover:text-copper">
              Xem tất cả sản phẩm
              <div className="h-px w-12 bg-ink/20 transition-all group-hover:w-20 group-hover:bg-copper dark:bg-ivory/30" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Newsletter with High-End Glass Section */}
      <section id="newsletter" className="hm-shell py-16 md:py-40">
        <FadeIn>
          <div className="hm-newsletter-card group grid overflow-hidden rounded-[2rem] bg-ink text-ivory shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] md:grid-cols-[0.8fr_1.2fr] md:rounded-[3rem]">
            <div className="relative min-h-[320px] md:min-h-[500px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={siteSettings.newsletterImageUrl}
                alt="Premium Lifestyle"
                className="hm-newsletter-image absolute inset-0 h-full w-full object-cover grayscale-[20%]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/20 to-transparent" />
              <div className="absolute inset-x-8 bottom-8 h-px origin-left scale-x-0 bg-gradient-to-r from-sage via-ivory/70 to-transparent transition-transform duration-700 group-hover:scale-x-100" />
            </div>
            <div className="hm-newsletter-copy relative flex flex-col justify-center overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.07)_0%,transparent_58%)] p-8 transition-transform duration-700 sm:p-12 md:p-24">
              <span className="hm-newsletter-sheen pointer-events-none" />
              <span className="absolute right-10 top-10 h-24 w-24 rounded-full border border-sage/20 opacity-0 transition-all duration-700 group-hover:scale-125 group-hover:opacity-100" />
              <span className="absolute bottom-10 right-16 h-2 w-2 rounded-full bg-sage shadow-[0_0_30px_rgba(154,184,164,0.9)] transition-transform duration-700 group-hover:-translate-y-4" />
              <p className="hm-kicker !text-sage transition-all duration-500 group-hover:translate-x-2">Kết nối với TMDT Shop</p>
              <h2 className="mt-6 font-serif text-4xl leading-[1.1] transition-all duration-700 group-hover:text-sage sm:text-5xl lg:text-7xl">Đăng ký nhận <br /> Bản tin Đặc quyền.</h2>
              <p className="mt-8 max-w-lg text-xl font-light leading-relaxed text-ivory/50 transition-colors duration-500 group-hover:text-ivory/70">Hãy là người đầu tiên sở hữu những siêu phẩm công nghệ và nhận ưu đãi riêng biệt từ chúng tôi.</p>
              
              <form className="mt-12 flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1 group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-ivory/20 transition-colors group-focus-within:text-sage" size={20} />
                  <input 
                    type="email" 
                    placeholder="Địa chỉ email của bạn" 
                    className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 pl-16 pr-5 text-base text-ivory outline-none transition-all duration-300 placeholder:text-ivory/20 focus:-translate-y-1 focus:border-sage focus:bg-white/10 focus:shadow-[0_20px_60px_rgba(154,184,164,0.12)] sm:h-20 sm:pr-8 sm:text-lg" 
                  />
                </div>
                <button className="hm-btn-primary hm-hover-glow h-14 w-full bg-sage px-8 text-base text-ink transition-all duration-500 hover:-translate-y-1 hover:bg-ivory hover:shadow-[0_22px_60px_rgba(154,184,164,0.25)] sm:h-20 sm:w-auto sm:px-12">
                  Gửi ngay
                </button>
              </form>
            </div>
          </div>
        </FadeIn>
      </section>
    </main>
  );
}
