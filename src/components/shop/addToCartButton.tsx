"use client";
import { useCart } from "@/context/cartContext";
import { useToast } from "@/context/toastContext";
import { Product } from "@/types/Product";

export default function AddToCartButton({
  product,
  selectedVariant,
  variantPrice,
  selectedAddon,
  addonPrice,
}: {
  product: Product;
  selectedVariant?: string | null;
  variantPrice?: number | null;
  selectedAddon?: string | null;
  addonPrice?: number | null;
}) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const hasVariants = product.variants && product.variants.length > 0;
  const needsVariant = hasVariants && !selectedVariant;

  // Derive stock from the selected variant, or fall back to product.stock
  const effectiveStock = selectedVariant
    ? product.variants?.find((v) => v.name === selectedVariant)?.stock ?? 0
    : product.stock;
  const isSoldOut = needsVariant ? false : effectiveStock <= 0;

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, variantPrice, selectedAddon, addonPrice);
    const parts = [product.name];
    if (selectedVariant) parts.push(selectedVariant);
    if (selectedAddon) parts.push(selectedAddon);
    showToast(`${parts.join(" — ")} added to cart`);
  };

  return (
    <div className="flex flex-col w-full">
      <button
        onClick={handleAddToCart}
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
