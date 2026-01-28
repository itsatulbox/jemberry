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
    stock: initialData?.stock || 1,
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
    setFormData({
      ...formData,
      name,
      slug: initialData?.id ? formData.slug : generateSlug(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let uploadedImageUrls: string[] = [...formData.images];
    let mainImageUrl = formData.main_image;

    if (files.length > 0) {
      for (const file of files) {
        const fileName = `${Date.now()}-${file.name}`;
        const { data: uploadData } = await supabase.storage
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
      stock: parseInt(formData.stock.toString()),
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
      className="space-y-6 max-w-2xl mx-auto text-primary"
    >
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-bold mb-1">product name</label>
          <input
            type="text"
            className="w-full border border-primary/20 p-2 rounded-md outline-none focus:border-primary"
            value={formData.name}
            onChange={handleNameChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">price ($)</label>
            <input
              type="number"
              step="0.01"
              className="w-full border border-primary/20 p-2 rounded-md outline-none"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">
              stock quantity
            </label>
            <input
              type="number"
              className="w-full border border-primary/20 p-2 rounded-md outline-none"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">description</label>
          <textarea
            className="w-full border border-primary/20 p-2 rounded-md h-32 outline-none"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className="p-4 border-2 border-dashed border-primary/20 rounded-lg bg-primary/5">
          <label className="block text-sm font-bold mb-2">upload images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="text-xs text-primary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-white cursor-pointer"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-primary text-white rounded-md font-bold hover:brightness-95 disabled:bg-gray-300 transition-all"
      >
        {loading
          ? "processing..."
          : initialData
            ? "update product"
            : "create product"}
      </button>
    </form>
  );
}
