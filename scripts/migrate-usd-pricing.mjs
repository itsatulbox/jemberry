/**
 * One-time migration: set USD prices and shipping rates.
 *
 * Run from the project root with env loaded:
 *   node --env-file=.env scripts/migrate-usd-pricing.mjs            # apply
 *   node --env-file=.env scripts/migrate-usd-pricing.mjs --dry-run  # preview only
 *
 * Matches by slug / variant name / zone name, so it's safe to re-run: rows
 * already at the target value are left untouched.
 *
 * Source of truth (jem's pricing sheet, all USD):
 *   - studio ghibli charms: totoro variants $40, all other variants $35
 *   - sanrio charms: $30
 *   - add-ons unchanged (silver keychain +$2, phone strap +$0)
 *   - shipping: NZ $0, Australia $0, USA $9, Americas (excl. USA) $6,
 *               Europe $6, South Pacific $4, Asia $5
 */
import { createClient } from "@supabase/supabase-js";

const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing env: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const DRY_RUN = process.argv.includes("--dry-run");
const supabase = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
);

// Base product price (the "from" price shown on listings).
const PRODUCT_BASE_PRICE = {
  "studio-ghibli-charms": 35,
  "sanrio-charms": 30,
};

// Per-product variant pricing rule.
const variantPriceFor = {
  "studio-ghibli-charms": (name) =>
    name.toLowerCase().includes("totoro") ? 40 : 35,
  "sanrio-charms": () => 30,
};

// Shipping rate by zone name (trimmed).
const ZONE_RATES = {
  Domestic: 0,
  Australia: 0,
  "United States of America": 9,
  "Americas (excl. USA)": 6,
  Europe: 6,
  "South Pacific": 4,
  Asia: 5,
};

let changes = 0;

async function setValue(table, id, column, current, next, describe) {
  const cur = Number(current);
  if (cur === next) return;
  changes++;
  console.log(`  ${describe}: ${cur} -> ${next}`);
  if (DRY_RUN) return;
  const { error } = await supabase
    .from(table)
    .update({ [column]: next })
    .eq("id", id);
  if (error) console.error(`    ! update failed: ${error.message}`);
}

console.log(`USD pricing migration${DRY_RUN ? " (dry run)" : ""}\n`);

// --- Products + variants ---
const { data: products, error: pErr } = await supabase
  .from("products")
  .select("id, slug, name, price");
if (pErr) {
  console.error("Failed to load products:", pErr.message);
  process.exit(1);
}

for (const p of products) {
  const base = PRODUCT_BASE_PRICE[p.slug];
  if (base === undefined) {
    console.log(`product "${p.slug}": not in migration, skipping`);
    continue;
  }
  console.log(`product "${p.slug}"`);
  await setValue("products", p.id, "price", p.price, base, "  base price");

  const { data: variants, error: vErr } = await supabase
    .from("product_variants")
    .select("id, name, price")
    .eq("product_id", p.id);
  if (vErr) {
    console.error(`  ! failed to load variants: ${vErr.message}`);
    continue;
  }
  const priceRule = variantPriceFor[p.slug];
  for (const v of variants) {
    await setValue(
      "product_variants",
      v.id,
      "price",
      v.price,
      priceRule(v.name),
      `  variant "${v.name}"`,
    );
  }
}

// --- Shipping zones ---
console.log("\nshipping zones");
const { data: zones, error: zErr } = await supabase
  .from("shipping_zones")
  .select("id, name, rate");
if (zErr) {
  console.error("Failed to load zones:", zErr.message);
  process.exit(1);
}

for (const z of zones) {
  const cleanName = z.name.trim();
  const target = ZONE_RATES[cleanName];
  if (target === undefined) {
    console.log(`  zone "${cleanName}": no target rate, skipping`);
    continue;
  }
  // Repair stray whitespace/newlines in the stored name.
  if (cleanName !== z.name) {
    console.log(`  zone name "${JSON.stringify(z.name)}" -> "${cleanName}"`);
    if (!DRY_RUN) {
      await supabase
        .from("shipping_zones")
        .update({ name: cleanName })
        .eq("id", z.id);
    }
    changes++;
  }
  await setValue(
    "shipping_zones",
    z.id,
    "rate",
    z.rate,
    target,
    `  zone "${cleanName}" rate`,
  );
}

console.log(
  `\n${DRY_RUN ? "Would change" : "Changed"} ${changes} value(s).${DRY_RUN ? " Re-run without --dry-run to apply." : " Done."}`,
);
