"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function PageListWrapper({
  initialPages,
}: {
  initialPages: any[];
}) {
  const [pages, setPages] = useState(initialPages);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    const { error } = await supabase.from("pages").delete().eq("id", id);
    if (error) {
      alert(error.message);
    } else {
      setPages(pages.filter((p) => p.id !== id));
      router.refresh();
    }
  };

  const handleToggleVisibility = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("pages")
      .update({ is_visible: !current })
      .eq("id", id);
    if (error) {
      alert(error.message);
    } else {
      setPages(
        pages.map((p) => (p.id === id ? { ...p, is_visible: !current } : p))
      );
      router.refresh();
    }
  };

  const handleSwapOrder = async (indexA: number, indexB: number) => {
    if (indexB < 0 || indexB >= pages.length) return;
    const a = pages[indexA];
    const b = pages[indexB];

    const { error: errA } = await supabase
      .from("pages")
      .update({ display_order: b.display_order })
      .eq("id", a.id);
    const { error: errB } = await supabase
      .from("pages")
      .update({ display_order: a.display_order })
      .eq("id", b.id);

    if (errA || errB) {
      alert("Failed to reorder");
      return;
    }

    const updated = [...pages];
    const tempOrder = a.display_order;
    updated[indexA] = { ...a, display_order: b.display_order };
    updated[indexB] = { ...b, display_order: tempOrder };
    updated.sort((x, y) => x.display_order - y.display_order);
    setPages(updated);
    router.refresh();
  };

  return (
    <div className="space-y-6 text-primary">
      <div className="flex justify-end">
        <Link
          href="/admin/pages/new"
          className="bg-primary text-white px-6 py-2 rounded-md font-bold text-center"
        >
          + add page
        </Link>
      </div>

      <div className="border border-primary/10 rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-primary/10 bg-primary/5">
              <th className="text-left p-3 font-bold">Order</th>
              <th className="text-left p-3 font-bold">Title</th>
              <th className="text-left p-3 font-bold">Slug</th>
              <th className="text-left p-3 font-bold">Nav Label</th>
              <th className="text-center p-3 font-bold">Visible</th>
              <th className="text-right p-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page, i) => (
              <tr
                key={page.id}
                className="border-b border-primary/5 hover:bg-primary/[0.02]"
              >
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSwapOrder(i, i - 1)}
                      disabled={i === 0}
                      className="text-primary/40 hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      &uarr;
                    </button>
                    <button
                      onClick={() => handleSwapOrder(i, i + 1)}
                      disabled={i === pages.length - 1}
                      className="text-primary/40 hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      &darr;
                    </button>
                    <span className="ml-1 text-xs opacity-50">
                      {page.display_order}
                    </span>
                  </div>
                </td>
                <td className="p-3 font-bold">{page.title}</td>
                <td className="p-3 opacity-60">/{page.slug}</td>
                <td className="p-3">{page.nav_label}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() =>
                      handleToggleVisibility(page.id, page.is_visible)
                    }
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      page.is_visible
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {page.is_visible ? "visible" : "hidden"}
                  </button>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/pages/edit/${page.slug}`}
                      className="px-3 py-1 border border-primary/20 rounded text-xs font-bold hover:bg-primary/5"
                    >
                      edit
                    </Link>
                    <button
                      onClick={() => handleDelete(page.id, page.title)}
                      className="px-3 py-1 text-red-400 hover:text-red-600 text-xs font-bold"
                    >
                      delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center opacity-50">
                  No pages yet. Create your first page!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
