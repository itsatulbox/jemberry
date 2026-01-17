import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Header from "@/components/common/header";
import Navbar from "@/components/common/navbar";

export default async function ProductPage({
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
    console.error("Error fetching product:", error);
    return notFound();
  }

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-white">
      <Navbar />
      <Header />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full py-12">
        <div className="flex flex-col md:flex-row w-full gap-16">
          {/* IMAGE SECTION */}
          <div className="relative flex-1 aspect-square bg-gray-50 rounded-md overflow-hidden">
            <Image
              src={product.main_image || "/placeholder.jpg"}
              alt={product.name}
              className="object-cover"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="flex flex-col w-full md:w-[480px] gap-9">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              <p className="text-2xl font-medium text-gray-700">
                NZD {Number(product.price).toFixed(2)}
              </p>
            </div>

            <div className="flex flex-col">
              <button className="w-full bg-primary text-white py-4 rounded-full font-bold hover:opacity-80 transition-opacity">
                Add to Cart
              </button>
              <p className="py-2 mt-2.5 mx-auto text-sm text-primary font-medium">
                Only a few left!
              </p>
            </div>

            <div className="flex flex-col border-t pt-6">
              <h3 className="font-bold mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description || "No description available."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
