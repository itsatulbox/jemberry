// Single source of truth for the shop's currency.
//
// The store prices, displays, and charges in USD. Stripe settles to the
// seller's payout currency automatically, so no in-app FX conversion is needed.

export const CURRENCY_CODE = "USD";
export const CURRENCY_SYMBOL = "$";

// Lowercase ISO code Stripe expects in price_data.currency.
export const STRIPE_CURRENCY = "usd";

/** "$52.00" — bare amount, for line items and per-unit prices. */
export function formatPrice(amount: number): string {
  return `${CURRENCY_SYMBOL}${Number(amount).toFixed(2)}`;
}

/** "$52.00 USD" — amount with code, for totals and standalone figures. */
export function formatMoney(amount: number): string {
  return `${formatPrice(amount)} ${CURRENCY_CODE}`;
}
