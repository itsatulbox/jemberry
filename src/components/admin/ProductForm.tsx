"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ProductForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    main_image: initialData?.main_image || "",
    images: initialData?.images || [],
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!initialData?.id) {
      setFormData({ ...formData, name, slug: generateSlug(name) });
    } else {
      setFormData({ ...formData, name });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let uploadedImageUrls: string[] = [...formData.images];
    let mainImageUrl = formData.main_image;

    if (files.length > 0) {
      for (const file of files) {
        const fileName = `${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("products")
          .upload(fileName, file);

        if (uploadData) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("products").getPublicUrl(fileName);

          uploadedImageUrls.push(publicUrl);

          if (!mainImageUrl) mainImageUrl = publicUrl;
        }
      }
    }

    const payload = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      price: parseFloat(formData.price),
      images: uploadedImageUrls,
      main_image: mainImageUrl,
    };

    const { error } = initialData?.id
      ? await supabase.from("products").update(payload).eq("id", initialData.id)
      : await supabase.from("products").insert([payload]);

    if (!error) {
      router.push("/admin/products");
      router.refresh();
    } else {
      alert(error.message);
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-8 rounded-xl border shadow-sm max-w-2xl mx-auto"
    >
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Product Name
          </label>
          <input
            type="text"
            className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.name}
            onChange={handleNameChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Slug (URL)
          </label>
          <input
            type="text"
            className="w-full border p-2 rounded-md bg-gray-50"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Description
          </label>
          <textarea
            className="w-full border p-2 rounded-md h-32"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Price ($)
          </label>
          <input
            type="number"
            step="0.01"
            className="w-full border p-2 rounded-md"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            required
          />
        </div>

        <div className="p-4 border-2 border-dashed rounded-lg bg-gray-50">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Upload Images (Multiple)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
          />
          {files.length > 0 && (
            <p className="mt-2 text-sm text-blue-600 font-medium">
              {files.length} files selected
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 disabled:bg-gray-400 transition-all"
      >
        {loading
          ? "Processing..."
          : initialData
            ? "Update Product"
            : "Create Product"}
      </button>
    </form>
  );
}
