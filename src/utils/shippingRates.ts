// Client-safe shipping rate utilities (no server imports).
// This is the single source of truth for how a destination + cart resolves to a
// shipping cost; the server price-validation path delegates here too.

import { formatPrice } from "@/utils/currency";

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

// Orders whose item subtotal (before shipping, in USD) reaches this amount
// ship free to any destination.
export const FREE_SHIPPING_THRESHOLD = 100;

export function qualifiesForFreeShipping(subtotal: number): boolean {
  return subtotal >= FREE_SHIPPING_THRESHOLD;
}

function findZone(
  country: string,
  zones: ShippingZone[],
  countries: ShippingCountry[],
): ShippingZone | undefined {
  const match = countries.find(
    (c) => c.name.toLowerCase() === country.trim().toLowerCase(),
  );
  // No catch-all zone: a country we don't explicitly list is not serviceable.
  return match ? zones.find((z) => z.id === match.zone_id) : undefined;
}

// A destination is serviceable only if it maps to a known shipping zone.
export function isServiceableCountry(
  country: string,
  zones: ShippingZone[],
  countries: ShippingCountry[],
): boolean {
  return !!findZone(country, zones, countries);
}

export function getShippingRateFromData(
  country: string,
  method: "shipping" | "pickup",
  zones: ShippingZone[],
  countries: ShippingCountry[],
  subtotal = 0,
): number {
  if (method === "pickup") return 0;
  if (qualifiesForFreeShipping(subtotal)) return 0;
  if (!country || country.trim() === "") return 0;

  const zone = findZone(country, zones, countries);
  return zone ? Number(zone.rate) : 0;
}

export function getShippingLabelFromData(
  country: string,
  method: "shipping" | "pickup",
  zones: ShippingZone[],
  countries: ShippingCountry[],
  subtotal = 0,
): string {
  if (method === "pickup") return "Free (Pickup)";
  if (qualifiesForFreeShipping(subtotal))
    return "Free shipping on orders over $100 USD";
  if (!country || country.trim() === "") return "Enter country";

  const zone = findZone(country, zones, countries);
  if (!zone) return "Enter country";
  return `${formatPrice(zone.rate)} | ${zone.label}`;
}
