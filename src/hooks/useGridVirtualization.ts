import { useMemo } from "react";
import { getVisibleRange, CELL_WIDTH, CELL_HEIGHT } from "@/lib/grid";
import type { RamenProduct } from "@/types";

export function useGridVirtualization(
  offsetX: number,
  offsetY: number,
  viewportWidth: number,
  viewportHeight: number,
  maxRow: number,
  dataMap: Map<string, RamenProduct>
) {
  const visibleTiles = useMemo(() => {
    if (viewportWidth === 0 || viewportHeight === 0) return [];

    const { minCol, maxCol, minRow, maxRow: maxR } = getVisibleRange(
      offsetX,
      offsetY,
      viewportWidth,
      viewportHeight,
      maxRow
    );

    const tiles: { product: RamenProduct; x: number; y: number }[] = [];

    for (let row = minRow; row <= maxR; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const product = dataMap.get(`${col},${row}`);
        if (product) {
          tiles.push({
            product,
            x: col * CELL_WIDTH,
            y: row * CELL_HEIGHT,
          });
        }
      }
    }

    return tiles;
  }, [offsetX, offsetY, viewportWidth, viewportHeight, maxRow, dataMap]);

  return visibleTiles;
}
