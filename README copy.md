# Image Filter App

A real-time image filtering web app built with Next.js. Upload an image and apply filters instantly with a live preview, then download the result.

## Features

- Drag-and-drop or file picker image upload
- Nine filters applied via canvas pixel manipulation:
  - Grayscale
  - Sepia
  - Invert
  - Brightness / Contrast (slider-controlled)
  - Fade
  - Cross-Process
  - Barrel / Pincushion Distortion
  - Ripple / Wave
  - Swirl
- Download filtered image

## Tech Stack

- Next.js 16 (client-rendered)
- React 19
- TypeScript
- Tailwind CSS
- HTML5 Canvas (ImageData API)

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run test      # Run unit tests (Vitest)
npm run lint      # Lint code
```

## Color Scheme

| Token          | Hex       | Usage                          |
|----------------|-----------|--------------------------------|
| Accent Teal    | `#0acfcf` | Active filter, hover states    |
| Dark Primary   | `#1a1a2e` | Page background                |
| Surface Card   | `#16213e` | Filter panel, toolbar          |
| Purple Accent  | `#7b2ff7` | Download button, key actions   |
| Gray Text      | `#a0a0b0` | Labels, inactive filters       |
