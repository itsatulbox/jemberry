// Server-only shipping rate utilities
import { createClient } from "@/utils/supabase/server";
import {
  getShippingRateFromData,
  isServiceableCountry,
} from "@/utils/shippingRates";

export async function getShippingDataFromDB() {
  const supabase = await createClient();

  const { data: zones } = await supabase
    .from("shipping_zones")
    .select("id, name, rate, label");

  const { data: countries } = await supabase
    .from("shipping_countries")
    .select("name, zone_id, is_popular, display_order")
    .order("display_order", { ascending: true });

  return { zones: zones || [], countries: countries || [] };
}

// Resolves shipping for an order in one DB round-trip: whether we ship to the
// destination at all, and the cost (0 for pickup / free-shipping threshold).
export async function resolveShipping(
  country: string,
  method: "shipping" | "pickup",
  subtotal = 0,
): Promise<{ serviceable: boolean; cost: number }> {
  if (method === "pickup") return { serviceable: true, cost: 0 };
  const { zones, countries } = await getShippingDataFromDB();
  return {
    serviceable: isServiceableCountry(country, zones, countries),
    cost: getShippingRateFromData(country, method, zones, countries, subtotal),
  };
}
