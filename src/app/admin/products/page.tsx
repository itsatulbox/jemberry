import ProductListWrapper from "@/components/admin/ProductListWrapper";
import { createClient } from "@/utils/supabase/server";

export default async function ManageProductsPage() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div>Error loading products: {error.message}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Products</h1>
      <ProductListWrapper initialProducts={products || []} />
    </div>
  );
}
