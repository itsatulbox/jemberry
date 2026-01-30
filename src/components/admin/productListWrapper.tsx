"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ProductListWrapper({
  initialProducts,
}: {
  initialProducts: any[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      alert(error.message);
    } else {
      setProducts(products.filter((p) => p.id !== id));
      router.refresh();
    }
  };

  return (
    <div className="space-y-6 text-primary">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <input
          type="text"
          placeholder="search products..."
          className="p-2 border border-primary/20 rounded-md w-full md:w-64 outline-none focus:border-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Link
          href="/admin/products/new"
          className="w-full md:w-auto bg-primary text-white px-6 py-2 rounded-md font-bold text-center"
        >
          + add product
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="border border-primary/10 rounded-md overflow-hidden bg-white hover:border-primary/30 transition-all"
          >
            <div className="aspect-square relative bg-gray-50">
              <img
                src={product.main_image || "/placeholder.jpg"}
                alt={product.name}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold truncate">{product.name}</h3>
              <p className="text-sm italic opacity-70">
                ${product.price} — stock: {product.stock}
              </p>

              <div className="flex gap-2 mt-4">
                <Link
                  href={`/admin/products/edit/${product.slug}`}
                  className="flex-1 text-center py-2 border border-primary/20 rounded-md text-xs font-bold hover:bg-primary/5"
                >
                  edit
                </Link>
                <button
                  onClick={() => handleDelete(product.id, product.name)}
                  className="px-3 text-red-400 hover:text-red-600"
                >
                  delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
