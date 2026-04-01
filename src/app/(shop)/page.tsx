import ShopItem from "@/components/products/shopItem";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export const revalidate = 3600;

export default async function Home() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("*, variants:product_variants(*), addons:product_addons(*)")
    .order("created_at", { ascending: false })
    .limit(15);

  if (error)
    return (
      <div className="py-20 text-center">Error loading featured products.</div>
    );

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full py-16">
        <div className="flex flex-col mb-12">
          <h1 className="text-3xl font-bold mb-8">Featured</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
          {products?.map((item) => (
            <ShopItem key={item.id} item={item} />
          ))}
        </div>

        <div className="flex justify-center mt-20">
          <Link
            href="/products"
            className="px-10 py-4 bg-primary text-white hover:brightness-95 transition-all rounded-md font-bold"
          >
            Shop all products
          </Link>
        </div>
      </div>
    </div>
  );
}
