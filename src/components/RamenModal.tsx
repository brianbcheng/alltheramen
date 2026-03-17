"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TileVisual from "./TileVisual";
import { getStyleEmoji } from "@/lib/colors";
import type { RamenProduct } from "@/types";

interface RamenModalProps {
  product: RamenProduct | null;
  onClose: () => void;
}

function StarDisplay({ stars }: { stars: number }) {
  const fullStars = Math.floor(stars);
  const hasHalf = stars % 1 >= 0.25 && stars % 1 < 0.75;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <div
          key={`f-${i}`}
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: "#E63946",
          }}
        />
      ))}
      {hasHalf && (
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background:
              "linear-gradient(to right, #E63946 50%, transparent 50%)",
            border: "1.5px solid #E63946",
            boxSizing: "border-box",
          }}
        />
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <div
          key={`e-${i}`}
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            border: "1.5px solid #E63946",
            boxSizing: "border-box",
          }}
        />
      ))}
      <span
        style={{
          marginLeft: 8,
          fontSize: 14,
          color: "#6B7280",
        }}
      >
        {stars.toFixed(2)}
      </span>
    </div>
  );
}

export default function RamenModal({ product, onClose }: RamenModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (product) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [product, onClose]);

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            backgroundColor: "rgba(255,255,255,0.8)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
              overflow: "hidden",
              maxWidth: 480,
              width: "calc(100% - 32px)",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 10,
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "none",
                backgroundColor: "rgba(255,255,255,0.8)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                color: "#6B7280",
                backdropFilter: "blur(4px)",
              }}
            >
              &#x2715;
            </button>

            {/* Visual */}
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <TileVisual
                brand={product.brand}
                country={product.country}
                style={product.style}
                stars={product.stars}
                imagePath={product.imagePath}
                size={300}
              />
            </div>

            {/* Details */}
            <div style={{ padding: 24 }}>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#1A1A1A",
                  margin: 0,
                }}
              >
                {product.brand}
              </h2>
              <p
                style={{
                  fontSize: 18,
                  color: "#6B7280",
                  margin: "4px 0 0",
                }}
              >
                {product.variety}
              </p>

              <div
                style={{
                  height: 1,
                  backgroundColor: "#E5E7EB",
                  margin: "16px 0",
                }}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#9CA3AF",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 4,
                    }}
                  >
                    Style
                  </div>
                  <div style={{ fontSize: 14, color: "#1A1A1A" }}>
                    {getStyleEmoji(product.style)} {product.style}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#9CA3AF",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 4,
                    }}
                  >
                    Country
                  </div>
                  <div style={{ fontSize: 14, color: "#1A1A1A" }}>
                    {product.country}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#9CA3AF",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 4,
                    }}
                  >
                    Rating
                  </div>
                  <StarDisplay stars={product.stars} />
                </div>

                {product.topTen && (
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#9CA3AF",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: 4,
                      }}
                    >
                      Top Ten
                    </div>
                    <span
                      style={{
                        display: "inline-block",
                        backgroundColor: "#E63946",
                        color: "#FFFFFF",
                        fontSize: 12,
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: 12,
                      }}
                    >
                      {product.topTen}
                    </span>
                  </div>
                )}
              </div>

              {product.reviewUrl && (
                <a
                  href={product.reviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    marginTop: 20,
                    padding: "10px 16px",
                    borderRadius: 10,
                    backgroundColor: "#1A1A1A",
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: "none",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.opacity = "0.85")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.opacity = "1")
                  }
                >
                  Read Full Review
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              )}

              <div
                style={{
                  marginTop: product.reviewUrl ? 12 : 20,
                  fontSize: 11,
                  color: "#9CA3AF",
                  textAlign: "center",
                }}
              >
                Data from The Ramen Rater (theramenrater.com)
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
