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
        borderRadius: 8,
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        WebkitUserSelect: "none",
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
        @media (hover: hover) {
          .ramen-tile:hover {
            transform: ${isDragging ? "none" : "scale(1.08)"};
            transition: transform 150ms ease;
            z-index: 1;
          }
        }
      `}</style>
    </div>
  );
});

export default RamenTile;
