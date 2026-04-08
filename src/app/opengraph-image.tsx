import { ImageResponse } from "next/og";

export const alt = "Infinite Ramen — A grid of thousands of instant ramen products from around the world";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #1C1917 0%, #292524 50%, #1C1917 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid pattern background */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexWrap: "wrap",
            opacity: 0.08,
          }}
        >
          {Array.from({ length: 120 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 100,
                height: 100,
                border: "1px solid #fff",
                borderRadius: 8,
              }}
            />
          ))}
        </div>

        {/* Emoji accent */}
        <div
          style={{
            fontSize: 80,
            marginBottom: 16,
            display: "flex",
          }}
        >
          🍜
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: "#FFFFFF",
            letterSpacing: "-2px",
            lineHeight: 1.1,
            textAlign: "center",
            display: "flex",
          }}
        >
          Infinite Ramen
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: "#A8A29E",
            marginTop: 16,
            textAlign: "center",
            display: "flex",
            maxWidth: 800,
          }}
        >
          Explore 5,000+ instant noodles from around the world
        </div>

        {/* Tag line */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 32,
          }}
        >
          {["Filter by Brand", "Rate by Stars", "Browse by Country", "Search by Flavor"].map(
            (tag) => (
              <div
                key={tag}
                style={{
                  padding: "8px 16px",
                  borderRadius: 20,
                  border: "1px solid #57534E",
                  color: "#D6D3D1",
                  fontSize: 16,
                  display: "flex",
                }}
              >
                {tag}
              </div>
            )
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
