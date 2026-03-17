"use client";

import React from "react";
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
        height: 200,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        WebkitUserSelect: "none",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(0,0,0,0.04)",
        animation: "tileEnter 0.25s ease forwards",
      }}
      onPointerDown={onPointerDown}
      onPointerUp={(e) => onPointerUp(e, product)}
    >
      <img
        src={product.imagePath!}
        alt={`${product.brand} ${product.variety}`}
        loading="lazy"
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />

      <style jsx>{`
        .ramen-tile {
          transition: transform 150ms ease, box-shadow 150ms ease, filter 150ms ease;
        }
        @media (hover: hover) {
          .ramen-tile:hover {
            transform: ${isDragging ? "none" : "scale(1.08)"};
            box-shadow: ${isDragging ? "0 1px 4px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(0,0,0,0.04)" : "0 8px 24px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(0,0,0,0.04)"};
            filter: ${isDragging ? "none" : "brightness(1.03)"};
            z-index: 1;
          }
        }
      `}</style>
    </div>
  );
});

export default RamenTile;
