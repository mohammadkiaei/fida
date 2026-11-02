/** Compress a browser image into a JPEG no larger than maxBytes. */
export async function compressImage(file, maxBytes) {
  if (!file.type.startsWith("image/")) return file;
  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("IMAGE_DECODE_FAILED");
  }
  try {
    let scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
    for (let resizeAttempt = 0; resizeAttempt < 8; resizeAttempt += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("IMAGE_CANVAS_FAILED");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.86, 0.72, 0.58, 0.44, 0.3, 0.18]) {
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
        if (blob && blob.size <= maxBytes) {
          const name = `${file.name.replace(/\.[^.]+$/, "") || "image"}.jpg`;
          return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
        }
      }
      scale *= 0.75;
    }
  } finally {
    bitmap.close?.();
  }
  throw new Error("IMAGE_TOO_LARGE");
}
