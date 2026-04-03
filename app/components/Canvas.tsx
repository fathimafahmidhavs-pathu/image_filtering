"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { applyFilter } from "../lib/filters";
import { FilterName, FilterOptions } from "../lib/filterTypes";

const MAX_DISPLAY = 900;

export interface CanvasHandle {
  applyFilter: (name: FilterName, options?: FilterOptions) => void;
  getCanvas: () => HTMLCanvasElement | null;
}

interface Props {
  image: HTMLImageElement;
}

const Canvas = forwardRef<CanvasHandle, Props>(function Canvas({ image }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalDataRef = useRef<ImageData | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scale = Math.min(1, MAX_DISPLAY / Math.max(image.naturalWidth, image.naturalHeight));
    const w = Math.round(image.naturalWidth * scale);
    const h = Math.round(image.naturalHeight * scale);
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(image, 0, 0, w, h);
    originalDataRef.current = ctx.getImageData(0, 0, w, h);
  }, [image]);

  useImperativeHandle(ref, () => ({
    applyFilter(name: FilterName, options?: FilterOptions) {
      const canvas = canvasRef.current;
      const original = originalDataRef.current;
      if (!canvas || !original) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const copy = new ImageData(
        new Uint8ClampedArray(original.data),
        original.width,
        original.height
      );
      const result = applyFilter(copy, name, options);
      ctx.putImageData(result, 0, 0);
    },
    getCanvas() {
      return canvasRef.current;
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      className="max-w-full rounded-lg shadow-2xl"
    />
  );
});

export default Canvas;
