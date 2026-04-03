import { FilterName, FilterOptions } from "./filterTypes";

function clamp(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function getPixel(data: Uint8ClampedArray, x: number, y: number, width: number, height: number): [number, number, number, number] {
  const cx = Math.max(0, Math.min(width - 1, Math.round(x)));
  const cy = Math.max(0, Math.min(height - 1, Math.round(y)));
  const i = (cy * width + cx) * 4;
  return [data[i], data[i + 1], data[i + 2], data[i + 3]];
}

export function applyGrayscale(imageData: ImageData): ImageData {
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);
  for (let i = 0; i < src.length; i += 4) {
    const v = clamp(0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2]);
    out[i] = v;
    out[i + 1] = v;
    out[i + 2] = v;
    out[i + 3] = src[i + 3];
  }
  return new ImageData(out, imageData.width, imageData.height);
}

export function applySepia(imageData: ImageData): ImageData {
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);
  for (let i = 0; i < src.length; i += 4) {
    const r = src[i], g = src[i + 1], b = src[i + 2];
    out[i]     = clamp(r * 0.393 + g * 0.769 + b * 0.189);
    out[i + 1] = clamp(r * 0.349 + g * 0.686 + b * 0.168);
    out[i + 2] = clamp(r * 0.272 + g * 0.534 + b * 0.131);
    out[i + 3] = src[i + 3];
  }
  return new ImageData(out, imageData.width, imageData.height);
}

export function applyInvert(imageData: ImageData): ImageData {
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);
  for (let i = 0; i < src.length; i += 4) {
    out[i]     = 255 - src[i];
    out[i + 1] = 255 - src[i + 1];
    out[i + 2] = 255 - src[i + 2];
    out[i + 3] = src[i + 3];
  }
  return new ImageData(out, imageData.width, imageData.height);
}

export function applyBrightnessContrast(
  imageData: ImageData,
  brightness: number,
  contrast: number
): ImageData {
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);
  for (let i = 0; i < src.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      let v = src[i + c];
      v = (v - 128) * contrast + 128;
      v = v + brightness;
      out[i + c] = clamp(v);
    }
    out[i + 3] = src[i + 3];
  }
  return new ImageData(out, imageData.width, imageData.height);
}

export function applyFade(imageData: ImageData): ImageData {
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);
  const contrastFactor = 0.75;
  const lift = 30;
  for (let i = 0; i < src.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      let v = src[i + c];
      v = (v - 128) * contrastFactor + 128 + lift;
      out[i + c] = clamp(v);
    }
    out[i + 3] = src[i + 3];
  }
  return new ImageData(out, imageData.width, imageData.height);
}

export function applyCrossProcess(imageData: ImageData): ImageData {
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);

  // Build tone curve LUTs for each channel
  const rLUT = new Uint8Array(256);
  const gLUT = new Uint8Array(256);
  const bLUT = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    // Red: boost in shadows (lift dark), clip highlights slightly
    rLUT[i] = clamp(i + 40 * Math.sin(Math.PI * t) - 10 * t);
    // Green: suppress mid-tones slightly
    gLUT[i] = clamp(i - 30 * Math.sin(Math.PI * t));
    // Blue: boost mid-tones, suppress shadows
    bLUT[i] = clamp(i + 50 * Math.sin(Math.PI * t) * (1 - t));
  }

  for (let i = 0; i < src.length; i += 4) {
    out[i]     = rLUT[src[i]];
    out[i + 1] = gLUT[src[i + 1]];
    out[i + 2] = bLUT[src[i + 2]];
    out[i + 3] = src[i + 3];
  }
  return new ImageData(out, imageData.width, imageData.height);
}

export function applyBarrel(imageData: ImageData, k = 0.3): ImageData {
  const { width, height } = imageData;
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.sqrt(cx * cx + cy * cy);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = (x - cx) / maxR;
      const ny = (y - cy) / maxR;
      const r2 = nx * nx + ny * ny;
      const scale = 1 + k * r2;
      const srcX = nx * scale * maxR + cx;
      const srcY = ny * scale * maxR + cy;

      const di = (y * width + x) * 4;
      if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
        const [r, g, b, a] = getPixel(src, srcX, srcY, width, height);
        out[di] = r; out[di + 1] = g; out[di + 2] = b; out[di + 3] = a;
      } else {
        out[di] = 0; out[di + 1] = 0; out[di + 2] = 0; out[di + 3] = 255;
      }
    }
  }
  return new ImageData(out, width, height);
}

export function applyRipple(
  imageData: ImageData,
  amplitude = 8,
  wavelength = 40
): ImageData {
  const { width, height } = imageData;
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcX = x + amplitude * Math.sin((2 * Math.PI * y) / wavelength);
      const srcY = y + amplitude * Math.sin((2 * Math.PI * x) / wavelength);
      const di = (y * width + x) * 4;
      const [r, g, b, a] = getPixel(src, srcX, srcY, width, height);
      out[di] = r; out[di + 1] = g; out[di + 2] = b; out[di + 3] = a;
    }
  }
  return new ImageData(out, width, height);
}

export function applySwirl(imageData: ImageData, strength = 0.008): ImageData {
  const { width, height } = imageData;
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);
  const cx = width / 2;
  const cy = height / 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const r = Math.sqrt(dx * dx + dy * dy);
      const angle = strength * r;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const srcX = cos * dx - sin * dy + cx;
      const srcY = sin * dx + cos * dy + cy;

      const di = (y * width + x) * 4;
      const [rv, g, b, a] = getPixel(src, srcX, srcY, width, height);
      out[di] = rv; out[di + 1] = g; out[di + 2] = b; out[di + 3] = a;
    }
  }
  return new ImageData(out, width, height);
}

export function applyFilter(
  imageData: ImageData,
  filter: FilterName,
  options?: FilterOptions
): ImageData {
  switch (filter) {
    case "grayscale":
      return applyGrayscale(imageData);
    case "sepia":
      return applySepia(imageData);
    case "invert":
      return applyInvert(imageData);
    case "brightness-contrast":
      return applyBrightnessContrast(
        imageData,
        options?.brightness ?? 0,
        options?.contrast ?? 1.0
      );
    case "fade":
      return applyFade(imageData);
    case "cross-process":
      return applyCrossProcess(imageData);
    case "barrel":
      return applyBarrel(imageData);
    case "ripple":
      return applyRipple(imageData);
    case "swirl":
      return applySwirl(imageData);
    case "original":
    default:
      return imageData;
  }
}
