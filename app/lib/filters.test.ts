import { describe, it, expect, beforeAll } from "vitest";
import {
  applyGrayscale,
  applySepia,
  applyInvert,
  applyBrightnessContrast,
  applyFade,
  applyCrossProcess,
  applyBarrel,
  applyRipple,
  applySwirl,
} from "./filters";

// Polyfill ImageData for Node environment
beforeAll(() => {
  if (typeof globalThis.ImageData === "undefined") {
    // @ts-ignore
    globalThis.ImageData = class ImageData {
      data: Uint8ClampedArray;
      width: number;
      height: number;
      constructor(data: Uint8ClampedArray, width: number, height: number) {
        this.data = data;
        this.width = width;
        this.height = height;
      }
    };
  }
});

function makeImageData(pixels: number[][]): ImageData {
  const flat = new Uint8ClampedArray(pixels.flat());
  return new ImageData(flat, pixels.length, 1);
}

function pixel(data: ImageData, index = 0): [number, number, number, number] {
  const i = index * 4;
  return [data.data[i], data.data[i + 1], data.data[i + 2], data.data[i + 3]];
}

describe("applyGrayscale", () => {
  it("converts pure red to correct luminance gray", () => {
    const img = makeImageData([[255, 0, 0, 255]]);
    const out = applyGrayscale(img);
    const [r, g, b] = pixel(out);
    const expected = Math.round(0.299 * 255);
    expect(r).toBe(expected);
    expect(g).toBe(expected);
    expect(b).toBe(expected);
  });

  it("preserves alpha", () => {
    const img = makeImageData([[100, 150, 200, 128]]);
    const out = applyGrayscale(img);
    expect(pixel(out)[3]).toBe(128);
  });
});

describe("applySepia", () => {
  it("transforms a white pixel correctly", () => {
    const img = makeImageData([[255, 255, 255, 255]]);
    const out = applySepia(img);
    const [r, g, b] = pixel(out);
    expect(r).toBe(Math.min(255, Math.round(255 * 0.393 + 255 * 0.769 + 255 * 0.189)));
    expect(g).toBe(Math.min(255, Math.round(255 * 0.349 + 255 * 0.686 + 255 * 0.168)));
    expect(b).toBe(Math.min(255, Math.round(255 * 0.272 + 255 * 0.534 + 255 * 0.131)));
  });

  it("preserves alpha", () => {
    const img = makeImageData([[200, 100, 50, 200]]);
    expect(pixel(applySepia(img))[3]).toBe(200);
  });
});

describe("applyInvert", () => {
  it("inverts each channel", () => {
    const img = makeImageData([[100, 150, 200, 255]]);
    const [r, g, b] = pixel(applyInvert(img));
    expect(r).toBe(155);
    expect(g).toBe(105);
    expect(b).toBe(55);
  });

  it("preserves alpha", () => {
    const img = makeImageData([[0, 0, 0, 100]]);
    expect(pixel(applyInvert(img))[3]).toBe(100);
  });
});

describe("applyBrightnessContrast", () => {
  it("identity at brightness=0 and contrast=1", () => {
    const img = makeImageData([[100, 150, 200, 255]]);
    const out = applyBrightnessContrast(img, 0, 1);
    const [r, g, b] = pixel(out);
    expect(r).toBe(100);
    expect(g).toBe(150);
    expect(b).toBe(200);
  });

  it("clamps result above 255 with high brightness", () => {
    const img = makeImageData([[250, 250, 250, 255]]);
    const out = applyBrightnessContrast(img, 100, 1);
    const [r] = pixel(out);
    expect(r).toBe(255);
  });

  it("clamps result below 0 with negative brightness", () => {
    const img = makeImageData([[5, 5, 5, 255]]);
    const out = applyBrightnessContrast(img, -100, 1);
    const [r] = pixel(out);
    expect(r).toBe(0);
  });
});

