"use client";

import { useState } from "react";

export default function Header() {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        left: 16,
        zIndex: 40,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderRadius: 12,
          padding: "12px 16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          pointerEvents: "auto",
          maxWidth: 320,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h1
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#1A1A1A",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            🍜 The Infinite Ramen Grid
          </h1>
          <button
            onClick={() => setShowTooltip(!showTooltip)}
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              border: "1px solid #E5E7EB",
              backgroundColor: "#F9FAFB",
              cursor: "pointer",
              fontSize: 12,
              color: "#6B7280",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ?
          </button>
        </div>
        <p
          className="header-subtitle"
          style={{
            fontSize: 13,
            color: "#6B7280",
            margin: "4px 0 0",
            lineHeight: 1.3,
          }}
        >
          Explore 490 instant noodles from around the world
        </p>

        {showTooltip && (
          <div
            style={{
              marginTop: 8,
              padding: "8px 12px",
              backgroundColor: "#F3F4F6",
              borderRadius: 8,
              fontSize: 12,
              color: "#4B5563",
              lineHeight: 1.5,
            }}
          >
            Click and drag to explore. Tap a tile for details.
          </div>
        )}
      </div>
    </div>
  );
}
