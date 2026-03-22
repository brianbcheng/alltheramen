"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TileVisual from "./TileVisual";
import { getStyleEmoji } from "@/lib/colors";
import { getCountryFlag } from "@/lib/countryFlags";
import type { RamenProduct } from "@/types";

interface RamenModalProps {
  product: RamenProduct | null;
  onClose: () => void;
}

function RamenBowlIcon({ filled = "full", size = 18 }: { filled?: "full" | "half" | "empty"; size?: number }) {
  const colorBowl = "#E63946";
  const colorNoodle = "#F4A261";
  const colorChopstick = "#8B4513";
  const greyBowl = "#D6D3D1";
  const greyNoodle = "#D6D3D1";
  const greyChopstick = "#D6D3D1";

  const clipId = `half-clip-${Math.random().toString(36).slice(2, 8)}`;

  if (filled === "half") {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <defs>
          <clipPath id={clipId}>
            <rect x="0" y="0" width="32" height="64" />
          </clipPath>
        </defs>
        {/* Grey (empty) layer */}
        <g>
          <ellipse cx="32" cy="38" rx="26" ry="16" fill={greyBowl} />
          <path d="M6 38c0 10 11.6 20 26 20s26-10 26-20" fill={greyBowl} />
          <ellipse cx="32" cy="30" rx="20" ry="8" fill={greyNoodle} />
          <path d="M18 24c4 6 10 8 14 6" stroke={greyNoodle} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M24 22c2 7 8 10 12 8" stroke={greyNoodle} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M30 21c0 7 4 10 8 9" stroke={greyNoodle} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <line x1="38" y1="8" x2="48" y2="28" stroke={greyChopstick} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="42" y1="6" x2="52" y2="26" stroke={greyChopstick} strokeWidth="2.5" strokeLinecap="round" />
        </g>
        {/* Colored (filled) layer clipped to left half */}
        <g clipPath={`url(#${clipId})`}>
          <ellipse cx="32" cy="38" rx="26" ry="16" fill={colorBowl} />
          <path d="M6 38c0 10 11.6 20 26 20s26-10 26-20" fill={colorBowl} />
          <ellipse cx="32" cy="30" rx="20" ry="8" fill={colorNoodle} />
          <path d="M18 24c4 6 10 8 14 6" stroke={colorNoodle} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M24 22c2 7 8 10 12 8" stroke={colorNoodle} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M30 21c0 7 4 10 8 9" stroke={colorNoodle} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <line x1="38" y1="8" x2="48" y2="28" stroke={colorChopstick} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="42" y1="6" x2="52" y2="26" stroke={colorChopstick} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  const bowl = filled === "full" ? colorBowl : greyBowl;
  const noodle = filled === "full" ? colorNoodle : greyNoodle;
  const chopstick = filled === "full" ? colorChopstick : greyChopstick;

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="38" rx="26" ry="16" fill={bowl} />
      <path d="M6 38c0 10 11.6 20 26 20s26-10 26-20" fill={bowl} />
      <ellipse cx="32" cy="30" rx="20" ry="8" fill={noodle} />
      <path d="M18 24c4 6 10 8 14 6" stroke={noodle} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M24 22c2 7 8 10 12 8" stroke={noodle} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M30 21c0 7 4 10 8 9" stroke={noodle} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <line x1="38" y1="8" x2="48" y2="28" stroke={chopstick} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="42" y1="6" x2="52" y2="26" stroke={chopstick} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function RamenRating({ stars }: { stars: number }) {
  const fullBowls = Math.floor(stars);
  const hasHalf = stars % 1 >= 0.25 && stars % 1 < 0.75;
  const roundUp = stars % 1 >= 0.75;
  const totalFull = fullBowls + (roundUp ? 1 : 0);
  const emptyBowls = 5 - totalFull - (hasHalf ? 1 : 0);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {Array.from({ length: totalFull }).map((_, i) => (
        <RamenBowlIcon key={`f-${i}`} filled="full" size={18} />
      ))}
      {hasHalf && <RamenBowlIcon filled="half" size={18} />}
      {Array.from({ length: emptyBowls }).map((_, i) => (
        <RamenBowlIcon key={`e-${i}`} filled="empty" size={18} />
      ))}
      <span style={{ marginLeft: 6, fontSize: 14, color: "#78716C" }}>
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
                color: "#78716C",
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
              <motion.h2
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.1 }}
                style={{
                  fontSize: 24,
                  fontWeight: 400,
                  color: "#1C1917",
                  margin: 0,
                  fontFamily: "var(--font-display)",
                }}
              >
                {product.brand}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.15 }}
                style={{
                  fontSize: 18,
                  color: "#78716C",
                  margin: "4px 0 0",
                }}
              >
                {product.variety}
              </motion.p>

              {product.description && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.18 }}
                  style={{
                    fontSize: 13,
                    color: "#A8A29E",
                    margin: "8px 0 0",
                    lineHeight: 1.5,
                  }}
                >
                  {product.description}
                </motion.p>
              )}

              <div
                style={{
                  height: 1,
                  backgroundColor: "#E7E5E4",
                  margin: "16px 0",
                }}
              />

              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.2 }}
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
                      color: "#A8A29E",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 4,
                    }}
                  >
                    Style
                  </div>
                  <div style={{ fontSize: 14, color: "#1C1917" }}>
                    {getStyleEmoji(product.style)} {product.style}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#A8A29E",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 4,
                    }}
                  >
                    Country
                  </div>
                  <div style={{ fontSize: 14, color: "#1C1917" }}>
                    {getCountryFlag(product.country)} {product.country}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#A8A29E",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 4,
                    }}
                  >
                    Rating
                  </div>
                  <RamenRating stars={product.stars} />
                </div>

                {product.topTen && (
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#A8A29E",
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
              </motion.div>

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
                    backgroundColor: "#1C1917",
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: "none",
                    transition: "transform 0.15s ease, opacity 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.02)";
                    e.currentTarget.style.opacity = "0.9";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.opacity = "1";
                  }}
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
                  color: "#A8A29E",
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
