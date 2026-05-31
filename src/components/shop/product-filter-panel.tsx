"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";

type FilterCategory = {
  id: number;
  name: string;
  slug: string;
};

type ProductFilterPanelProps = {
  categories: FilterCategory[];
  brands: string[];
  params: {
    category?: string;
    brand?: string;
    q?: string;
    min?: string;
    max?: string;
    sort?: string;
  };
  sort: "featured" | "newest" | "price-asc" | "price-desc";
};

export function ProductFilterPanel({ categories, brands, params, sort }: ProductFilterPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState(params.category ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const hasFilters = Boolean(params.category || params.brand || params.q || params.min || params.max || params.sort);

  return (
    <aside className="relative z-20 min-w-0 rounded-3xl border border-ink/5 bg-white p-3 shadow-[0_20px_60px_rgba(21,21,21,0.07)] dark:border-white/10 dark:bg-zinc-900/90 sm:p-4 lg:sticky lg:top-32">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-12 w-full items-center justify-between rounded-2xl bg-ink px-4 text-xs font-bold uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-copper dark:bg-ivory dark:text-ink dark:hover:bg-copper dark:hover:text-white lg:hidden"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={15} />
          Bộ lọc sản phẩm
        </span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <form action="/products" className={`${isOpen ? "block" : "hidden"} mt-4 space-y-4 sm:space-y-5 lg:mt-0 lg:block`}>
        <div className="hidden items-start justify-between gap-4 lg:flex">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-copper">Bộ lọc</p>
            <h2 className="mt-1 font-serif text-2xl">Chọn đúng nhu cầu</h2>
          </div>
          {hasFilters ? (
            <Link href="/products" className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35 transition hover:text-copper dark:text-ivory/50 dark:hover:text-copper">
              Xóa
            </Link>
          ) : null}
        </div>

        <div className="relative min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40 dark:text-ivory/50 sm:left-4" size={17} />
          <input name="q" defaultValue={params.q ?? ""} placeholder="Tìm tên, SKU, thương hiệu..." className="hm-field h-11 w-full min-w-0 pl-10 pr-3 text-xs placeholder:text-ink/45 dark:placeholder:text-ivory/55 sm:h-12 sm:pl-12 sm:text-sm" />
        </div>

        <div className="border-t border-ink/10 pt-3 dark:border-white/10 sm:pt-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink dark:text-ivory sm:text-[11px] sm:tracking-[0.14em]">Danh mục sản phẩm</h2>
          <div className="mt-3 space-y-1.5">
            <button
              type="button"
              onClick={() => setSelectedCategory("")}
              className={`block w-full rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors sm:text-sm ${!selectedCategory ? "bg-ink text-white shadow-soft dark:bg-ivory dark:text-ink" : "text-ink/70 hover:bg-porcelain hover:text-copper dark:text-ivory/70 dark:hover:bg-white/10"}`}
            >
              Tất cả sản phẩm
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                aria-pressed={selectedCategory === category.slug}
                onClick={() => setSelectedCategory(category.slug)}
                className={`block w-full rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors sm:text-sm ${selectedCategory === category.slug ? "bg-ink text-white shadow-soft dark:bg-ivory dark:text-ink" : "text-ink/70 hover:bg-porcelain hover:text-copper dark:text-ivory/70 dark:hover:bg-white/10"}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-ink/10 pt-3 dark:border-white/10 sm:pt-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink dark:text-ivory sm:text-[11px] sm:tracking-[0.14em]">Bộ lọc sản phẩm</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <input name="min" defaultValue={params.min ?? ""} placeholder="Giá từ" className="hm-field h-10 min-w-0 px-3 text-xs placeholder:text-ink/45 dark:placeholder:text-ivory/55 sm:text-sm" />
            <input name="max" defaultValue={params.max ?? ""} placeholder="Giá đến" className="hm-field h-10 min-w-0 px-3 text-xs placeholder:text-ink/45 dark:placeholder:text-ivory/55 sm:text-sm" />
          </div>
        </div>

        {brands.length > 0 ? (
          <div className="border-t border-ink/10 pt-3 dark:border-white/10 sm:pt-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink dark:text-ivory sm:text-[11px] sm:tracking-[0.14em]">Hãng sản xuất</h2>
            <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 lg:grid-cols-1">
              <label className="flex min-w-0 cursor-pointer items-center gap-2 text-xs font-medium text-ink/70 dark:text-ivory/70 sm:text-sm">
                <input type="radio" name="brand" value="" defaultChecked={!params.brand} className="size-4 accent-ink dark:accent-ivory" />
                <span className="min-w-0 truncate">Tất cả hãng</span>
              </label>
              {brands.map((brand) => (
                <label key={brand} className="flex min-w-0 cursor-pointer items-center gap-2 text-xs font-medium text-ink/70 dark:text-ivory/70 sm:text-sm">
                  <input type="radio" name="brand" value={brand} defaultChecked={params.brand === brand} className="size-4 accent-ink dark:accent-ivory" />
                  <span className="min-w-0 truncate">{brand}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        <div className="border-t border-ink/10 pt-3 dark:border-white/10 sm:pt-4">
          <select name="sort" defaultValue={sort} className="hm-field h-11 w-full px-3 text-xs dark:[color-scheme:dark] sm:text-sm">
            <option value="featured">Nổi bật</option>
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
          </select>
        </div>

        {selectedCategory ? <input type="hidden" name="category" value={selectedCategory} /> : null}
        <button className="hm-btn-primary h-12 w-full rounded-2xl px-4 text-xs tracking-[0.12em]">Áp dụng bộ lọc</button>
      </form>
    </aside>
  );
}
