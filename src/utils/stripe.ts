// Stripe client, constructed on first use rather than at import.
//
// Building it at module scope breaks `next build` whenever STRIPE_SECRET_KEY
// is absent: collecting page data imports every route, and the Stripe
// constructor throws on a missing key. Deferring it keeps the rest of the shop
// buildable and servable without payment credentials configured.

import Stripe from "stripe";

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    client = new Stripe(key, { apiVersion: "2025-12-15.clover" });
  }
  return client;
}

/** Whether payments are wired up. False on deployments with no Stripe keys. */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
