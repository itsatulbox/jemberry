import ShopItem from "@/components/products/shopItem";
import { createClient } from "@/utils/supabase/server";
import FilterBar from "@/components/products/filterBar";
import { Suspense } from "react";

export default async function Products({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sort?: string }>;
}) {
  const supabase = await createClient();
  const { search, sort } = await searchParams;

  let query = supabase.from("products").select("*, variants:product_variants(*)");

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  switch (sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data: products, error } = await query;

  if (error)
    return <div className="py-20 text-center">Error loading products.</div>;

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full py-12">
        <h1 className="text-3xl font-bold mb-8">Products</h1>

        <Suspense fallback={null}>
          <FilterBar />
        </Suspense>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mt-8">
          {products.map((item) => (
            <ShopItem key={item.id} item={item} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="py-20 text-center italic opacity-60">
            No products match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
