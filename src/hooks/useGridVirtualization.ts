import { useMemo } from "react";
import { CELL_WIDTH, CELL_HEIGHT } from "@/lib/grid";
import type { RamenProduct } from "@/types";

/**
 * Mod that always returns a positive result (unlike JS %).
 */
function posMod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export function useGridVirtualization(
  offsetX: number,
  offsetY: number,
  viewportWidth: number,
  viewportHeight: number,
  maxRow: number,
  dataMap: Map<string, RamenProduct>,
  cols: number
) {
  const visibleTiles = useMemo(() => {
    if (viewportWidth === 0 || viewportHeight === 0 || cols === 0) return [];

    const totalRows = maxRow + 1;
    if (totalRows === 0) return [];

    // How many cells fit in the viewport + overdraw buffer for warp
    const OVERDRAW = 3;
    const startCol = Math.floor(-offsetX / CELL_WIDTH) - OVERDRAW;
    const endCol = Math.ceil((-offsetX + viewportWidth) / CELL_WIDTH) + OVERDRAW;
    const startRow = Math.floor(-offsetY / CELL_HEIGHT) - OVERDRAW;
    const endRow = Math.ceil((-offsetY + viewportHeight) / CELL_HEIGHT) + OVERDRAW;

    const tiles: { product: RamenProduct; x: number; y: number; key: string }[] = [];

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        // Wrap into the actual grid
        const wrappedCol = posMod(col, cols);
        const wrappedRow = posMod(row, totalRows);

        const product = dataMap.get(`${wrappedCol},${wrappedRow}`);
        if (product) {
          tiles.push({
            product,
            // Position in screen-space (unwrapped coordinates)
            x: col * CELL_WIDTH,
            y: row * CELL_HEIGHT,
            // Unique key per screen position (not per product, since product repeats)
            key: `${col},${row}`,
          });
        }
      }
    }

    return tiles;
  }, [offsetX, offsetY, viewportWidth, viewportHeight, maxRow, dataMap, cols]);

  return visibleTiles;
}
