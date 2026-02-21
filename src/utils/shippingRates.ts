// NZ Post static shipping rate table
// Zone-based rates matching NZ Post overseas tracked parcel pricing.

type ShippingZone = "domestic" | "australia_pacific" | "rest_of_world";

const ZONE_RATES: Record<ShippingZone, number> = {
  domestic: 8,
  australia_pacific: 23,
  rest_of_world: 28,
};

const AUSTRALIA_PACIFIC_COUNTRIES = [
  "Australia",
  "Fiji",
  "Samoa",
  "Tonga",
  "Cook Islands",
];

// Exported so the checkout page can build a dropdown from it
// Popular destinations first, then Pacific, then rest of world, then catch-all
const POPULAR_COUNTRIES: { name: string; zone: ShippingZone }[] = [
  { name: "New Zealand", zone: "domestic" },
  { name: "Australia", zone: "australia_pacific" },
  { name: "United States of America", zone: "rest_of_world" },
  { name: "United Kingdom", zone: "rest_of_world" },
  { name: "Canada", zone: "rest_of_world" },
];

const REST_OF_COUNTRIES: { name: string; zone: ShippingZone }[] = [
  // Pacific countries (excluding Australia already in popular)
  ...AUSTRALIA_PACIFIC_COUNTRIES.filter((c) => c !== "Australia")
    .sort()
    .map((c) => ({ name: c, zone: "australia_pacific" as ShippingZone })),
  // Rest of world (alphabetical)
  ...[
    "Brazil",
    "China",
    "France",
    "Germany",
    "Hong Kong",
    "India",
    "Indonesia",
    "Ireland",
    "Italy",
    "Japan",
    "Malaysia",
    "Netherlands",
    "Philippines",
    "Singapore",
    "South Korea",
    "Spain",
    "Sweden",
    "Switzerland",
    "Taiwan",
    "Thailand",
    "United Arab Emirates",
    "Vietnam",
  ]
    .sort()
    .map((c) => ({ name: c, zone: "rest_of_world" as ShippingZone })),
  // Catch-all
  { name: "Other Country", zone: "rest_of_world" },
];

export const COUNTRIES = [...POPULAR_COUNTRIES, ...REST_OF_COUNTRIES];
export const POPULAR_COUNTRY_NAMES = POPULAR_COUNTRIES.map((c) => c.name);

function getZone(country: string): ShippingZone {
  const match = COUNTRIES.find(
    (c) => c.name.toLowerCase() === country.trim().toLowerCase(),
  );
  return match?.zone ?? "rest_of_world";
}

export function getShippingRate(
  country: string,
  method: "shipping" | "pickup",
): number {
  if (method === "pickup") return 0;
  if (!country || country.trim() === "") return 0;

  const zone = getZone(country);
  return ZONE_RATES[zone];
}

export function getShippingLabel(
  country: string,
  method: "shipping" | "pickup",
): string {
  if (method === "pickup") return "Free (Pickup)";
  if (!country || country.trim() === "") return "Enter country";

  const zone = getZone(country);
  const rate = ZONE_RATES[zone];

  switch (zone) {
    case "domestic":
      return `$${rate.toFixed(2)} — NZ Tracked (3-5 days)`;
    case "australia_pacific":
      return `$${rate.toFixed(2)} — International Tracked (3-10 days)`;
    case "rest_of_world":
      return `$${rate.toFixed(2)} — International Tracked (3-10 days)`;
  }
}
