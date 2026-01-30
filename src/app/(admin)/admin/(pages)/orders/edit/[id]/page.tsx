import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import OrderForm from "@/components/admin/orderForm";
import Link from "next/link";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !order) return notFound();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-primary">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <Link
            href="/admin/orders"
            className="text-sm font-bold opacity-60 hover:opacity-100"
          >
            ← back to orders
          </Link>
          <h1 className="text-3xl font-bold mt-2">Order Summary</h1>
          <p className="opacity-50 text-xs">ID: {order.id}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold uppercase tracking-widest">
            {order.status}
          </p>
          <p className="text-xs opacity-50">
            {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Pass data to the Client Component which handles the "View vs Edit" toggle */}
      <OrderForm initialData={order} />
    </div>
  );
}
