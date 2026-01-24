import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import AddToCartButton from "@/components/shop/addToCartButton";

export default async function Product({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !product) {
    return notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row gap-16">
        <div className="relative flex-1 aspect-square bg-gray-50 overflow-hidden">
          <Image
            src={product.main_image || "/placeholder.jpg"}
            alt={product.name}
            className="object-cover"
            fill
            priority
          />
        </div>

        <div className="flex flex-col w-full md:w-[480px] gap-8">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="mt-2">NZD {Number(product.price).toFixed(2)}</p>
          </div>

          <AddToCartButton product={product} />

          <p className="leading-relaxed">
            {product.description || "No description available."}
          </p>
        </div>
      </div>
    </div>
  );
}
