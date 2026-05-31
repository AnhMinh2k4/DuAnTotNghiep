"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, FolderTree, Package, Search, X } from "lucide-react";

type ShopSearchItem = {
  href: string;
  title: string;
  subtitle: string;
  keywords: string;
  type: "product" | "category" | "brand";
};

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function ShopSearch({ items, variant = "inline" }: { items: ShopSearchItem[]; variant?: "inline" | "icon" }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const normalizedQuery = normalizeSearch(query);
  const results = useMemo(() => {
    if (!normalizedQuery) {
      return items.slice(0, 5);
    }

    return items
      .filter((item) => normalizeSearch(`${item.title} ${item.subtitle} ${item.keywords}`).includes(normalizedQuery))
      .slice(0, 6);
  }, [items, normalizedQuery]);

  const shouldShowSuggestions = isFocused && (query.trim().length > 0 || results.length > 0);
  const searchHref = query.trim() ? `/products?q=${encodeURIComponent(query.trim())}` : "/products";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsFocused(false);
    setIsOpen(false);
    router.push(searchHref);
  }

  const searchForm = (
    <form onSubmit={handleSubmit} className={variant === "icon" ? "relative w-full" : "relative order-last block basis-full sm:order-none sm:max-w-xl sm:flex-1 sm:basis-auto"}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30 dark:text-ivory/45" size={18} />
      <input
        name="q"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => window.setTimeout(() => setIsFocused(false), 140)}
        placeholder="Tìm kiếm laptop, điện thoại..."
        autoComplete="off"
        className="h-11 w-full rounded-xl border border-transparent bg-porcelain pl-12 pr-4 text-sm text-ink shadow-inner outline-none transition-all placeholder:text-ink/40 focus:border-copper focus:bg-white dark:bg-white/10 dark:text-ivory dark:placeholder:text-ivory/50 dark:focus:bg-zinc-900"
      />

      {shouldShowSuggestions ? (
        <div className="absolute left-0 right-0 top-14 z-50 overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-2xl shadow-ink/10 dark:border-white/10 dark:bg-zinc-900 dark:shadow-black/30">
          <div className="border-b border-ink/5 px-5 py-3 dark:border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ink/45 dark:text-ivory/60">
              Gợi ý tìm kiếm
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {query.trim() ? (
              <Link
                href={searchHref}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setIsFocused(false)}
                className="group flex items-center gap-4 rounded-xl px-4 py-3 transition-all hover:bg-porcelain dark:hover:bg-white/10"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-copper/10 text-copper">
                  <Search size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-ink dark:text-ivory">
                    Tìm &ldquo;{query.trim()}&rdquo;
                  </span>
                  <span className="mt-0.5 block text-xs text-ink/55 dark:text-ivory/60">Xem tất cả sản phẩm phù hợp</span>
                </span>
                <ArrowRight size={16} className="text-ink/30 transition-all group-hover:translate-x-1 group-hover:text-copper dark:text-ivory/40" />
              </Link>
            ) : null}

            {results.length > 0 ? (
              results.map((item) => {
                const Icon = item.type === "product" ? Package : FolderTree;

                return (
                  <Link
                    key={`${item.type}-${item.href}-${item.title}`}
                    href={item.href}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setIsFocused(false)}
                    className="group flex items-center gap-4 rounded-xl px-4 py-3 transition-all hover:bg-porcelain dark:hover:bg-white/10"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-porcelain text-copper dark:bg-white/10">
                      <Icon size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-ink dark:text-ivory">{item.title}</span>
                      <span className="mt-0.5 block truncate text-xs text-ink/55 dark:text-ivory/60">{item.subtitle}</span>
                    </span>
                    <ArrowRight size={16} className="text-ink/30 transition-all group-hover:translate-x-1 group-hover:text-copper dark:text-ivory/40" />
                  </Link>
                );
              })
            ) : query.trim() ? (
              <div className="px-5 py-6 text-center">
                <p className="text-sm font-bold text-ink/70 dark:text-ivory/80">Không có gợi ý nhanh</p>
                <p className="mt-1 text-xs text-ink/50 dark:text-ivory/55">Nhấn Enter để tìm toàn bộ catalog.</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </form>
  );

  if (variant === "icon") {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setIsFocused(true);
          }}
          className="hm-icon-btn size-9 rounded-lg sm:size-11 sm:rounded-xl"
          aria-label="Tìm kiếm"
          title="Tìm kiếm"
        >
          <Search size={18} />
        </button>

        {isOpen ? (
          <div className="fixed inset-x-3 top-[76px] z-50 rounded-2xl border border-ink/5 bg-white p-3 shadow-2xl shadow-ink/10 dark:border-white/10 dark:bg-zinc-900 sm:absolute sm:inset-auto sm:right-0 sm:top-14 sm:w-[min(88vw,28rem)]">
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">{searchForm}</div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsFocused(false);
                  setQuery("");
                }}
                className="hm-icon-btn size-11 shrink-0"
                aria-label="Đóng tìm kiếm"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return searchForm;
}
