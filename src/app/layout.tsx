import type { Metadata } from "next";
import { Permanent_Marker, Geist_Mono } from "next/font/google";
import "./globals.css";

const SITE_URL = "https://infinteramen.xyz";
const SITE_NAME = "Infinite Ramen";
const SITE_DESCRIPTION =
  "Explore 5,000+ instant ramen products from around the world on an interactive, zoomable 2D grid. Filter by brand, country, flavor, and rating.";

const permanentMarker = Permanent_Marker({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Infinite Ramen — Explore 5,000+ Instant Noodles from Around the World",
    template: "%s | Infinite Ramen",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "instant ramen",
    "ramen reviews",
    "instant noodles",
    "ramen database",
    "noodle ratings",
    "ramen explorer",
    "best instant ramen",
    "ramen brands",
    "world ramen",
    "noodle varieties",
  ],
  authors: [{ name: "Infinite Ramen" }],
  creator: "Infinite Ramen",
  publisher: "Infinite Ramen",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Infinite Ramen — Explore 5,000+ Instant Noodles",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Infinite Ramen — Explore 5,000+ Instant Noodles",
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  category: "food",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: "ReferenceApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingCount: 5000,
      bestRating: 5,
      worstRating: 0,
      itemReviewed: {
        "@type": "Thing",
        name: "Instant Ramen Products",
      },
    },
    about: {
      "@type": "Thing",
      name: "Instant Ramen",
      description:
        "A comprehensive database of over 5,000 instant ramen and noodle products from around the world, with ratings, reviews, and images.",
    },
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
      </head>
      <body className={`${permanentMarker.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
