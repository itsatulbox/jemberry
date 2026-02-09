import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="flex min-h-screen bg-white font-sans">
      <nav className="w-64 border-r border-primary/10 p-8">
        <h2 className="text-xl font-bold mb-12 uppercase">Admin Panel</h2>
        <ul className="space-y-6">
          <li>
            <Link
              href="/admin/products"
              className="text-sm font-bold opacity-60 hover:opacity-100 transition-all uppercase tracking-widest"
            >
              Products
            </Link>
          </li>
          <li>
            <Link
              href="/admin/orders"
              className="text-sm font-bold opacity-60 hover:opacity-100 transition-all uppercase tracking-widest"
            >
              Orders
            </Link>
          </li>
        </ul>
      </nav>

      <main className="flex-1 p-12">{children}</main>
    </div>
  );
}
