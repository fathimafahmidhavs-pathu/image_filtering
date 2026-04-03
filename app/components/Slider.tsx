"use client";

interface Props {
  brightness: number;
  contrast: number;
  onChange: (brightness: number, contrast: number) => void;
}

export default function Slider({ brightness, contrast, onChange }: Props) {
  return (
    <div className="w-full bg-surface-card rounded-xl p-4 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-text flex justify-between">
          <span>Brightness</span>
          <span className="text-white">{brightness > 0 ? `+${brightness}` : brightness}</span>
        </label>
        <input
          type="range"
          min={-100}
          max={100}
          step={1}
          value={brightness}
          onChange={(e) => onChange(Number(e.target.value), contrast)}
          className="w-full h-1.5 rounded-full appearance-none bg-gray-text/20 cursor-pointer"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-text flex justify-between">
          <span>Contrast</span>
          <span className="text-white">{contrast.toFixed(1)}x</span>
        </label>
        <input
          type="range"
          min={0.1}
          max={3.0}
          step={0.05}
          value={contrast}
          onChange={(e) => onChange(brightness, Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none bg-gray-text/20 cursor-pointer"
        />
      </div>
    </div>
  );
}
