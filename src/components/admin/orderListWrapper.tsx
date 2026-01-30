"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function OrderListWrapper({
  initialOrders,
}: {
  initialOrders: any[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const filteredOrders = orders.filter(
    (o) =>
      o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDelete = async (id: string) => {
    if (!confirm(`Are you sure you want to delete this order?`)) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) {
      alert(error.message);
    } else {
      setOrders(orders.filter((o) => o.id !== id));
      router.refresh();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <input
          type="text"
          placeholder="search by name or email..."
          className="p-3 border border-primary/20 rounded-lg w-full md:w-80 outline-none focus:border-primary bg-primary/[0.02] text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="border border-primary/10 rounded-xl overflow-hidden bg-white hover:border-primary/40 transition-all p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg tracking-tight truncate pr-2">
                  {order.customer_name}
                </h3>
                <span className="text-[9px] mx-2 py-1">{order.status}</span>
              </div>
              <p className="text-xs opacity-60 mb-4">{order.customer_email}</p>
              <p className="text-lg font-black mt-2">
                ${Number(order.total_amount).toFixed(2)}
              </p>
              <p className="text-[10px] mt-4 opacity-40 uppercase tracking-tighter font-bold">
                {new Date(order.created_at).toLocaleDateString()} —{" "}
                {order.delivery_method}
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/admin/orders/edit/${order.id}`}
                className="flex-1 text-center py-2.5 bg-primary text-white rounded-lg font-bold hover:brightness-110 transition-all"
              >
                manage
              </Link>
              <button
                onClick={() => handleDelete(order.id)}
                className="px-4 text-black font-bold"
              >
                delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
