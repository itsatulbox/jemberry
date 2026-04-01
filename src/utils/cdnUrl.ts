const STORAGE_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/`;

export function cdnUrl(url: string): string {
  if (url.startsWith(STORAGE_PREFIX)) {
    return `/cdn/${url.slice(STORAGE_PREFIX.length)}`;
  }
  return url;
}
