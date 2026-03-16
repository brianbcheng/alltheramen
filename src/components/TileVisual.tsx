import { getCountryColor, getStyleEmoji } from "@/lib/colors";

interface TileVisualProps {
  brand: string;
  country: string;
  style: string;
  stars: number;
  imagePath?: string | null;
  size?: number;
}

function getFontSize(brand: string, size: number): number {
  const scale = size / 200;
  if (brand.length > 30) return Math.round(12 * scale);
  if (brand.length > 20) return Math.round(14 * scale);
  if (brand.length > 12) return Math.round(16 * scale);
  return Math.round(18 * scale);
}

export default function TileVisual({
  brand,
  country,
  style,
  stars,
  imagePath,
  size = 200,
}: TileVisualProps) {
  const { bg, text } = getCountryColor(country);
  const emoji = getStyleEmoji(style);
  const fontSize = getFontSize(brand, size);
  const scale = size / 200;

  const fullStars = Math.floor(stars);
  const hasHalf = stars % 1 >= 0.25 && stars % 1 < 0.75;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  const dotSize = Math.round(8 * scale);
  const dotGap = Math.round(2 * scale);
  const borderRadius = `${Math.round(8 * scale)}px ${Math.round(8 * scale)}px 0 0`;

  // If we have a real product image, show it
  if (imagePath) {
    return (
      <div
        style={{
          width: size,
          height: size,
          position: "relative",
          overflow: "hidden",
          borderRadius,
          backgroundColor: "#f5f5f5",
        }}
      >
        <img
          src={imagePath}
          alt={brand}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    );
  }

  // Fallback: generated tile visual
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderRadius,
      }}
    >
      {/* Style emoji */}
      <span
        style={{
          position: "absolute",
          top: Math.round(8 * scale),
          right: Math.round(8 * scale),
          fontSize: Math.round(24 * scale),
          lineHeight: 1,
        }}
      >
        {emoji}
      </span>

      {/* Brand name */}
      <span
        style={{
          color: text,
          fontSize,
          fontWeight: 700,
          textAlign: "center",
          padding: `0 ${Math.round(12 * scale)}px`,
          lineHeight: 1.3,
          maxHeight: "60%",
          overflow: "hidden",
          wordBreak: "break-word",
        }}
      >
        {brand}
      </span>

      {/* Country name */}
      <span
        style={{
          position: "absolute",
          bottom: Math.round(24 * scale),
          left: Math.round(8 * scale),
          fontSize: Math.round(10 * scale),
          color: text,
          opacity: 0.7,
        }}
      >
        {country}
      </span>

      {/* Star rating dots */}
      <div
        style={{
          position: "absolute",
          bottom: Math.round(8 * scale),
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: dotGap,
        }}
      >
        {Array.from({ length: fullStars }).map((_, i) => (
          <div
            key={`full-${i}`}
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: "50%",
              backgroundColor: "#E63946",
            }}
          />
        ))}
        {hasHalf && (
          <div
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: "50%",
              background:
                "linear-gradient(to right, #E63946 50%, transparent 50%)",
              border: "1px solid #E63946",
              boxSizing: "border-box",
            }}
          />
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <div
            key={`empty-${i}`}
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: "50%",
              border: "1px solid #E63946",
              boxSizing: "border-box",
            }}
          />
        ))}
      </div>
    </div>
  );
}
