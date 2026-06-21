/**
 * One-time migration: convert the CMS pages (Supabase `pages` table) from NZD to
 * USD copy, apply the new shipping rates / free-shipping policy, and drop the
 * Africa shipping row (no tracked option there).
 *
 * Run from the project root with env loaded:
 *   node --env-file=.env scripts/migrate-cms-usd-copy.mjs --dry-run  # preview
 *   node --env-file=.env scripts/migrate-cms-usd-copy.mjs            # apply
 *
 * Each edit asserts its target substring occurs exactly once before replacing,
 * so a re-run (or drifted content) aborts that page instead of corrupting it.
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

const FREE_SHIPPING_NOTE =
  '<p><span style="font-size: 11pt;"><strong>Free shipping on all orders over $100 USD ♡</strong></span></p>';

// Per-page edits. Each entry: [find, replace]. find must appear exactly once.
const EDITS = {
  "comissions-faq": [
    ["Small charm (2-3cm): 60NZD", "Small charm (2-3cm): $35 USD"],
    ["Large charm (3-4cm): 70NZD", "Large charm (3-4cm): $40 USD"],
    ["Desk cuties: 70NZD", "Desk cuties: $40 USD"],
    ["Hair stick barrettes: 70NZD", "Hair stick barrettes: $40 USD"],
    ["Keycaps: 60NZD", "Keycaps: $35 USD"],
  ],
  "shop-policies": [
    // Expedite fee (was 10NZD; estimated USD, confirm with jem).
    ["additional fee of 10NZD per item", "additional fee of $6 USD per item"],
    // Domestic + Australia now free.
    [
      "NZ Post tracked shipping: <strong>8NZD</strong>",
      "NZ Post tracked shipping: <strong>FREE</strong>",
    ],
    ["Australia: <strong>20NZD</strong>", "Australia: <strong>FREE</strong>"],
    // International flat USD rates.
    [
      "United States of America: <strong>35NZD</strong>",
      "United States of America: <strong>$9 USD</strong>",
    ],
    [
      'Americas (excl. USA): <span style="font-size: 11pt;"><strong>28NZD</strong>',
      'Americas (excl. USA): <span style="font-size: 11pt;"><strong>$6 USD</strong>',
    ],
    ["Europe: <strong>28NZD</strong>", "Europe: <strong>$6 USD</strong>"],
    [
      "South Pacific: <strong>20NZD</strong>",
      "South Pacific: <strong>$4 USD</strong>",
    ],
    ["Asia: <strong>25NZD</strong>", "Asia: <strong>$5 USD</strong>"],
    // Drop Africa entirely (no tracked option).
    [
      '<li><p><span style="font-size: 11pt;">Africa: <strong>28NZD</strong> (6-13 business days)</span></p></li>',
      "",
    ],
    // Announce free shipping right under the "shipping rates" heading.
    [
      "<strong>˚࿔ shipping rates</strong></span></p>",
      `<strong>˚࿔ shipping rates</strong></span></p>${FREE_SHIPPING_NOTE}`,
    ],
  ],
};

let totalChanges = 0;

for (const [slug, edits] of Object.entries(EDITS)) {
  const { data, error } = await supabase
    .from("pages")
    .select("content")
    .eq("slug", slug)
    .single();
  if (error || !data) {
    console.error(`page "${slug}": load failed — ${error?.message}`);
    continue;
  }

  let content = data.content || "";
  let pageChanges = 0;
  let aborted = false;

  for (const [find, replace] of edits) {
    const count = content.split(find).length - 1;
    if (count !== 1) {
      console.error(
        `page "${slug}": expected exactly 1 match for ${JSON.stringify(find.slice(0, 50))}..., found ${count} — skipping this edit`,
      );
      if (count === 0) continue; // likely already applied
      aborted = true;
      break;
    }
    content = content.replace(find, replace);
    pageChanges++;
    console.log(`page "${slug}": ${JSON.stringify(find.slice(0, 60))} -> ok`);
  }

  if (aborted) {
    console.error(`page "${slug}": aborted, no write.`);
    continue;
  }
  if (pageChanges === 0) {
    console.log(`page "${slug}": nothing to change.`);
    continue;
  }

  totalChanges += pageChanges;
  if (!DRY_RUN) {
    const { error: upErr } = await supabase
      .from("pages")
      .update({ content })
      .eq("slug", slug);
    if (upErr) console.error(`page "${slug}": update failed — ${upErr.message}`);
    else console.log(`page "${slug}": updated (${pageChanges} edits).`);
  }
}

console.log(
  `\n${DRY_RUN ? "Would apply" : "Applied"} ${totalChanges} edit(s).${DRY_RUN ? " Re-run without --dry-run to apply." : ""}`,
);
