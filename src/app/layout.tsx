import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Infinite Ramen Grid — Explore 2,500+ Instant Noodles",
  description:
    "An interactive, explorable 2D grid of instant ramen products from around the world.",
  openGraph: {
    title: "The Infinite Ramen Grid",
    description:
      "Explore 2,500+ instant noodles from around the world on an interactive grid.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
