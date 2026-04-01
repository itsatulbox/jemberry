import Navbar from "@/components/common/navbar";
import Footer from "@/components/common/footer";
import { CartProvider } from "@/context/cartContext";
import { ToastProvider } from "@/context/toastContext";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 3600;

async function getNavLinks() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pages")
    .select("slug, nav_label")
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  return [
    { href: "/products", label: "Products" },
    ...(data || []).map((p) => ({ href: `/${p.slug}`, label: p.nav_label })),
  ];
}

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navLinks = await getNavLinks();

  return (
    <div className="flex flex-col min-h-screen">
      <CartProvider>
        <ToastProvider>
          <Navbar navLinks={navLinks} />
          <main className="grow">{children}</main>
          <Footer />
        </ToastProvider>
      </CartProvider>
    </div>
  );
}