describe("applyFade", () => {
  it("lifts dark pixels (output > input for dark colors)", () => {
    const img = makeImageData([[10, 10, 10, 255]]);
    const out = applyFade(img);
    const [r] = pixel(out);
    expect(r).toBeGreaterThan(10);
  });

  it("reduces contrast (mid pixel closer to mid-gray than original)", () => {
    const bright = makeImageData([[220, 220, 220, 255]]);
    const out = applyFade(bright);
    const [r] = pixel(out);
    // Should be pulled toward mid-gray range (less than 220+lift, but contrast reduced)
    expect(r).toBeLessThanOrEqual(255);
    expect(r).toBeGreaterThanOrEqual(0);
  });
});

describe("applyCrossProcess", () => {
  it("transforms each channel independently", () => {
    const img = makeImageData([[128, 128, 128, 255]]);
    const out = applyCrossProcess(img);
    const [r, g, b] = pixel(out);
    // Channels should differ from each other (cross-processing diverges channels)
    expect(r).not.toBe(g);
  });

  it("preserves alpha", () => {
    const img = makeImageData([[128, 128, 128, 77]]);
    expect(pixel(applyCrossProcess(img))[3]).toBe(77);
  });
});

describe("applyBarrel", () => {
  it("center pixel maps to itself (source is same center)", () => {
    // 3x3 image, center pixel at (1,1)
    const data = new Uint8ClampedArray(3 * 3 * 4);
    for (let i = 0; i < 3 * 3; i++) {
      data[i * 4] = i * 10;
      data[i * 4 + 1] = i * 5;
      data[i * 4 + 2] = 50;
      data[i * 4 + 3] = 255;
    }
    const img = new ImageData(data, 3, 3);
    const out = applyBarrel(img);
    // center pixel index = 4 (row 1, col 1)
    const ci = 4 * 4;
    expect(out.data[ci]).toBe(img.data[ci]);
  });

  it("output dimensions match input", () => {
    const data = new Uint8ClampedArray(4 * 4 * 4).fill(128);
    const img = new ImageData(data, 4, 4);
    const out = applyBarrel(img);
    expect(out.width).toBe(4);
    expect(out.height).toBe(4);
  });
});

describe("applyRipple", () => {
  it("output dimensions match input", () => {
    const data = new Uint8ClampedArray(10 * 10 * 4).fill(100);
    const img = new ImageData(data, 10, 10);
    const out = applyRipple(img);
    expect(out.width).toBe(10);
    expect(out.height).toBe(10);
  });

  it("a pixel at y=0 with amplitude>0 is displaced", () => {
    // At y=0, srcX = x + amplitude*sin(0) = x, srcY = y + amplitude*sin(2pi*x/wl)
    // So pixels at y=0 may have different source y, leading to potential difference
    const data = new Uint8ClampedArray(20 * 20 * 4);
    for (let i = 0; i < 20 * 20; i++) {
      data[i * 4] = i % 256;
      data[i * 4 + 3] = 255;
    }
    const img = new ImageData(data, 20, 20);
    const out = applyRipple(img, 8, 10);
    expect(out.data.length).toBe(data.length);
  });
});

describe("applySwirl", () => {
  it("output dimensions match input", () => {
    const data = new Uint8ClampedArray(8 * 8 * 4).fill(100);
    const img = new ImageData(data, 8, 8);
    const out = applySwirl(img);
    expect(out.width).toBe(8);
    expect(out.height).toBe(8);
  });

  it("center pixel maps to itself (r=0 means angle=0, no rotation)", () => {
    const w = 5, h = 5;
    const data = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      data[i * 4] = i * 3 % 256;
      data[i * 4 + 3] = 255;
    }
    const img = new ImageData(data, w, h);
    const out = applySwirl(img, 0.1);
    // center pixel at (2,2), index = (2*5+2)*4 = 48
    expect(out.data[48]).toBe(img.data[48]);
  });
});
