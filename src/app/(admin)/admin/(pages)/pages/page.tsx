import PageListWrapper from "@/components/admin/pageListWrapper";
import { createClient } from "@/utils/supabase/server";

export default async function ManagePagesPage() {
  const supabase = await createClient();
  const { data: pages, error } = await supabase
    .from("pages")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    return (
      <div className="p-6 text-primary font-bold">
        Error loading pages: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-primary">Manage Pages</h1>
      <PageListWrapper initialPages={pages || []} />
    </div>
  );
}
