import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data: zones } = await supabase
    .from("shipping_zones")
    .select("id, name, rate, label");

  const { data: countries } = await supabase
    .from("shipping_countries")
    .select("name, zone_id, is_popular, display_order")
    .order("display_order", { ascending: true });

  if (!zones || !countries) {
    return NextResponse.json({ zones: [], countries: [] }, { status: 500 });
  }

  return NextResponse.json({ zones, countries });
}
