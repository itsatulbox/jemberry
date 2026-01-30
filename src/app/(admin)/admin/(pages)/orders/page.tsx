import OrderListWrapper from "@/components/admin/orderListWrapper";
import { createClient } from "@/utils/supabase/server";

export default async function ManageOrdersPage() {
  const supabase = await createClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-6 text-primary font-bold">
        Error loading orders: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-primary">Manage Orders</h1>
      <OrderListWrapper initialOrders={orders || []} />
    </div>
  );
}
