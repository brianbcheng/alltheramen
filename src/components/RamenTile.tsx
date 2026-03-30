"use client";

import React from "react";
import type { RamenProduct } from "@/types";

interface RamenTileProps {
  product: RamenProduct;
  isDragging: boolean;
}

const RamenTile = React.memo(function RamenTile({
  product,
  isDragging,
}: RamenTileProps) {
  return (
    <div
      className="ramen-tile"
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 8,
        backgroundColor: "transparent",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <span className="corner-bl" />
      <span className="corner-br" />
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
          borderRadius: 8,
        }}
      />

      <style jsx>{`
        .ramen-tile {
          transition: transform 150ms ease;
          position: relative;
        }
        .ramen-tile::before,
        .ramen-tile::after,
        .ramen-tile > .corner-bl,
        .ramen-tile > .corner-br {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          opacity: 0;
          transition: opacity 150ms ease;
          pointer-events: none;
          z-index: 2;
        }
        .ramen-tile::before {
          top: -3px; left: -3px;
          border-top: 1.5px solid #d1d5db;
          border-left: 1.5px solid #d1d5db;
          border-top-left-radius: 10px;
        }
        .ramen-tile::after {
          top: -3px; right: -3px;
          border-top: 1.5px solid #d1d5db;
          border-right: 1.5px solid #d1d5db;
          border-top-right-radius: 10px;
        }
        .ramen-tile > .corner-bl {
          bottom: -3px; left: -3px;
          border-bottom: 1.5px solid #d1d5db;
          border-left: 1.5px solid #d1d5db;
          border-bottom-left-radius: 10px;
        }
        .ramen-tile > .corner-br {
          bottom: -3px; right: -3px;
          border-bottom: 1.5px solid #d1d5db;
          border-right: 1.5px solid #d1d5db;
          border-bottom-right-radius: 10px;
        }
        @media (hover: hover) {
          .ramen-tile:hover {
            transform: ${isDragging ? "none" : "scale(1.08)"};
            z-index: 1;
          }
          .ramen-tile:hover::before,
          .ramen-tile:hover::after,
          .ramen-tile:hover > .corner-bl,
          .ramen-tile:hover > .corner-br {
            opacity: ${isDragging ? "0" : "1"};
          }
        }
      `}</style>
    </div>
  );
});

export default RamenTile;
