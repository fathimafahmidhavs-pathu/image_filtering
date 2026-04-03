import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Image Filter App",
  description: "Real-time image filtering with canvas pixel manipulation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-dark-primary text-white antialiased">
        {children}
      </body>
    </html>
  );
}
