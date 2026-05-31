"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCartStore } from "@/store/cart-store";

export function CartLink() {
  const items = useCartStore((state) => state.items);
  const [mounted, setMounted] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const previousCount = useRef(0);

  const totalQuantity = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      previousCount.current = totalQuantity;
      return;
    }

    if (totalQuantity !== previousCount.current) {
      setIsBouncing(true);
      const timeout = window.setTimeout(() => setIsBouncing(false), 350);
      previousCount.current = totalQuantity;
      return () => window.clearTimeout(timeout);
    }

    previousCount.current = totalQuantity;
  }, [mounted, totalQuantity]);

  const displayCount = mounted ? totalQuantity : 0;

  return (
    <Link
      href="/cart"
      className={`relative grid size-9 place-items-center rounded-lg bg-ink text-ivory transition-all duration-300 hover:bg-copper hover:shadow-lg hover:shadow-copper/30 active:scale-90 dark:bg-ivory dark:text-ink sm:size-11 sm:rounded-xl ${
        isBouncing ? "scale-110 shadow-lg shadow-copper/30" : ""
      }`}
      aria-label={`Giỏ hàng có ${displayCount} sản phẩm`}
    >
      <ShoppingBag size={18} />
      <span
        className={`absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-copper text-[9px] font-bold text-white ring-2 ring-white transition-transform duration-300 dark:ring-zinc-900 sm:-right-1.5 sm:-top-1.5 sm:size-5 sm:text-[10px] ${
          isBouncing ? "scale-125" : ""
        }`}
      >
        {displayCount > 99 ? "99+" : displayCount}
      </span>
    </Link>
  );
}
