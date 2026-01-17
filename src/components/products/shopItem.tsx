import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/Product";

export default function ShopItem({ item }: { item: Product }) {
  return (
    <Link href={`/products/${item.slug}`}>
      <div className="flex flex-col items-center">
        <Image
          src={item.main_image || "/placeholder.jpg"}
          alt={item.name}
          width={500}
          height={500}
        />
        <h4 className="font-bold mt-4">{item.name}</h4>
        <p className="mt-2">NZD {item.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
