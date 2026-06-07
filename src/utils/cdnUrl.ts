export type ImageSize = "thumb" | "md" | "full";

const R2_BASE = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "").replace(/\/$/, "");
const SUPABASE_STORAGE_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/`;

/**
 * Resolve a stored image URL to the URL for a given display size.
 *
 * New images live in Cloudflare R2 as `.../products/<id>/{thumb,md,full}.webp`
 * and are stored in the DB as the `full.webp` URL — we just swap the filename.
 * Legacy Supabase images (pre-migration) keep flowing through the old proxy.
 */
export function imgUrl(
  url: string | null | undefined,
  size: ImageSize = "md",
): string {
  if (!url) return "/placeholder.jpg";

  if (R2_BASE && url.startsWith(R2_BASE)) {
    return url.replace(/\/(thumb|md|full)\.webp$/, `/${size}.webp`);
  }

  // Legacy Supabase Storage URLs — serve via the existing proxy until migrated.
  if (url.startsWith(SUPABASE_STORAGE_PREFIX)) {
    return `/cdn/${url.slice(SUPABASE_STORAGE_PREFIX.length)}`;
  }

  return url;
}
