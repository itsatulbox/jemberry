import ProductListWrapper from "@/components/admin/productListWrapper";
import { createClient } from "@/utils/supabase/server";

export default async function ManageProductsPage() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("*, variants:product_variants(*)")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-6 text-primary font-bold">
        Error loading products: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-primary">Manage Products</h1>
      <ProductListWrapper initialProducts={products || []} />
    </div>
  );
}
