"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartItem } from "@/types/cart";

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeCartItem(value: unknown): CartItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const productId = Number(value.productId);
  const quantity = Math.floor(Number(value.quantity));
  const stock = Math.max(0, Math.floor(Number(value.stock)));
  const price = Number(value.price);
  const slug = typeof value.slug === "string" ? value.slug : "";
  const name = typeof value.name === "string" ? value.name : "";
  const imageUrl = typeof value.imageUrl === "string" && value.imageUrl ? value.imageUrl : "/icon.svg";

  if (!Number.isInteger(productId) || productId < 1 || !slug || !name || !Number.isFinite(price)) {
    return null;
  }

  return {
    productId,
    slug,
    name,
    imageUrl,
    price,
    quantity: Math.max(1, Math.min(Number.isFinite(quantity) ? quantity : 1, stock || 1)),
    stock,
    variantId: Number.isInteger(Number(value.variantId)) ? Number(value.variantId) : undefined,
    variantSku: typeof value.variantSku === "string" ? value.variantSku : undefined,
    variantName: typeof value.variantName === "string" ? value.variantName : undefined,
    selectedOptions: isRecord(value.selectedOptions)
      ? Object.fromEntries(Object.entries(value.selectedOptions).map(([key, optionValue]) => [key, String(optionValue)]))
      : undefined,
  };
}

function normalizeCartItems(value: unknown) {
  return Array.isArray(value)
    ? value.map(normalizeCartItem).filter((item): item is CartItem => item !== null)
    : [];
}

export function getCartItemKey(item: Pick<CartItem, "productId" | "variantId" | "selectedOptions">) {
  return `${item.productId}:${item.variantId ?? "default"}:${JSON.stringify(item.selectedOptions ?? {})}`;
}

const safeStorage = {
  getItem: (name: string) => {
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    try {
      window.localStorage.setItem(name, value);
    } catch {
      // Ignore storage failures so cart UI never crashes page rendering.
    }
  },
  removeItem: (name: string) => {
    try {
      window.localStorage.removeItem(name);
    } catch {
      // Ignore storage failures so cart UI never crashes page rendering.
    }
  },
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const nextItems = [...state.items];
          const key = getCartItemKey(item);
          const index = nextItems.findIndex((current) => getCartItemKey(current) === key);

          if (index >= 0) {
            const current = nextItems[index];
            nextItems[index] = {
              ...current,
              quantity: Math.min(current.quantity + item.quantity, current.stock),
            };
            return { items: nextItems };
          }

          return { items: [...nextItems, item] };
        }),
      updateQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            getCartItemKey(item) === key
              ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) }
              : item,
          ),
        })),
      removeItem: (key) =>
        set((state) => ({
          items: state.items.filter((item) => getCartItemKey(item) !== key),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "hoang-minh-cart",
      version: 2,
      storage: createJSONStorage(() => safeStorage),
      migrate: (persistedState) => {
        if (!isRecord(persistedState)) {
          return { items: [] };
        }

        return {
          ...persistedState,
          items: normalizeCartItems(persistedState.items),
        } as CartState;
      },
      merge: (persistedState, currentState) => {
        if (!isRecord(persistedState)) {
          return currentState;
        }

        return {
          ...currentState,
          ...persistedState,
          items: normalizeCartItems(persistedState.items),
        };
      },
    },
  ),
);
