"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Product, CartItem } from "@/types/Product";

interface CartContextType {
  cart: CartItem[];
  addToCart: (
    product: Product,
    variant?: string | null,
    variantPrice?: number | null,
    addon?: string | null,
    addonPrice?: number | null
  ) => void;
  removeFromCart: (id: string, variant?: string | null, addon?: string | null) => void;
  updateQuantity: (
    id: string,
    variant: string | null | undefined,
    delta: number,
    addon?: string | null
  ) => void;
  clearCart: () => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartKey(item: { id: string; selectedVariant?: string | null; selectedAddon?: string | null }) {
  return `${item.id}|${item.selectedVariant || ""}|${item.selectedAddon || ""}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Hydrate cart from localStorage after mount (SSR cannot read it).
    const saved = localStorage.getItem("jemberry-cart");
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    isInitialized.current = true;
  }, []);

  useEffect(() => {
    if (isInitialized.current) {
      localStorage.setItem("jemberry-cart", JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (
    product: Product,
    variant?: string | null,
    variantPrice?: number | null,
    addon?: string | null,
    addonPrice?: number | null
  ) => {
    setCart((currentCart) => {
      const key = `${product.id}|${variant || ""}|${addon || ""}`;
      const existingItem = currentCart.find((item) => cartKey(item) === key);
      // Use the selected variant's stock, or fall back to product.stock
      const maxStock = variant
        ? product.variants?.find((v) => v.name === variant)?.stock ??
          product.stock
        : product.stock;
      if (existingItem) {
        if (existingItem.quantity >= maxStock) return currentCart;
        return currentCart.map((item) =>
          cartKey(item) === key
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
          selectedVariant: variant || null,
          variantPrice: variantPrice ?? null,
          selectedAddon: addon || null,
          addonPrice: addonPrice ?? null,
        },
      ];
    });
  };

  const updateQuantity = (
    id: string,
    variant: string | null | undefined,
    delta: number,
    addon?: string | null
  ) => {
    setCart((currentCart) =>
      currentCart.map((item) => {
        const key = `${id}|${variant || ""}|${addon || ""}`;
        if (cartKey(item) === key) {
          const maxStock = item.selectedVariant
            ? item.variants?.find((v) => v.name === item.selectedVariant)
                ?.stock ?? item.stock
            : item.stock;
          const newQty = Math.max(1, Math.min(item.quantity + delta, maxStock));
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: string, variant?: string | null, addon?: string | null) => {
    setCart((current) =>
      current.filter((item) => {
        const key = `${id}|${variant || ""}|${addon || ""}`;
        return cartKey(item) !== key;
      })
    );
  };

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem("jemberry-cart");
  }, []);

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      ((item.variantPrice ?? item.price) + (item.addonPrice ?? 0)) *
        item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
