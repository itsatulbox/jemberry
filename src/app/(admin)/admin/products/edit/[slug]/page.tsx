import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/productForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!product) return notFound();

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <p className="text-sm text-gray-500">Editing: {product.name}</p>
      </div>
      <ProductForm initialData={product} />
    </div>
  );
}
