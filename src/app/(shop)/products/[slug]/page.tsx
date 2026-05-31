import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Headphones, MessageSquareText, RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";
import { getProductDetail } from "@/lib/catalog";
import { currencyToNumber, formatCurrency } from "@/lib/format";
import { getCurrentUser } from "@/lib/auth";
import { getProductReviewEligibility } from "@/lib/reviews";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { ReviewForm } from "@/components/shop/review-form";

export const revalidate = 300;

const fallbackImage =
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=85";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const [product, user] = await Promise.all([
    getProductDetail(slug),
    getCurrentUser(),
  ]);

  if (!product) {
    notFound();
  }

  const reviewEligibility = await getProductReviewEligibility(product.id, user);
  const averageRating = product.reviews.length
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : 0;
  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: product.reviews.filter((review) => review.rating === rating).length,
  }));

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 md:px-8">
      <Link href="/products" className="inline-flex max-w-full items-center gap-2 rounded-lg border border-ink/10 bg-white px-4 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-ink/65 transition hover:border-ink hover:text-ink dark:border-white/10 dark:bg-white/10 dark:text-ivory/70 dark:hover:border-copper dark:hover:text-copper sm:tracking-[0.12em]">
        <ArrowLeft size={16} />
        Trở lại cửa hàng
      </Link>

      <section className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {(product.images.length > 0 ? product.images : [{ id: 0, url: fallbackImage, alt: product.name }]).map((image) => (
            <div key={image.id} className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-linen dark:bg-zinc-800">
              <Image
                src={image.url}
                alt={image.alt ?? product.name}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-ink/5 bg-white/85 p-5 shadow-soft backdrop-blur-sm dark:border-white/10 dark:bg-zinc-900/80 sm:p-7 lg:sticky lg:top-28 lg:self-start">
          <p className="hm-kicker">{product.category.name}</p>
          <h1 className="hm-page-title mt-4 break-words">{product.name}</h1>
          <p className="mt-3 text-ink/55 dark:text-ivory/60">
            {product.brand ? `Thương hiệu: ${product.brand}` : null}
            {product.supplier ? ` / Nhà cung cấp: ${product.supplier.name}` : null}
          </p>
          {product.reviews.length > 0 ? (
            <p className="mt-3 text-sm text-ink/55 dark:text-ivory/60">{averageRating.toFixed(1)}/5 từ {product.reviews.length} đánh giá</p>
          ) : null}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <p className="font-serif text-3xl text-ink dark:text-ivory sm:text-4xl">{formatCurrency(product.salePrice ?? product.price)}</p>
            {product.salePrice ? (
              <p className="text-ink/40 line-through dark:text-ivory/45">{formatCurrency(product.price)}</p>
            ) : null}
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {[
              { label: "Bảo hành chính hãng", icon: ShieldCheck },
              { label: "Giao hàng nhanh", icon: Truck },
              { label: "Đổi trả hỗ trợ", icon: RotateCcw },
            ].map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-2 rounded-2xl border border-ink/5 bg-porcelain/70 px-3 py-3 text-xs font-semibold text-ink/60 dark:border-white/10 dark:bg-white/5 dark:text-ivory/65">
                <Icon size={15} className="shrink-0 text-copper" />
                <span>{label}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 leading-8 text-ink/65 dark:text-ivory/70">{product.description}</p>

          <div className="mt-8 border-y border-ink/10 py-6 dark:border-white/10">
            <p className="text-sm text-ink/55 dark:text-ivory/60">Tồn kho: <span className="font-semibold text-ink dark:text-ivory">{product.stock} sản phẩm</span></p>
            {product.warranty ? <p className="mt-2 text-sm text-ink/55 dark:text-ivory/60">Bảo hành: {product.warranty}</p> : null}
            {product.attributes.length > 0 ? (
              <div className="mt-6">
                <p className="text-sm font-semibold uppercase tracking-[0.16em]">Thông số kỹ thuật</p>
                <dl className="mt-3 divide-y divide-ink/10 border-y border-ink/10 dark:divide-white/10 dark:border-white/10">
                  {product.attributes.map((attribute) => (
                    <div key={attribute.id} className="grid gap-1 py-3 text-sm sm:grid-cols-[120px_1fr] sm:gap-4">
                      <dt className="text-ink/50 dark:text-ivory/55">{attribute.name}</dt>
                      <dd className="break-words text-ink/75 dark:text-ivory/80">{attribute.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </div>

          <AddToCartButton
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              imageUrl: product.images[0]?.url ?? fallbackImage,
              price: currencyToNumber(product.salePrice ?? product.price),
              stock: product.stock,
              variants: product.variants.map((variant) => ({
                id: variant.id,
                name: variant.name,
                sku: variant.sku,
                priceDelta: currencyToNumber(variant.priceDelta),
                stock: variant.stock,
                options: variant.options && typeof variant.options === "object" && !Array.isArray(variant.options)
                  ? variant.options as Record<string, string>
                  : null,
              })),
            }}
          />
          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-sage/10 px-4 py-3 text-sm text-ink/65 dark:text-ivory/70">
            <Headphones size={18} className="shrink-0 text-sage" />
            <span>Cần tư vấn cấu hình? Chat với shop ở góc màn hình để được gợi ý nhanh.</span>
          </div>
        </div>
      </section>

      <section id="reviews" className="mt-12 scroll-mt-28 rounded-2xl border border-ink/10 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-zinc-900/80 sm:p-7 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <aside className="lg:sticky lg:top-28">
            <p className="hm-kicker">Đánh giá sau mua</p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Trải nghiệm thật từ khách hàng</h2>
            <p className="mt-4 text-sm leading-6 text-ink/60 dark:text-ivory/65">
              Chúng tôi chỉ mở form cho khách có đơn hoàn thành để dữ liệu đánh giá đáng tin cậy và hữu ích hơn cho người mua sau.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-xl border border-ink/10 bg-porcelain p-5 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/40 dark:text-ivory/50">Điểm trung bình</p>
                    <p className="mt-2 font-serif text-5xl">{product.reviews.length ? averageRating.toFixed(1) : "--"}</p>
                  </div>
                  <div className="flex text-copper">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star key={index} size={18} fill={index < Math.round(averageRating) ? "currentColor" : "none"} />
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-sm text-ink/55 dark:text-ivory/60">{product.reviews.length} đánh giá đã hiển thị</p>
              </div>

              <div className="rounded-xl border border-ink/10 bg-porcelain p-5 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={20} className="text-sage" />
                  <p className="text-sm font-semibold">Xác thực bằng đơn hoàn thành</p>
                </div>
                <div className="mt-5 space-y-2">
                  {ratingCounts.map(({ rating, count }) => (
                    <div key={rating} className="grid grid-cols-[42px_1fr_24px] items-center gap-3 text-xs text-ink/55 dark:text-ivory/60">
                      <span>{rating} sao</span>
                      <span className="h-2 overflow-hidden rounded-full bg-ink/10 dark:bg-white/10">
                        <span className="block h-full rounded-full bg-copper" style={{ width: product.reviews.length ? `${(count / product.reviews.length) * 100}%` : "0%" }} />
                      </span>
                      <span className="text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <ReviewForm productId={product.id} eligibility={reviewEligibility} />
          </aside>

          <div>
            <div className="flex items-center justify-between gap-4 border-b border-ink/10 pb-4 dark:border-white/10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-copper">Bình luận khách hàng</p>
                <h3 className="mt-2 font-serif text-3xl">Điểm đáng chú ý</h3>
              </div>
              <MessageSquareText className="hidden text-ink/30 dark:text-ivory/40 sm:block" size={28} />
            </div>

            {product.reviews.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-ink/15 p-8 text-sm leading-6 text-ink/55 dark:border-white/15 dark:text-ivory/60">
                Chưa có đánh giá nào. Sau khi đơn hàng hoàn thành, khách mua sản phẩm này có thể gửi đánh giá đầu tiên.
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                {product.reviews.map((review) => (
                  <article key={review.id} className="rounded-xl border border-ink/10 p-5 dark:border-white/10">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold">{review.user.name}</p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-ink/35 dark:text-ivory/45">Khách đã mua hàng</p>
                      </div>
                      <div className="flex items-center gap-1 text-copper">
                        {Array.from({ length: 5 }, (_, index) => (
                          <Star key={index} size={15} fill={index < review.rating ? "currentColor" : "none"} />
                        ))}
                        <span className="ml-2 text-sm font-semibold text-ink dark:text-ivory">{review.rating}/5</span>
                      </div>
                    </div>
                    {review.comment ? <p className="mt-4 text-sm leading-6 text-ink/65 dark:text-ivory/70">{review.comment}</p> : null}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
