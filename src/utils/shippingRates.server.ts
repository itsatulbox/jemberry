// Server-only shipping rate utilities
import { createClient } from "@/utils/supabase/server";

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

export async function getShippingRate(
  country: string,
  method: "shipping" | "pickup",
): Promise<number> {
  if (method === "pickup") return 0;
  if (!country || country.trim() === "") return 0;

  const { zones, countries } = await getShippingDataFromDB();
  const match = countries.find(
    (c) => c.name.toLowerCase() === country.trim().toLowerCase(),
  );
  const zone = match
    ? zones.find((z) => z.id === match.zone_id)
    : zones.find((z) => z.name === "rest_of_world");

  return zone ? Number(zone.rate) : 0;
}
