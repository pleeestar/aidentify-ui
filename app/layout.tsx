// path: /app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";

import BackgroundController from "@/components/BackgroundController"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "700"], // Specify the desired weights
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "700"], // Specify the desired weights
});

export const metadata: Metadata = {
  // Your metadata
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${ibmPlexMono.variable} ${inter.variable} w-screen h-dvh`}>
        <BackgroundController>
          {children}
        </BackgroundController>
      </body>
    </html>
  );
}