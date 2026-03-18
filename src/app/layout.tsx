import type { Metadata } from "next";
import { Permanent_Marker, Nunito } from "next/font/google";
import "./globals.css";

const permanentMarker = Permanent_Marker({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Infinite Ramen — Explore 2,500+ Instant Noodles",
  description:
    "An interactive, explorable 2D grid of instant ramen products from around the world.",
  openGraph: {
    title: "Infinite Ramen",
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
      <body className={`${permanentMarker.variable} ${nunito.variable} antialiased`}>{children}</body>
    </html>
  );
}
