"use client";

import { useRef, useState } from "react";

interface Props {
  onImage: (img: HTMLImageElement) => void;
}

export default function UploadZone({ onImage }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported.");
      return;
    }
    setError(null);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      onImage(img);
    };
    img.src = url;
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-primary px-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={[
          "flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-12 py-16 text-center cursor-pointer transition-colors",
          dragOver
            ? "border-accent-teal bg-accent-teal/10"
            : "border-gray-text/40 hover:border-accent-teal/60 hover:bg-surface-card/60",
        ].join(" ")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-14 w-14 text-accent-teal"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <div>
          <p className="text-lg font-semibold text-white">
            Drop an image here
          </p>
          <p className="mt-1 text-sm text-gray-text">
            or click to browse your files
          </p>
        </div>
        <p className="text-xs text-gray-text/60">PNG, JPG, WEBP, GIF, etc.</p>
        {error && (
          <p className="text-sm font-medium text-red-400">{error}</p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
