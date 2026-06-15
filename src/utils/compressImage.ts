import imageCompression from "browser-image-compression";
import type { ImageSize } from "@/utils/imageUrl";

// Longest-edge cap (px) and quality per variant.
//   thumb/md  -> small display contexts (cart, grid); kept light for fast pages.
//   full      -> the product hero image; tuned for visually-lossless quality.
// Because R2 egress is free, `full` is deliberately high quality: a large cap
// and q92 so the main image is indistinguishable from the original. The maxMB
// values are loose ceilings so QUALITY drives the encode, not the size budget.
const VARIANTS: Record<ImageSize, { maxPx: number; maxMB: number; quality: number }> = {
  thumb: { maxPx: 320, maxMB: 0.3, quality: 0.82 },
  md: { maxPx: 1000, maxMB: 0.8, quality: 0.84 },
  full: { maxPx: 3000, maxMB: 8, quality: 0.92 },
};

export async function compressVariants(
  file: File,
): Promise<Record<ImageSize, File>> {
  const entries = await Promise.all(
    (Object.keys(VARIANTS) as ImageSize[]).map(async (size) => {
      const { maxPx, maxMB, quality } = VARIANTS[size];
      const blob = await imageCompression(file, {
        maxSizeMB: maxMB,
        maxWidthOrHeight: maxPx,
        initialQuality: quality,
        useWebWorker: true,
        fileType: "image/webp",
      });
      return [
        size,
        new File([blob], `${size}.webp`, { type: "image/webp" }),
      ] as const;
    }),
  );

  return Object.fromEntries(entries) as Record<ImageSize, File>;
}
