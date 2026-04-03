"use client";

import { useCallback, useRef, useState } from "react";
import Canvas, { CanvasHandle } from "./components/Canvas";
import DownloadButton from "./components/DownloadButton";
import FilterPanel from "./components/FilterPanel";
import Slider from "./components/Slider";
import UploadZone from "./components/UploadZone";
import { FilterName } from "./lib/filterTypes";

export default function Home() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterName>("original");
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(1.0);
  const canvasRef = useRef<CanvasHandle>(null);

  const handleImage = useCallback((img: HTMLImageElement) => {
    setImage(img);
    setActiveFilter("original");
    setBrightness(0);
    setContrast(1.0);
  }, []);

  const handleFilterSelect = useCallback(
    (name: FilterName) => {
      setActiveFilter(name);
      if (name === "brightness-contrast") {
        canvasRef.current?.applyFilter(name, { brightness, contrast });
      } else {
        canvasRef.current?.applyFilter(name);
      }
    },
    [brightness, contrast]
  );

  const handleSliderChange = useCallback(
    (b: number, c: number) => {
      setBrightness(b);
      setContrast(c);
      canvasRef.current?.applyFilter("brightness-contrast", {
        brightness: b,
        contrast: c,
      });
    },
    []
  );

  if (!image) {
    return <UploadZone onImage={handleImage} />;
  }

  return (
    <div className="min-h-screen bg-dark-primary flex flex-col">
      {/* Header */}
      <header className="bg-surface-card border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white tracking-tight">
          Image Filter App
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setImage(null);
              setActiveFilter("original");
            }}
            className="text-sm text-gray-text hover:text-white transition-colors focus:outline-none focus-visible:underline"
          >
            Upload new image
          </button>
          <DownloadButton getCanvas={() => canvasRef.current?.getCanvas() ?? null} />
        </div>
      </header>

      {/* Canvas */}
      <main className="flex-1 flex items-center justify-center p-6">
        <Canvas ref={canvasRef} image={image} />
      </main>

      {/* Controls */}
      <div className="px-6 pb-6 flex flex-col gap-3">
        {activeFilter === "brightness-contrast" && (
          <Slider
            brightness={brightness}
            contrast={contrast}
            onChange={handleSliderChange}
          />
        )}
        <FilterPanel active={activeFilter} onSelect={handleFilterSelect} />
      </div>
    </div>
  );
}
