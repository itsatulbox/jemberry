import ShopItem from "@/components/products/shopItem";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(15);

  if (error) {
    console.error("Error fetching products:", error);
    return <div>Error loading featured products.</div>;
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen">
      <div className="max-w-5xl w-full mx-auto px-6 py-16">
        <div className="flex flex-col items-center mb-12">
          <h1 className="mx-auto mb-8">Featured</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {products?.map((item) => (
            <ShopItem key={item.id} item={item} />
          ))}
        </div>

        <div className="flex justify-center mt-20">
          <a
            href="/products"
            className="px-10 py-3 bg-black text-white hover:bg-gray-800 transition-all rounded-full font-medium"
          >
            Shop All Products
          </a>
        </div>
      </div>
    </div>
  );
}
