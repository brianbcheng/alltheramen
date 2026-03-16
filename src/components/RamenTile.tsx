"use client";

import React from "react";
import TileVisual from "./TileVisual";
import type { RamenProduct } from "@/types";

interface RamenTileProps {
  product: RamenProduct;
  isDragging: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent, product: RamenProduct) => void;
}

const RamenTile = React.memo(function RamenTile({
  product,
  isDragging,
  onPointerDown,
  onPointerUp,
}: RamenTileProps) {
  return (
    <div
      className="ramen-tile"
      style={{
        width: 200,
        height: 240,
        borderRadius: 8,
        backgroundColor: "#FFFFFF",
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        overflow: "hidden",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerUp={(e) => onPointerUp(e, product)}
    >
      <TileVisual
        brand={product.brand}
        country={product.country}
        style={product.style}
        stars={product.stars}
        imagePath={product.imagePath}
      />
      <div style={{ padding: "4px 8px" }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#1A1A1A",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {product.brand}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#6B7280",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {product.variety}
        </div>
      </div>

      <style jsx>{`
        @media (hover: hover) {
          .ramen-tile:hover {
            transform: ${isDragging ? "none" : "scale(1.05)"};
            box-shadow: ${isDragging ? "0 1px 3px rgba(0,0,0,0.08)" : "0 4px 12px rgba(0,0,0,0.15)"};
            transition: transform 150ms ease, box-shadow 150ms ease;
          }
        }
      `}</style>
    </div>
  );
});

export default RamenTile;
