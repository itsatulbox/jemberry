"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import RichTextEditor from "@/components/admin/richTextEditor";
import { Page } from "@/types/Page";

const RESERVED_SLUGS = ["products", "cart", "checkout", "success", "admin"];

export default function PageForm({ initialData }: { initialData?: Page }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    nav_label: initialData?.nav_label || "",
    content: initialData?.content || "",
    display_order: initialData?.display_order?.toString() || "0",
    is_visible: initialData?.is_visible ?? true,
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: initialData?.id ? formData.slug : generateSlug(title),
      nav_label: initialData?.id ? formData.nav_label : title,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (RESERVED_SLUGS.includes(formData.slug)) {
      setError(`"${formData.slug}" is a reserved slug and cannot be used.`);
      setLoading(false);
      return;
    }

    const payload = {
      title: formData.title,
      slug: formData.slug,
      nav_label: formData.nav_label,
      content: formData.content,
      display_order: parseInt(formData.display_order),
      is_visible: formData.is_visible,
    };

    if (initialData?.id) {
      const { error: updateErr } = await supabase
        .from("pages")
        .update(payload)
        .eq("id", initialData.id);
      if (updateErr) {
        setError(updateErr.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: insertErr } = await supabase
        .from("pages")
        .insert([payload]);
      if (insertErr) {
        setError(insertErr.message);
        setLoading(false);
        return;
      }
    }

    router.push("/admin/pages");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl mx-auto text-primary"
    >
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-bold mb-1">page title</label>
          <input
            type="text"
            className="w-full border border-primary/20 p-2 rounded-md outline-none focus:border-primary"
            value={formData.title}
            onChange={handleTitleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">slug</label>
            <input
              type="text"
              className="w-full border border-primary/20 p-2 rounded-md outline-none focus:border-primary"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">navbar label</label>
            <input
              type="text"
              className="w-full border border-primary/20 p-2 rounded-md outline-none focus:border-primary"
              value={formData.nav_label}
              onChange={(e) =>
                setFormData({ ...formData, nav_label: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">display order</label>
            <input
              type="number"
              className="w-full border border-primary/20 p-2 rounded-md outline-none focus:border-primary"
              value={formData.display_order}
              onChange={(e) =>
                setFormData({ ...formData, display_order: e.target.value })
              }
              required
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_visible}
                onChange={(e) =>
                  setFormData({ ...formData, is_visible: e.target.checked })
                }
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm font-bold">visible in navbar</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">content</label>
          <RichTextEditor
            content={formData.content}
            onChange={(html) => setFormData({ ...formData, content: html })}
          />
        </div>
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
          ? "update page"
          : "create page"}
      </button>
    </form>
  );
}
