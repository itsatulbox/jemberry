import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="flex min-h-screen">
      <nav className="w-64 bg-gray-900 text-white p-6">
        <h2 className="text-xl font-bold mb-8">Store Admin</h2>
        <ul className="space-y-4">
          <li>
            <a href="/admin/dashboard" className="hover:text-blue-400">
              Dashboard
            </a>
          </li>
          <li>
            <a href="/admin/products" className="hover:text-blue-400">
              Products
            </a>
          </li>
        </ul>
      </nav>
      <main className="flex-1 p-10 bg-gray-50">{children}</main>
    </div>
  );
}
