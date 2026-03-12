// Client-safe shipping rate utilities (no server imports)

export type ShippingZone = {
  id: string;
  name: string;
  rate: number;
  label: string;
};

export type ShippingCountry = {
  name: string;
  zone_id: string;
  is_popular: boolean;
  display_order: number;
};

export function getShippingRateFromData(
  country: string,
  method: "shipping" | "pickup",
  zones: ShippingZone[],
  countries: ShippingCountry[],
): number {
  if (method === "pickup") return 0;
  if (!country || country.trim() === "") return 0;

  const match = countries.find(
    (c) => c.name.toLowerCase() === country.trim().toLowerCase(),
  );
  const zone = match
    ? zones.find((z) => z.id === match.zone_id)
    : zones.find((z) => z.name === "rest_of_world");

  return zone ? Number(zone.rate) : 0;
}

export function getShippingLabelFromData(
  country: string,
  method: "shipping" | "pickup",
  zones: ShippingZone[],
  countries: ShippingCountry[],
): string {
  if (method === "pickup") return "Free (Pickup)";
  if (!country || country.trim() === "") return "Enter country";

  const match = countries.find(
    (c) => c.name.toLowerCase() === country.trim().toLowerCase(),
  );
  const zone = match
    ? zones.find((z) => z.id === match.zone_id)
    : zones.find((z) => z.name === "rest_of_world");

  if (!zone) return "Enter country";
  return `$${Number(zone.rate).toFixed(2)} — ${zone.label}`;
}
