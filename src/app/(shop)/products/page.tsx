import Image from "next/image";
import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { getProductCatalog } from "@/lib/catalog";
import { formatCurrency } from "@/lib/format";
import { FadeIn } from "@/components/common/motion-viewport";
import { ProductFilterPanel } from "@/components/shop/product-filter-panel";

export const revalidate = 300;

const fallbackImage =
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=85";

function parsePriceParam(value?: string) {
  if (!value) {
    return undefined;
  }

  const normalized = value.replace(/[^\d]/g, "");
  const price = Number(normalized);

  return Number.isFinite(price) && price >= 0 ? price : undefined;
}

type ProductsPageProps = {
  searchParams?: Promise<{
    category?: string;
    brand?: string;
    q?: string;
    min?: string;
    max?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const min = parsePriceParam(params?.min);
  const max = parsePriceParam(params?.max);
  const page = params?.page ? Number(params.page) : 1;
  const sort = ["featured", "newest", "price-asc", "price-desc"].includes(params?.sort ?? "") ? params?.sort as "featured" | "newest" | "price-asc" | "price-desc" : "featured";

  const { categories, brands, products, total, pageSize } = await getProductCatalog({
    q: params?.q?.trim(),
    category: params?.category,
    brand: params?.brand,
    min,
    max,
    sort,
    page,
    pageSize: 12,
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value) {
      query.set(key, value);
    }
  }
  const hrefWith = (key: string, value: string) => {
    const next = new URLSearchParams(query);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    if (key !== "page") {
      next.delete("page");
    }
    const text = next.toString();
    return text ? `/products?${text}` : "/products";
  };

  return (
    <main className="hm-shell px-3 py-8 sm:px-5 sm:py-16 md:px-8 md:py-20">
      <FadeIn>
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end md:gap-8">
          <div>
            <p className="hm-kicker">Collection</p>
            <h1 className="hm-page-title mt-3">Tất cả sản phẩm</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="hm-pill bg-white shadow-soft dark:bg-white/10 dark:text-ivory/75">
              <SlidersHorizontal size={14} className="text-copper" />
              <span className="ml-2 font-bold">{total} sản phẩm</span>
            </div>
            {Object.keys(params ?? {}).length > 0 && (
              <Link href="/products" className="hm-pill border-copper/20 text-copper hover:bg-copper hover:text-white dark:border-copper/40 dark:text-copper">
                <X size={14} />
                <span className="ml-2 font-bold">Xóa bộ lọc</span>
              </Link>
            )}
          </div>
        </div>
      </FadeIn>

      <div className="mt-6 grid gap-6 sm:mt-8 lg:mt-12 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
        <FadeIn delay={0.1} className="lg:self-start">
          <ProductFilterPanel
            categories={categories}
            brands={brands.flatMap((item) => item.brand ? [item.brand] : [])}
            params={params ?? {}}
            sort={sort}
          />
        </FadeIn>

        <section className="min-w-0">
          {products.length === 0 ? (
            <FadeIn delay={0.2}>
              <div className="rounded-[2rem] border border-ink/5 bg-porcelain p-10 text-center dark:border-white/10 dark:bg-zinc-900/80 sm:p-16 lg:p-20">
                <p className="text-lg text-ink/55 dark:text-ivory/70">Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn.</p>
                <Link href="/products" className="mt-8 inline-flex hm-btn-secondary">Đặt lại bộ lọc</Link>
              </div>
            </FadeIn>
          ) : (
            <div className="relative z-0 grid grid-cols-1 justify-items-stretch gap-4 min-[430px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {products.map((product) => (
                <div key={product.id} className="w-full">
                  <Link href={`/products/${product.slug}`} className="group block h-full">
                    <article className="hm-surface-lift flex h-full flex-col overflow-hidden">
                      <div className="relative overflow-hidden bg-porcelain dark:bg-zinc-800">
                        <Image
                          src={product.images[0]?.url ?? fallbackImage}
                          alt={product.images[0]?.alt ?? product.name}
                          width={640}
                          height={800}
                          sizes="(min-width: 1536px) 230px, (min-width: 1280px) 300px, (min-width: 1024px) 32vw, 50vw"
                          className="aspect-[4/5] h-auto w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-ink/5 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-white/5" />
                      </div>
                      <div className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
                        <p className="line-clamp-1 text-[8px] font-bold uppercase tracking-[0.12em] text-taupe dark:text-copper sm:text-[10px] sm:tracking-[0.25em]">{product.category.name}</p>
                        <h2 className="mt-2 line-clamp-2 font-serif text-xl leading-snug transition-colors group-hover:text-copper sm:mt-3 sm:text-2xl lg:text-3xl">{product.name}</h2>
                        <p className="mt-2 line-clamp-1 text-[10px] font-bold uppercase tracking-[0.08em] text-ink/50 dark:text-ivory/55 sm:mt-4 sm:text-sm sm:tracking-widest">{product.brand ?? product.supplier?.name}</p>
                        <div className="mt-auto flex flex-col gap-1 pt-4 sm:flex-row sm:items-end sm:justify-between sm:pt-8">
                          <p className="text-lg font-bold leading-tight text-ink dark:text-ivory sm:text-xl lg:text-2xl">{formatCurrency(product.salePrice ?? product.price)}</p>
                          {product.salePrice && (
                            <p className="text-xs text-ink/35 line-through dark:text-ivory/40 sm:mb-1 sm:text-sm">{formatCurrency(product.price)}</p>
                          )}
                        </div>
                      </div>
                    </article>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 ? (
            <FadeIn delay={0.3} className="mt-14 md:mt-20">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
                  <Link
                    key={item}
                    href={hrefWith("page", String(item))}
                    className={`grid size-11 place-items-center rounded-xl border-2 text-sm font-bold transition-all duration-300 hover:scale-110 active:scale-95 sm:size-14 ${item === page ? "border-ink bg-ink text-ivory shadow-lg dark:border-ivory dark:bg-ivory dark:text-ink" : "border-ink/5 bg-white text-ink hover:border-ink dark:border-white/10 dark:bg-white/10 dark:text-ivory/75 dark:hover:border-copper dark:hover:text-copper"}`}
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </FadeIn>
          ) : null}
        </section>
      </div>
    </main>
  );
}
