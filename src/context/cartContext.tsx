"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { Product, CartItem } from "@/types/Product";

interface CartContextType {
  cart: CartItem[];
  addToCart: (
    product: Product,
    variant?: string | null,
    variantPrice?: number | null
  ) => void;
  removeFromCart: (id: string, variant?: string | null) => void;
  updateQuantity: (
    id: string,
    variant: string | null | undefined,
    delta: number
  ) => void;
  clearCart: () => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const isInitialized = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem("jemberry-cart");
    if (saved) {
      try {
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
    variantPrice?: number | null
  ) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) =>
          item.id === product.id &&
          (item.selectedVariant || null) === (variant || null)
      );
      // Use the selected variant's stock, or fall back to product.stock
      const maxStock = variant
        ? product.variants?.find((v) => v.name === variant)?.stock ??
          product.stock
        : product.stock;
      if (existingItem) {
        if (existingItem.quantity >= maxStock) return currentCart;
        return currentCart.map((item) =>
          item.id === product.id &&
          (item.selectedVariant || null) === (variant || null)
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
        },
      ];
    });
  };

  const updateQuantity = (
    id: string,
    variant: string | null | undefined,
    delta: number
  ) => {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (
          item.id === id &&
          (item.selectedVariant || null) === (variant || null)
        ) {
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

  const removeFromCart = (id: string, variant?: string | null) => {
    setCart((current) =>
      current.filter(
        (item) =>
          !(
            item.id === id &&
            (item.selectedVariant || null) === (variant || null)
          )
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("jemberry-cart");
  };

  const cartTotal = cart.reduce(
    (total, item) => total + (item.variantPrice ?? item.price) * item.quantity,
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
