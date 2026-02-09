"use client";
import { useCart } from "@/context/cartContext";
import { Product } from "@/types/Product";

export default function AddToCartButton({
  product,
  selectedVariant,
  variantPrice,
}: {
  product: Product;
  selectedVariant?: string | null;
  variantPrice?: number | null;
}) {
  const { addToCart } = useCart();
  const hasVariants = product.variants && product.variants.length > 0;
  const needsVariant = hasVariants && !selectedVariant;

  // Derive stock from the selected variant, or fall back to product.stock
  const effectiveStock = selectedVariant
    ? product.variants?.find((v) => v.name === selectedVariant)?.stock ?? 0
    : product.stock;
  const isSoldOut = needsVariant ? false : effectiveStock <= 0;

  return (
    <div className="flex flex-col w-full">
      <button
        onClick={() => addToCart(product, selectedVariant, variantPrice)}
        disabled={isSoldOut || needsVariant}
        className="w-full bg-primary text-white py-4 rounded font-bold disabled:brightness-90 hover:brightness-90"
      >
        {isSoldOut
          ? "Sold Out"
          : needsVariant
          ? "Select a variant"
          : "Add to Cart"}
      </button>
      {!hasVariants && !isSoldOut && product.stock < 5 && (
        <p className="py-2 mt-2.5 mx-auto text-sm font-medium">
          Only {product.stock} left!
        </p>
      )}
    </div>
  );
}
