import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productSlug: string, variant: string) => void;
  updateQuantity: (productSlug: string, variant: string, qty: number) => void;
  clearCart: () => void;
  totalAmount: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const existing = get().items.find(
          (i) => i.productSlug === newItem.productSlug && i.variant === newItem.variant
        );
        if (existing) {
          set((s) => ({
            items: s.items.map((i) =>
              i.productSlug === newItem.productSlug && i.variant === newItem.variant
                ? { ...i, quantity: i.quantity + newItem.quantity }
                : i
            ),
          }));
        } else {
          set((s) => ({ items: [...s.items, newItem] }));
        }
      },

      removeItem: (slug, variant) =>
        set((s) => ({
          items: s.items.filter((i) => !(i.productSlug === slug && i.variant === variant)),
        })),

      updateQuantity: (slug, variant, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.productSlug === slug && i.variant === variant ? { ...i, quantity: qty } : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      totalAmount: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "cart-storage" }
  )
);
