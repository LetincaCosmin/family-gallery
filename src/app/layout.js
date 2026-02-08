import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ParallaxRig from "@/components/ParallaxRig";
import ThreeBackground from "@/components/ThreeBackground";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Family Gallery",
  description: "Galerie foto de familie",
  manifest: "/manifest.json",
  themeColor: "#050b16",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh overflow-x-hidden text-white">
        <ParallaxRig />
        <ThreeBackground />
        {/* Background scene (layered, 3D-ish) */}
        <div aria-hidden="true" className="canvas-bg" />

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
