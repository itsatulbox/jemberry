import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import PageForm from "@/components/admin/pageForm";

export default async function EditPagePage({
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
    <div className="max-w-2xl mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Page</h1>
        <p className="text-sm text-gray-500">Editing: {page.title}</p>
      </div>
      <PageForm initialData={page} />
    </div>
  );
}
