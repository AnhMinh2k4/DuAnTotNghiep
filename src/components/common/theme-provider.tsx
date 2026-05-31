"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useTheme } from "next-themes";

const ADMIN_THEME_STORAGE_KEY = "hm-admin-theme-v2";
const SHOP_THEME_STORAGE_KEY = "hm-shop-theme-v2";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const pathname = usePathname();
  
  // Determine which storage key to use based on the current path
  // Using a key on the provider forces it to re-initialize when switching between admin and shop
  const storageKey = pathname?.startsWith("/admin") ? ADMIN_THEME_STORAGE_KEY : SHOP_THEME_STORAGE_KEY;

  return (
    <NextThemesProvider 
      {...props} 
      key={storageKey}
      storageKey={storageKey}
    >
      {children}
    </NextThemesProvider>
  );
}

/**
 * Custom hook to manage theme within the current scope (Admin or Shop)
 */
export function useScopedTheme() {
  const { theme, resolvedTheme, setTheme, forcedTheme, systemTheme } = useTheme();

  return {
    theme,
    resolvedTheme,
    setScopedTheme: setTheme,
    forcedTheme,
    systemTheme
  };
}
