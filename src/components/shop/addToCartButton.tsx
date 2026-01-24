"use client";
import { useCart } from "@/context/cartContext";
import { Product } from "@/types/Product";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const isSoldOut = product.stock <= 0;

  return (
    <div className="flex flex-col w-full">
      <button
        onClick={() => addToCart(product)}
        disabled={isSoldOut}
        className="w-full bg-primary text-white py-4 rounded font-bold disabled:brightness-90 hover:brightness-90"
      >
        {isSoldOut ? "Sold Out" : "Add to Cart"}
      </button>
      {!isSoldOut && product.stock < 5 && (
        <p className="py-2 mt-2.5 mx-auto text-sm font-medium">
          Only {product.stock} left!
        </p>
      )}
    </div>
  );
}
