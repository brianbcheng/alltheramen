export const TILE_WIDTH = 200;
export const TILE_HEIGHT = 240;
export const GAP = 16;
export const CELL_WIDTH = TILE_WIDTH + GAP;
export const CELL_HEIGHT = TILE_HEIGHT + GAP;
export const GRID_COLS = 50;

export function getVisibleRange(
  offsetX: number,
  offsetY: number,
  viewportWidth: number,
  viewportHeight: number,
  maxRow: number
) {
  const minCol = Math.max(0, Math.floor(-offsetX / CELL_WIDTH) - 1);
  const maxCol = Math.min(
    GRID_COLS - 1,
    Math.ceil((-offsetX + viewportWidth) / CELL_WIDTH) + 1
  );
  const minRow = Math.max(0, Math.floor(-offsetY / CELL_HEIGHT) - 1);
  const maxRowClamped = Math.min(
    maxRow,
    Math.ceil((-offsetY + viewportHeight) / CELL_HEIGHT) + 1
  );

  return { minCol, maxCol, minRow, maxRow: maxRowClamped };
}
