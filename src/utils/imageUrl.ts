export type ImageSize = "thumb" | "md" | "full";

const R2_BASE = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "").replace(/\/$/, "");

/**
 * Resolve a stored image URL to the URL for a given display size.
 *
 * R2 images are stored as `.../products/<id>/{thumb,md,full}.webp` (the DB
 * holds the `full.webp` URL); we swap the filename for the requested size.
 * Any other URL (placeholder, historical order snapshots) is returned as-is.
 */
export function imgUrl(
  url: string | null | undefined,
  size: ImageSize = "md",
): string {
  if (!url) return "/placeholder.jpg";

  if (R2_BASE && url.startsWith(R2_BASE)) {
    return url.replace(/\/(thumb|md|full)\.webp$/, `/${size}.webp`);
  }

  return url;
}
