// Client-side photo processing: compress the original and produce a tight,
// content-aware square crop that reads as a sticker-style food cutout.

export type ProcessedPhoto = {
  original: string;
  processed: string;
  /** Tiny 240px variant for list views — keeps grids cheap at scale. */
  thumbnail: string;
  /** False when the sticker crop failed and the original photo was kept. */
  cutout: boolean;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Couldn't read this photo."));
    img.src = src;
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Couldn't read this photo."));
    reader.readAsDataURL(file);
  });
}

function drawToDataUrl(
  img: HTMLImageElement,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  size: number,
  quality = 0.86,
): string {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = Math.round((sh / sw) * size);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

/**
 * Finds the most "interesting" square window of the photo using a coarse
 * saturation + contrast score, which reliably centres on plated food.
 */
function findSubjectSquare(img: HTMLImageElement) {
  const side = Math.min(img.width, img.height);
  const grid = 24;
  const canvas = document.createElement("canvas");
  canvas.width = grid;
  canvas.height = grid;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { x: (img.width - side) / 2, y: (img.height - side) / 2, side };
  ctx.drawImage(img, 0, 0, grid, grid);
  const { data } = ctx.getImageData(0, 0, grid, grid);

  const score = (gx: number, gy: number) => {
    const i = (gy * grid + gx) * 4;
    const r = (data[i] ?? 0) / 255;
    const g = (data[i + 1] ?? 0) / 255;
    const b = (data[i + 2] ?? 0) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    const warm = Math.max(0, r - b);
    return sat * 1.6 + warm * 0.8 + (1 - Math.abs(0.55 - max)) * 0.4;
  };

  let sumX = 0;
  let sumY = 0;
  let total = 0;
  for (let gy = 0; gy < grid; gy++) {
    for (let gx = 0; gx < grid; gx++) {
      const s = score(gx, gy);
      sumX += s * (gx + 0.5);
      sumY += s * (gy + 0.5);
      total += s;
    }
  }
  const cx = total > 0 ? (sumX / total / grid) * img.width : img.width / 2;
  const cy = total > 0 ? (sumY / total / grid) * img.height : img.height / 2;

  // Bias gently toward the geometric centre so crops stay natural.
  const bx = cx * 0.65 + (img.width / 2) * 0.35;
  const by = cy * 0.65 + (img.height / 2) * 0.35;

  const x = Math.min(Math.max(bx - side / 2, 0), img.width - side);
  const y = Math.min(Math.max(by - side / 2, 0), img.height - side);
  return { x, y, side };
}

export async function processPhoto(file: File): Promise<ProcessedPhoto> {
  const dataUrl = await fileToDataUrl(file);

  let img: HTMLImageElement;
  try {
    img = await loadImage(dataUrl);
  } catch {
    // The file can't be decoded as an image — surface the PRD upload error.
    throw new Error("Couldn't upload this photo. Try again.");
  }

  const maxOriginal = 1280;
  const scale = Math.min(1, maxOriginal / Math.max(img.width, img.height));
  const original = drawToDataUrl(
    img,
    0,
    0,
    img.width,
    img.height,
    Math.round(img.width * scale),
    0.82,
  );

  try {
    const { x, y, side } = findSubjectSquare(img);
    // Tighten slightly on the subject for the sticker crop.
    const inset = side * 0.05;
    const cropX = x + inset;
    const cropY = y + inset;
    const cropSide = side - inset * 2;
    const processed = drawToDataUrl(img, cropX, cropY, cropSide, cropSide, 720, 0.88);
    // 240px thumbnail from the same framing — list views never need more
    // (96px stickers at 2x DPR = 192px), and it cuts grid bandwidth ~90%.
    const thumbnail = drawToDataUrl(img, cropX, cropY, cropSide, cropSide, 240, 0.78);
    return { original, processed, thumbnail, cutout: true };
  } catch {
    // Never block saving because the cutout failed — keep the original photo.
    const side = Math.min(img.width, img.height);
    const thumbnail = drawToDataUrl(
      img,
      (img.width - side) / 2,
      (img.height - side) / 2,
      side,
      side,
      240,
      0.78,
    );
    return { original, processed: original, thumbnail, cutout: false };
  }
}
