import ShippingManager from "@/components/admin/shippingManager";
import { createClient } from "@/utils/supabase/server";

export default async function ManageShippingPage() {
  const supabase = await createClient();

  const { data: zones, error: zonesErr } = await supabase
    .from("shipping_zones")
    .select("*")
    .order("name");

  const { data: countries, error: countriesErr } = await supabase
    .from("shipping_countries")
    .select("*")
    .order("display_order", { ascending: true });

  if (zonesErr || countriesErr) {
    return (
      <div className="p-6 text-primary font-bold">
        Error loading shipping data:{" "}
        {zonesErr?.message || countriesErr?.message}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-primary">
        Manage Shipping Rates
      </h1>
      <ShippingManager
        initialZones={zones || []}
        initialCountries={countries || []}
      />
    </div>
  );
}
