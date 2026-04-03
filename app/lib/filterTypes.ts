export type FilterName =
  | "original"
  | "grayscale"
  | "sepia"
  | "invert"
  | "brightness-contrast"
  | "fade"
  | "cross-process"
  | "barrel"
  | "ripple"
  | "swirl";

export interface BrightnessContrastOptions {
  brightness: number; // -100 to +100
  contrast: number;   // 0.1 to 3.0
}

export interface FilterOptions extends Partial<BrightnessContrastOptions> {}

export interface FilterDef {
  name: FilterName;
  label: string;
  defaultOptions?: FilterOptions;
}

export const FILTERS: FilterDef[] = [
  { name: "original", label: "Original" },
  { name: "grayscale", label: "Grayscale" },
  { name: "sepia", label: "Sepia" },
  { name: "invert", label: "Invert" },
  {
    name: "brightness-contrast",
    label: "Brightness / Contrast",
    defaultOptions: { brightness: 0, contrast: 1.0 },
  },
  { name: "fade", label: "Fade" },
  { name: "cross-process", label: "Cross-Process" },
  { name: "barrel", label: "Barrel" },
  { name: "ripple", label: "Ripple" },
  { name: "swirl", label: "Swirl" },
];
