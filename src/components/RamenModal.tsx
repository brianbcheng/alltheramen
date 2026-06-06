"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TileVisual from "./TileVisual";
import UserRating from "./UserRating";
import { getStyleEmoji } from "@/lib/colors";
import { getCountryFlag } from "@/lib/countryFlags";
import type { RamenProduct } from "@/types";

interface RamenModalProps {
  product: RamenProduct | null;
  onClose: () => void;
}

const labelStyle = {
  fontFamily: "var(--font-mono)",
  fontSize: 12.5,
  fontWeight: 700,
  color: "#78716C",
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  lineHeight: "16px",
};

const valueStyle = {
  fontFamily: "var(--font-text)",
  fontSize: 18,
  fontWeight: 600,
  color: "#000",
  lineHeight: "24px",
};

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
            role="dialog"
            aria-modal="true"
            aria-label={`${product.brand} ${product.variety} details`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              boxShadow:
                "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
              overflow: "hidden",
              maxWidth: 448,
              width: "calc(100% - 32px)",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close product details"
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                zIndex: 10,
                width: 24,
                height: 24,
                border: "none",
                background: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="#000"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <line x1="1" y1="1" x2="13" y2="13" />
                <line x1="13" y1="1" x2="1" y2="13" />
              </svg>
            </button>

            {/* Image */}
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                paddingTop: 16,
              }}
            >
              <TileVisual
                brand={product.brand}
                country={product.country}
                style={product.style}
                stars={product.stars}
                imagePath={product.imagePath}
                size={200}
              />
            </div>

            {/* Content */}
            <div style={{ padding: "16px 32px 24px" }}>
              {/* Brand + Variety */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.1 }}
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 44,
                    fontWeight: 800,
                    color: "#000",
                    margin: 0,
                    letterSpacing: "-0.02em",
                    lineHeight: 0.98,
                  }}
                >
                  {product.brand}
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 29,
                    fontWeight: 600,
                    color: "#000",
                    margin: 0,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.16,
                    textWrap: "balance",
                  }}
                >
                  {product.variety}
                </p>
              </motion.div>

              {/* Description */}
              {product.description && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.15 }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-text)",
                      fontSize: 17,
                      fontWeight: 400,
                      color: "#78716C",
                      margin: "8px 0 0",
                      lineHeight: 1.6,
                      textWrap: "pretty",
                    }}
                  >
                    {product.description}
                  </p>
                  <div
                    style={{
                      height: 1,
                      backgroundColor: "#E5E7EB",
                      marginTop: 10,
                    }}
                  />
                </motion.div>
              )}

              {/* Details: 3-column grid */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.2 }}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 24,
                  marginTop: 14,
                }}
              >
                <div style={{ flex: "1 0 0", minWidth: 0 }}>
                  <div style={labelStyle}>Country</div>
                  <div style={{ ...valueStyle, marginTop: 8 }}>
                    {getCountryFlag(product.country)} {product.country}
                  </div>
                </div>

                <div style={{ flex: "1 0 0", minWidth: 0 }}>
                  <div style={labelStyle}>Style</div>
                  <div style={{ ...valueStyle, marginTop: 8 }}>
                    {getStyleEmoji(product.style)} {product.style}
                  </div>
                </div>

                <div style={{ flex: "1 0 0", minWidth: 0 }}>
                  <div style={labelStyle}>Rating</div>
                  <div style={{ ...valueStyle, marginTop: 8 }}>
                    🍜 {product.stars.toFixed(2)}
                  </div>
                </div>
              </motion.div>

              {/* User Rating */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.25 }}
                style={{ marginTop: 14 }}
              >
                <UserRating
                  key={product.reviewNumber}
                  reviewNumber={product.reviewNumber}
                />
              </motion.div>

              {/* Read Full Review button */}
              {product.reviewUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.3 }}
                >
                  <a
                    href={product.reviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      marginTop: 16,
                      padding: "12px 16px",
                      borderRadius: 9999,
                      backgroundColor: "#000",
                      color: "#FFF",
                      fontFamily: "var(--font-display)",
                      fontSize: 19,
                      fontWeight: 600,
                      textDecoration: "none",
                      transition:
                        "transform 0.15s ease, opacity 0.15s ease",
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
                      width="14"
                      height="14"
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
                </motion.div>
              )}

              {/* Attribution */}
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  marginTop: 12,
                  fontSize: 13,
                  fontWeight: 400,
                  color: "#78716C",
                  textAlign: "center",
                  lineHeight: "16px",
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
