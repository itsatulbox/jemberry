"use client";

import { useState } from "react";
import { Product } from "@/types/Product";
import AddToCartButton from "@/components/shop/addToCartButton";

export default function VariantSelector({ product }: { product: Product }) {
  const [selectedVariantName, setSelectedVariantName] = useState<string | null>(
    null
  );
  const [selectedAddonName, setSelectedAddonName] = useState<string | null>(
    null
  );
  const hasVariants = product.variants && product.variants.length > 0;
  const hasAddons = product.addons && product.addons.length > 0;
  const selectedVariant =
    product.variants?.find((v) => v.name === selectedVariantName) || null;
  const selectedAddon =
    product.addons?.find((a) => a.name === selectedAddonName) || null;

  const addonGroupLabel = product.addons?.[0]?.group_label || "Add-on";
  const addonModifier = selectedAddon ? Number(selectedAddon.price_modifier) : 0;

  const displayPrice = () => {
    if (!hasVariants) {
      const base = Number(product.price) + addonModifier;
      return `NZD ${base.toFixed(2)}`;
    }
    if (selectedVariant) {
      const total = selectedVariant.price + addonModifier;
      return `NZD ${total.toFixed(2)}`;
    }
    const prices = product.variants.map((v) => v.price + addonModifier);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return `NZD ${min.toFixed(2)}`;
    return `NZD ${min.toFixed(2)} — ${max.toFixed(2)}`;
  };

  const effectivePrice = selectedVariant
    ? selectedVariant.price + addonModifier
    : Number(product.price) + addonModifier;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg">{displayPrice()}</p>

      {hasVariants && (
        <div>
          <label className="block text-sm font-medium mb-1">Variant</label>
          <select
            value={selectedVariantName || ""}
            onChange={(e) => setSelectedVariantName(e.target.value || null)}
            className="w-full border border-gray-300 rounded-md p-3 text-sm outline-none focus:border-black transition"
          >
            <option value="">Select a variant</option>
            {product.variants.map((v) => (
              <option key={v.name} value={v.name} disabled={v.stock <= 0}>
                {v.name} — NZD {v.price.toFixed(2)}
                {v.stock <= 0 ? " (Sold Out)" : ""}
              </option>
            ))}
          </select>
          {selectedVariant &&
            selectedVariant.stock > 0 &&
            selectedVariant.stock < 5 && (
              <p className="text-xs font-medium mt-1">
                Only {selectedVariant.stock} left!
              </p>
            )}
        </div>
      )}

      {hasAddons && (
        <div>
          <label className="block text-sm font-medium mb-1">
            {addonGroupLabel}
          </label>
          <select
            value={selectedAddonName || ""}
            onChange={(e) => setSelectedAddonName(e.target.value || null)}
            className="w-full border border-gray-300 rounded-md p-3 text-sm outline-none focus:border-black transition"
          >
            <option value="">None</option>
            {product.addons.map((a) => (
              <option key={a.name} value={a.name}>
                {a.name}
                {Number(a.price_modifier) !== 0
                  ? ` (${Number(a.price_modifier) > 0 ? "+" : ""}$${Number(a.price_modifier).toFixed(2)})`
                  : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <AddToCartButton
        product={product}
        selectedVariant={selectedVariantName}
        variantPrice={selectedVariant?.price ?? null}
        selectedAddon={selectedAddonName}
        addonPrice={addonModifier || null}
      />
    </div>
  );
}
