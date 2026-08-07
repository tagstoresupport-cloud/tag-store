import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { OrderItem } from "@/lib/types";

export type CartLine = OrderItem & { variant_id: string };

type CartContextValue = {
  items: CartLine[];
  count: number;
  total: number;
  addItem: (line: CartLine) => void;
  removeItem: (productId: string, variantId: string) => void;
  setQuantity: (productId: string, variantId: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "tagstore.cart.v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartLine[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((line: CartLine) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.product_id === line.product_id && i.variant_id === line.variant_id,
      );
      if (!existing) return [...prev, line];
      return prev.map((i) =>
        i === existing ? { ...i, quantity: i.quantity + line.quantity } : i,
      );
    });
  }, []);


  const removeItem = useCallback((productId: string, variantId: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.product_id === productId && i.variant_id === variantId)),
    );
  }, []);

  const setQuantity = useCallback((productId: string, variantId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.product_id === productId && i.variant_id === variantId
          ? { ...i, quantity: Math.max(1, Math.min(99, quantity)) }
          : i,
      ),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return { items, count, total, addItem, removeItem, setQuantity, clear };
  }, [items, addItem, removeItem, setQuantity, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
