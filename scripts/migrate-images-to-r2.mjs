/**
 * One-time migration: move existing product images from Supabase Storage to
 * Cloudflare R2, generating thumb/md/full WebP variants for each.
 *
 * Run from the project root with env loaded:
 *   node --env-file=.env scripts/migrate-images-to-r2.mjs
 *
 * Safe to re-run: URLs already pointing at R2 are skipped.
 */
import { createClient } from "@supabase/supabase-js";
import { AwsClient } from "aws4fetch";
import sharp from "sharp";
import { randomUUID } from "node:crypto";

const {
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
  NEXT_PUBLIC_R2_PUBLIC_URL,
} = process.env;

const missing = Object.entries({
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
  NEXT_PUBLIC_R2_PUBLIC_URL,
})
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missing.length) {
  console.error("Missing env vars:", missing.join(", "));
  process.exit(1);
}

const supabase = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
);
const r2 = new AwsClient({
  accessKeyId: R2_ACCESS_KEY_ID,
  secretAccessKey: R2_SECRET_ACCESS_KEY,
  region: "auto",
  service: "s3",
});

const endpointBase = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}`;
const publicBase = NEXT_PUBLIC_R2_PUBLIC_URL.replace(/\/$/, "");

// Keep in sync with src/utils/compressImage.ts. `full` is high quality
// (visually lossless) since R2 egress is free — only the hero image is large.
const SIZES = { thumb: 320, md: 1000, full: 3000 };
const QUALITY = { thumb: 82, md: 84, full: 92 };

async function migrateOne(srcUrl) {
  if (!srcUrl || srcUrl.startsWith(publicBase)) return srcUrl; // already on R2

  const resp = await fetch(srcUrl);
  if (!resp.ok) {
    console.warn(`  ! skip (fetch ${resp.status}): ${srcUrl}`);
    return srcUrl;
  }
  const input = Buffer.from(await resp.arrayBuffer());
  const id = randomUUID();

  for (const [size, px] of Object.entries(SIZES)) {
    const out = await sharp(input)
      .rotate()
      .resize(px, px, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: QUALITY[size] })
      .toBuffer();

    const put = await r2.fetch(`${endpointBase}/products/${id}/${size}.webp`, {
      method: "PUT",
      body: out,
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
    if (!put.ok) {
      throw new Error(`R2 PUT failed (${put.status}) for ${id}/${size}`);
    }
  }

  const newUrl = `${publicBase}/products/${id}/full.webp`;
  console.log(`  ✓ ${srcUrl}\n    → ${newUrl}`);
  return newUrl;
}

const { data: products, error } = await supabase
  .from("products")
  .select("id, main_image, images");

if (error) {
  console.error("Failed to load products:", error);
  process.exit(1);
}

console.log(`Migrating images for ${products.length} products...\n`);

for (const p of products) {
  const map = new Map();
  const urls = [p.main_image, ...(p.images || [])].filter(Boolean);
  for (const u of urls) {
    if (!map.has(u)) map.set(u, await migrateOne(u));
  }

  const newMain = p.main_image ? map.get(p.main_image) : p.main_image;
  const newImages = (p.images || []).map((u) => map.get(u) ?? u);

  const changed =
    newMain !== p.main_image ||
    JSON.stringify(newImages) !== JSON.stringify(p.images || []);

  if (!changed) {
    console.log(`product ${p.id}: nothing to migrate`);
    continue;
  }

  const { error: upErr } = await supabase
    .from("products")
    .update({ main_image: newMain, images: newImages })
    .eq("id", p.id);

  if (upErr) console.error(`product ${p.id}: update failed —`, upErr.message);
  else console.log(`product ${p.id}: updated`);
}

console.log("\nDone.");
