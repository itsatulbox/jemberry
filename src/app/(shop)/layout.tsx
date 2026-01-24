import Navbar from "@/components/common/navbar";
import Footer from "@/components/common/footer";
import { CartProvider } from "@/context/cartContext";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <CartProvider>
        <Navbar />
        <main className="grow">{children}</main>
        <Footer />
      </CartProvider>
    </div>
  );
}
