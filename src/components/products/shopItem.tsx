import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/Product";

export default function ShopItem({ item }: { item: Product }) {
  const hasVariants = item.variants && item.variants.length > 0;
  const isSoldOut = hasVariants
    ? item.variants.every((v) => v.stock <= 0)
    : item.stock <= 0;

  return (
    <Link href={`/products/${item.slug}`}>
      <div className="flex flex-col items-center">
        <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-gray-50">
          <Image
            src={item.main_image || "/placeholder.jpg"}
            alt={item.name}
            fill
            className="object-cover"
          />

          {isSoldOut && (
            <div className="absolute inset-0 p-4 z-10 flex items-start justify-start pointer-events-none">
              <div className="bg-white px-3 py-1.5 border border-black/10 shadow-sm rounded-sm pointer-events-auto">
                <span className="text-[10px] font-bold uppercase tracking-widest text-black">
                  Sold Out
                </span>
              </div>
            </div>
          )}
        </div>

        <h4 className="font-bold mt-4">{item.name}</h4>
        <p className="mt-2">
          {item.variants && item.variants.length > 0
            ? (() => {
                const prices = item.variants.map((v) => v.price);
                const min = Math.min(...prices);
                const max = Math.max(...prices);
                return min === max
                  ? `NZD ${min.toFixed(2)}`
                  : `NZD ${min.toFixed(2)} — ${max.toFixed(2)}`;
              })()
            : `NZD ${item.price.toFixed(2)}`}
        </p>
      </div>
    </Link>
  );
}
