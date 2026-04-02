export const TILE_WIDTH = 160;
export const TILE_HEIGHT = 160;
export const GAP = 14;
export const CELL_WIDTH = TILE_WIDTH + GAP;
export const CELL_HEIGHT = TILE_HEIGHT + GAP;
export const GRID_COLS = 50;

// Buffer: extra tiles rendered outside viewport to account for 3D warp visibility
const OVERDRAW = 3;

export function getVisibleRange(
  offsetX: number,
  offsetY: number,
  viewportWidth: number,
  viewportHeight: number,
  maxRow: number,
  cols: number = GRID_COLS
) {
  const minCol = Math.max(0, Math.floor(-offsetX / CELL_WIDTH) - OVERDRAW);
  const maxCol = Math.min(
    cols - 1,
    Math.ceil((-offsetX + viewportWidth) / CELL_WIDTH) + OVERDRAW
  );
  const minRow = Math.max(0, Math.floor(-offsetY / CELL_HEIGHT) - OVERDRAW);
  const maxRowClamped = Math.min(
    maxRow,
    Math.ceil((-offsetY + viewportHeight) / CELL_HEIGHT) + OVERDRAW
  );

  return { minCol, maxCol, minRow, maxRow: maxRowClamped };
}
