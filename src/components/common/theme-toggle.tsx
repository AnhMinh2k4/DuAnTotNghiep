"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useScopedTheme } from "@/components/common/theme-provider";

export function ThemeToggle() {
  const { resolvedTheme, setScopedTheme } = useScopedTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid size-11 place-items-center rounded-2xl border border-ink/10 bg-white/70 text-ink/35 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-ivory/35">
        <Sun size={18} />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setScopedTheme(isDark ? "light" : "dark")}
      className="group grid size-11 place-items-center rounded-2xl border border-ink/10 bg-white/80 text-ink/55 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-copper/40 hover:bg-copper hover:text-white hover:shadow-lg hover:shadow-copper/15 active:translate-y-0 dark:border-white/10 dark:bg-white/5 dark:text-ivory/60 dark:hover:border-sage/50 dark:hover:bg-sage dark:hover:text-ink"
      aria-label={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
      title={isDark ? "Chế độ sáng" : "Chế độ tối"}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
