import imageCompression from "browser-image-compression";

export async function compressImage(file: File): Promise<File> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 5,
    maxWidthOrHeight: 3000,
    initialQuality: 1,
    useWebWorker: true,
    fileType: "image/webp",
  });

  // Ensure the file has a .webp name
  const webpName = file.name.replace(/\.[^.]+$/, ".webp");
  return new File([compressed], webpName, { type: "image/webp" });
}
