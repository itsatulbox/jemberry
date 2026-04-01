"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import RichTextEditor from "@/components/admin/richTextEditor";
import { compressImage } from "@/utils/compressImage";
import { cdnUrl } from "@/utils/cdnUrl";

export default function ProductForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [variants, setVariants] = useState<
    { name: string; price: number; stock: number }[]
  >(
    initialData?.variants?.map((v: any) => ({
      name: v.name,
      price: v.price,
      stock: v.stock,
    })) || []
  );
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantPrice, setNewVariantPrice] = useState("");
  const [newVariantStock, setNewVariantStock] = useState("");

  const [addons, setAddons] = useState<
    { group_label: string; name: string; price_modifier: number }[]
  >(
    initialData?.addons?.map((a: any) => ({
      group_label: a.group_label,
      name: a.name,
      price_modifier: Number(a.price_modifier),
    })) || []
  );
  const [addonGroupLabel, setAddonGroupLabel] = useState(
    initialData?.addons?.[0]?.group_label || "Add-on"
  );
  const [newAddonName, setNewAddonName] = useState("");
  const [newAddonPrice, setNewAddonPrice] = useState("");

  const addVariant = () => {
    const name = newVariantName.trim();
    const price = parseFloat(newVariantPrice);
    const stock = parseInt(newVariantStock);
    if (
      name &&
      !isNaN(price) &&
      !isNaN(stock) &&
      stock >= 0 &&
      !variants.some((v) => v.name === name)
    ) {
      setVariants([...variants, { name, price, stock }]);
      setNewVariantName("");
      setNewVariantPrice("");
      setNewVariantStock("");
    }
  };
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    stock: initialData?.stock?.toString() || "1",
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
    setError(null);

    let uploadedImageUrls: string[] = [...formData.images];
    let mainImageUrl = formData.main_image;

    if (files.length > 0) {
      for (const file of files) {
        const compressed = await compressImage(file);
        const fileName = `${Date.now()}-${compressed.name}`;
        const { data: uploadData } = await supabase.storage
          .from("products")
          .upload(fileName, compressed, {
            cacheControl: "31536000",
          });

        if (uploadData) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("products").getPublicUrl(fileName);
          uploadedImageUrls.push(publicUrl);
          if (!mainImageUrl) mainImageUrl = publicUrl;
        }
      }
    }

    const totalStock =
      variants.length > 0
        ? variants.reduce((sum, v) => sum + v.stock, 0)
        : parseInt(formData.stock);

    const payload = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: totalStock,
      images: uploadedImageUrls,
      main_image: mainImageUrl,
    };

    let productId = initialData?.id;

    if (productId) {
      const { error: updateErr } = await supabase
        .from("products")
        .update(payload)
        .eq("id", productId);
      if (updateErr) {
        setError(updateErr.message);
        setLoading(false);
        return;
      }
    } else {
      const { data: newProduct, error: insertErr } = await supabase
        .from("products")
        .insert([payload])
        .select("id")
        .single();
      if (insertErr || !newProduct) {
        setError(insertErr?.message || "Failed to create product");
        setLoading(false);
        return;
      }
      productId = newProduct.id;
    }

    // Sync variants to product_variants table
    await supabase
      .from("product_variants")
      .delete()
      .eq("product_id", productId);

    if (variants.length > 0) {
      const { error: variantErr } = await supabase
        .from("product_variants")
        .insert(
          variants.map((v) => ({
            product_id: productId,
            name: v.name,
            price: v.price,
            stock: v.stock,
          }))
        );
      if (variantErr) {
        setError("Product saved but variants failed: " + variantErr.message);
        setLoading(false);
        return;
      }
    }

    // Sync addons to product_addons table
    await supabase
      .from("product_addons")
      .delete()
      .eq("product_id", productId);

    if (addons.length > 0) {
      const { error: addonErr } = await supabase
        .from("product_addons")
        .insert(
          addons.map((a) => ({
            product_id: productId,
            group_label: a.group_label,
            name: a.name,
            price_modifier: a.price_modifier,
          }))
        );
      if (addonErr) {
        setError("Product saved but add-ons failed: " + addonErr.message);
        setLoading(false);
        return;
      }
    }

    router.push("/admin/products");
    router.refresh();
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
            <label className="block text-sm font-bold mb-1">price (NZD)</label>
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
            {variants.length > 0 ? (
              <div className="w-full border border-primary/20 p-2 rounded-md bg-primary/5 text-sm">
                {variants.reduce((sum, v) => sum + v.stock, 0)}
                <span className="text-xs opacity-50 ml-1">(from variants)</span>
              </div>
            ) : (
              <input
                type="number"
                className="w-full border border-primary/20 p-2 rounded-md outline-none"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                required
              />
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">description</label>
          <RichTextEditor
            content={formData.description}
            onChange={(html) =>
              setFormData({ ...formData, description: html })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">variants</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Small, Red"
              className="flex-1 border border-primary/20 p-2 rounded-md outline-none text-sm"
              value={newVariantName}
              onChange={(e) => setNewVariantName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addVariant();
                }
              }}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price"
              className="w-24 border border-primary/20 p-2 rounded-md outline-none text-sm"
              value={newVariantPrice}
              onChange={(e) => setNewVariantPrice(e.target.value)}
            />
            <input
              type="number"
              placeholder="Stock"
              className="w-20 border border-primary/20 p-2 rounded-md outline-none text-sm"
              value={newVariantStock}
              onChange={(e) => setNewVariantStock(e.target.value)}
            />
            <button
              type="button"
              onClick={addVariant}
              className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-md hover:brightness-95"
            >
              add
            </button>
          </div>
          {variants.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {variants.map((v, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full"
                >
                  {v.name} — ${v.price.toFixed(2)} (qty: {v.stock})
                  <button
                    type="button"
                    onClick={() =>
                      setVariants(variants.filter((_, idx) => idx !== i))
                    }
                    className="text-primary/60 hover:text-red-500 ml-1"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">add-ons</label>
          <p className="text-xs opacity-50 mb-2">
            Optional second choice (e.g. &quot;With Keychain&quot;). Price modifier is added to the base/variant price.
          </p>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Group label (e.g. Extras)"
              className="w-40 border border-primary/20 p-2 rounded-md outline-none text-sm"
              value={addonGroupLabel}
              onChange={(e) => setAddonGroupLabel(e.target.value)}
            />
            <input
              type="text"
              placeholder="Option name (e.g. Keychain)"
              className="flex-1 border border-primary/20 p-2 rounded-md outline-none text-sm"
              value={newAddonName}
              onChange={(e) => setNewAddonName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const name = newAddonName.trim();
                  const mod = parseFloat(newAddonPrice) || 0;
                  if (name && !addons.some((a) => a.name === name)) {
                    setAddons([
                      ...addons,
                      { group_label: addonGroupLabel, name, price_modifier: mod },
                    ]);
                    setNewAddonName("");
                    setNewAddonPrice("");
                  }
                }
              }}
            />
            <input
              type="number"
              step="0.01"
              placeholder="+$ Price"
              className="w-24 border border-primary/20 p-2 rounded-md outline-none text-sm"
              value={newAddonPrice}
              onChange={(e) => setNewAddonPrice(e.target.value)}
            />
            <button
              type="button"
              onClick={() => {
                const name = newAddonName.trim();
                const mod = parseFloat(newAddonPrice) || 0;
                if (name && !addons.some((a) => a.name === name)) {
                  setAddons([
                    ...addons,
                    { group_label: addonGroupLabel, name, price_modifier: mod },
                  ]);
                  setNewAddonName("");
                  setNewAddonPrice("");
                }
              }}
              className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-md hover:brightness-95"
            >
              add
            </button>
          </div>
          {addons.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {addons.map((a, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full"
                >
                  {a.name}
                  {a.price_modifier !== 0 && (
                    <span className="opacity-60">
                      {a.price_modifier > 0 ? "+" : ""}${a.price_modifier.toFixed(2)}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setAddons(addons.filter((_, idx) => idx !== i))
                    }
                    className="text-primary/60 hover:text-red-500 ml-1"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-2 border-dashed border-primary/20 rounded-lg bg-primary/5">
          <label className="block text-sm font-bold mb-2">upload images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) =>
              setFiles((prev) => [...prev, ...Array.from(e.target.files || [])])
            }
            className="text-xs text-primary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-white cursor-pointer"
          />

          {files.length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="text-xs font-bold opacity-60">
                new files to upload
              </p>
              {files.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs bg-white rounded px-3 py-1.5 border border-primary/10"
                >
                  <span className="truncate mr-2">{file.name}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setFiles((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="text-red-500 hover:text-red-700 shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {formData.images.length > 0 && (
          <div className="p-4 border border-primary/20 rounded-lg">
            <p className="text-sm font-bold mb-2">existing images</p>

            {(() => {
              const idx = Math.min(imageIndex, formData.images.length - 1);
              const url = formData.images[idx];
              const isMain = url === formData.main_image;
              return (
                <div className="flex flex-col gap-3">
                  {/* Main preview */}
                  <div className="relative group w-48 h-48 mx-auto rounded-lg overflow-hidden border-2 border-primary/20 bg-gray-50">
                    <img
                      src={cdnUrl(url)}
                      alt={`Product image ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {isMain && (
                      <span className="absolute top-1.5 left-1.5 text-[10px] font-bold bg-primary text-white px-1.5 py-0.5 rounded">
                        main
                      </span>
                    )}

                    {formData.images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setImageIndex(
                              idx === 0 ? formData.images.length - 1 : idx - 1
                            )
                          }
                          className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="15 18 9 12 15 6" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setImageIndex(
                              idx === formData.images.length - 1 ? 0 : idx + 1
                            )
                          }
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="9 6 15 12 9 18" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-center gap-2">
                    {!isMain && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, main_image: url })
                        }
                        className="text-[11px] bg-primary/10 text-primary font-bold px-3 py-1 rounded hover:bg-primary/20 transition"
                      >
                        set as main
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formData.images.filter(
                          (_: string, j: number) => j !== idx
                        );
                        setFormData({
                          ...formData,
                          images: updated,
                          main_image: isMain
                            ? updated[0] || ""
                            : formData.main_image,
                        });
                        setImageIndex(Math.max(0, idx - 1));
                      }}
                      className="text-[11px] bg-red-50 text-red-500 font-bold px-3 py-1 rounded hover:bg-red-100 transition"
                    >
                      remove
                    </button>
                  </div>

                  {/* Thumbnail strip */}
                  {formData.images.length > 1 && (
                    <div className="flex justify-center gap-1.5 flex-wrap">
                      {formData.images.map((thumb: string, ti: number) => (
                        <button
                          key={ti}
                          type="button"
                          onClick={() => setImageIndex(ti)}
                          className={`w-10 h-10 rounded overflow-hidden border-2 transition ${
                            ti === idx
                              ? "border-primary"
                              : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={cdnUrl(thumb)}
                            alt={`Thumb ${ti + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  <p className="text-center text-[11px] opacity-50">
                    {idx + 1} / {formData.images.length}
                  </p>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

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
