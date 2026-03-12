import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export default async function CMSPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!page) return notFound();

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-12">{page.title}</h1>
      <div
        className="description-content"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
