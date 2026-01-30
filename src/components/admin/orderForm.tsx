"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function OrderForm({ initialData }: { initialData: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: initialData.status,
    address: initialData.address,
    city: initialData.city,
  });

  const router = useRouter();
  const supabase = createClient();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from("orders")
      .update(formData)
      .eq("id", initialData.id);
    if (!error) {
      setIsEditing(false);
      router.refresh();
    } else {
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-end">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-[10px] font-black py-2 px-6 border border-primary/20 rounded-full hover:bg-primary hover:text-white transition-all uppercase tracking-widest"
        >
          {isEditing ? "Cancel Edit" : "Modify Details"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* VIEW MODE: PACKING LIST */}
        <div className="space-y-6">
          <h2 className="font-black text-xs uppercase tracking-[0.3em] opacity-30">
            Packing List
          </h2>
          <div className="border border-primary/10 rounded-2xl divide-y divide-primary/5 bg-white overflow-hidden">
            {initialData.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-6 p-6">
                <div
                  style={{ width: "60px", height: "60px", minWidth: "60px" }}
                  className="bg-primary/5 rounded-lg overflow-hidden border border-primary/5"
                >
                  <img
                    src={item.main_image || "/placeholder.jpg"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[14px] leading-tight mb-1 uppercase tracking-tight">
                    {item.name}
                  </h3>
                  <span className="text-[10px] font-black text-primary px-2 py-0.5 rounded bg-primary/10">
                    QTY: {item.quantity}
                  </span>
                </div>
                <div className="text-right font-mono text-[11px] opacity-40">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 flex justify-between items-center bg-primary text-white rounded-2xl shadow-xl shadow-primary/10">
            <span className="font-bold text-[10px] uppercase tracking-widest opacity-80">
              Total Paid
            </span>
            <span className="text-3xl font-black italic tracking-tighter">
              ${Number(initialData.total_amount).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="border border-primary/10 p-10 rounded-2xl bg-primary/[0.01] h-fit">
          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase mb-2 opacity-40">
                  Status
                </label>
                <select
                  className="w-full text-sm p-4 border border-primary/20 rounded-xl bg-white outline-none focus:border-primary transition-all font-bold"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="pending">pending</option>
                  <option value="paid">paid</option>
                  <option value="shipped">shipped</option>
                  <option value="delivered">delivered</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase mb-2 opacity-40">
                  Address
                </label>
                <textarea
                  className="w-full text-sm p-4 border border-primary/20 rounded-xl outline-none h-32 focus:border-primary transition-all font-medium"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white text-[11px] font-black tracking-[0.2em] py-5 rounded-xl hover:scale-[1.02] active:scale-[0.98] disabled:bg-primary/20 transition-all"
              >
                {loading ? "SAVING..." : "UPDATE ORDER"}
              </button>
            </form>
          ) : (
            <div className="space-y-10">
              <div>
                <p className="text-[9px] font-black uppercase opacity-30 mb-2 tracking-widest">
                  Recipient
                </p>
                <p className="text-xl font-bold italic tracking-tight underline decoration-primary/20 decoration-4 underline-offset-4">
                  {initialData.customer_name}
                </p>
                <p className="text-xs opacity-60 mt-2">
                  {initialData.customer_email}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-black uppercase opacity-30 mb-2 tracking-widest">
                  Delivery Point
                </p>
                <p className="text-sm leading-relaxed font-medium">
                  {initialData.address}
                </p>
                <p className="text-sm font-black mt-1 uppercase text-primary">
                  {initialData.city}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-primary/10">
                <div>
                  <p className="text-[9px] font-black uppercase opacity-30 mb-2 tracking-widest">
                    Method
                  </p>
                  <p className="text-[11px] font-black uppercase text-primary">
                    {initialData.delivery_method}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase opacity-30 mb-2 tracking-widest">
                    Phone
                  </p>
                  <p className="text-xs font-bold">
                    {initialData.customer_phone || "—"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
