"use client";

import { useMemo, useState } from "react";
import { PackageSearch, Search, X } from "lucide-react";

export type AdminListSearchItem = {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  badge?: string;
  keywords: string;
};

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function AdminListSearch({
  items,
  placeholder,
}: {
  items: AdminListSearchItem[];
  placeholder: string;
}) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const results = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);

    if (!normalizedQuery) {
      return [];
    }

    return items.filter((item) => normalizeSearch(`${item.title} ${item.subtitle ?? ""} ${item.meta ?? ""} ${item.badge ?? ""} ${item.keywords}`).includes(normalizedQuery));
  }, [items, query]);

  const shouldShowResults = query.trim().length > 0 && isFocused;

  return (
    <div className="relative w-full md:max-w-md">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30 dark:text-ivory/45" size={18} />
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => window.setTimeout(() => setIsFocused(false), 120)}
        placeholder={placeholder}
        className="hm-field h-12 w-full bg-white pl-11 pr-12 placeholder:text-ink/40 dark:bg-white/10 dark:placeholder:text-ivory/50"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-ink/35 transition hover:bg-porcelain hover:text-ink dark:text-ivory/50 dark:hover:bg-white/10 dark:hover:text-ivory"
          aria-label="Xóa tìm kiếm"
        >
          <X size={15} />
        </button>
      )}

      {shouldShowResults && (
        <div className="absolute right-0 top-14 z-50 w-full overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-2xl shadow-ink/10 dark:border-white/10 dark:bg-zinc-900 dark:shadow-black/30 sm:min-w-[22rem]">
          <div className="border-b border-ink/5 px-5 py-3 dark:border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ink/45 dark:text-ivory/60">
              {results.length > 0 ? `${results.length} gợi ý phù hợp` : "Không có gợi ý"}
            </p>
          </div>

          {results.length > 0 ? (
            <div className="max-h-80 space-y-2 overflow-y-auto p-2">
              {results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setQuery(item.title)}
                  className="flex w-full items-start gap-4 rounded-xl px-4 py-3 text-left transition-all hover:bg-porcelain dark:hover:bg-white/10"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-porcelain text-copper dark:bg-white/10">
                    <PackageSearch size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-ink dark:text-ivory">{item.title}</span>
                    {item.subtitle && <span className="mt-0.5 block truncate text-xs text-ink/55 dark:text-ivory/60">{item.subtitle}</span>}
                    {item.meta && <span className="mt-1 block truncate text-[10px] font-bold uppercase tracking-widest text-ink/45 dark:text-ivory/50">{item.meta}</span>}
                  </span>
                  {item.badge && (
                    <span className="shrink-0 rounded-full border border-ink/10 bg-porcelain px-3 py-1 text-[10px] font-bold text-ink/60 dark:border-white/10 dark:bg-white/10 dark:text-ivory/65">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <p className="text-sm font-bold text-ink/70 dark:text-ivory/80">Không tìm thấy kết quả</p>
              <p className="mt-1 text-xs text-ink/50 dark:text-ivory/55">Thử nhập từ khóa khác.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
