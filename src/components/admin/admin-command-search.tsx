"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  FolderTree,
  HelpCircle,
  LayoutDashboard,
  MessageSquareText,
  Package,
  Percent,
  BarChart3,
  Bot,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";

type AdminSearchItem = {
  href: string;
  icon: keyof typeof icons;
  label: string;
  description: string;
  keywords: string;
};

const icons: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  reports: BarChart3,
  products: Package,
  categories: FolderTree,
  orders: ShoppingCart,
  coupons: Percent,
  reviews: MessageSquareText,
  questions: HelpCircle,
  aiTraining: Bot,
  shipping: Truck,
  users: Users,
  settings: Settings,
  support: ShieldCheck,
};

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function AdminCommandSearch({ items }: { items: AdminSearchItem[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const results = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);

    if (!normalizedQuery) {
      return items.slice(0, 4);
    }

    return items
      .filter((item) => {
        const searchable = normalizeSearch(`${item.label} ${item.description} ${item.keywords}`);
        return searchable.includes(normalizedQuery);
      })
      .slice(0, 6);
  }, [items, query]);

  const shouldShowResults = isFocused || query.length > 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (results[0]) {
      router.push(results[0].href);
      setQuery("");
      setIsFocused(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative hidden lg:block">
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30 transition-colors group-focus-within:text-copper dark:text-ivory/45"
        size={18}
      />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => window.setTimeout(() => setIsFocused(false), 120)}
        placeholder="Tìm kiếm tác vụ..."
        className="h-11 w-80 rounded-xl border border-transparent bg-porcelain/70 pl-11 pr-4 text-xs font-medium text-ink outline-none transition-all placeholder:text-ink/40 focus:border-ink/5 focus:bg-white focus:shadow-soft dark:bg-white/10 dark:text-ivory dark:placeholder:text-ivory/50 dark:focus:border-white/10 dark:focus:bg-zinc-900"
      />

      {shouldShowResults && (
        <div className="absolute left-0 top-14 z-50 w-[28rem] overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-2xl shadow-ink/10 dark:border-white/10 dark:bg-zinc-900 dark:shadow-black/30">
          <div className="border-b border-ink/5 px-5 py-3 dark:border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ink/45 dark:text-ivory/60">Gợi ý nhanh</p>
          </div>

          {results.length > 0 ? (
            <div className="p-2">
              {results.map((item) => {
                const Icon = icons[item.icon];

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      setQuery("");
                      setIsFocused(false);
                    }}
                    className="group flex items-center gap-4 rounded-xl px-4 py-3 transition-all hover:bg-porcelain dark:hover:bg-white/10"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-porcelain text-ink/45 transition-colors group-hover:bg-ink group-hover:text-ivory dark:bg-white/10 dark:text-ivory/70 dark:group-hover:bg-copper dark:group-hover:text-white">
                      <Icon size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-ink dark:text-ivory">{item.label}</span>
                      <span className="mt-0.5 block truncate text-xs text-ink/55 dark:text-ivory/60">{item.description}</span>
                    </span>
                    <ArrowRight size={16} className="text-ink/30 transition-all group-hover:translate-x-1 group-hover:text-copper dark:text-ivory/40" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <p className="text-sm font-bold text-ink/70 dark:text-ivory/80">Không tìm thấy tác vụ phù hợp</p>
              <p className="mt-1 text-xs text-ink/50 dark:text-ivory/55">Thử tìm sản phẩm, đơn hàng, người dùng hoặc cài đặt.</p>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
