import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { TempoInit } from "./tempo-init";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Headshots - Professional Headshot Generator",
  description:
    "Generate professional AI headshots for your profile, resume, or social media",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://api.tempolabs.ai/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/error-handling.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <TempoInit />
      </body>
    </html>
  );
}
