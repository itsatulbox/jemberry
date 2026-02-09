import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ImageCarousel from "@/components/products/imageCarousel";
import VariantSelector from "@/components/products/variantSelector";

export default async function Product({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("*, variants:product_variants(*)")
    .eq("slug", slug)
    .single();

  if (error || !product) {
    return notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row gap-16">
        <ImageCarousel
          mainImage={product.main_image}
          images={product.images || []}
          alt={product.name}
        />

        <div className="flex flex-col w-full md:w-[480px] gap-8">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
          </div>

          <VariantSelector product={product} />

          <p className="leading-relaxed">
            {product.description || "No description available."}
          </p>
        </div>
      </div>
    </div>
  );
}
