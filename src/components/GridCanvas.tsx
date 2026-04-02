"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useMotionValue, useAnimationFrame, animate } from "framer-motion";
import { useGridVirtualization } from "@/hooks/useGridVirtualization";
import { CELL_WIDTH, CELL_HEIGHT, TILE_WIDTH, TILE_HEIGHT } from "@/lib/grid";
import RamenTile from "./RamenTile";
import type { RamenProduct } from "@/types";

// ── Warp configuration ─────────────────────────────────────
const PERSPECTIVE = 400;
const ROTATE_X_MAX = 55;
const ROTATE_Y_MAX = 65;
const SCALE_EDGE = 0.4;
const TRANSLATE_Z_EDGE = -500;
const WARP_POWER = 1.0;

// ── Navigation mode ────────────────────────────────────────
const HOLD_DELAY = 250;
const NAV_ZOOM = 0.92;
const MOMENTUM_DECAY = 0.95;
const MOMENTUM_MIN = 0.5;
const MOBILE_BREAKPOINT = 768;
const MOBILE_SCALE = 0.5; // 50% size on mobile = 100% smaller

interface GridCanvasProps {
  dataMap: Map<string, RamenProduct>;
  totalProducts: number;
  gridCols: number;
  onSelectProduct: (product: RamenProduct) => void;
}

export default function GridCanvas({
  dataMap,
  totalProducts,
  gridCols,
  onSelectProduct,
}: GridCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [renderOffset, setRenderOffset] = useState({ x: 0, y: 0 });
  const isMobile = viewportSize.width > 0 && viewportSize.width < MOBILE_BREAKPOINT;
  const tileScale = isMobile ? MOBILE_SCALE : 1;

  const [mode, setMode] = useState<"resting" | "navigating">("resting");
  const modeRef = useRef<"resting" | "navigating">("resting");
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerPos = useRef<{ x: number; y: number } | null>(null);
  const lastPointerPos = useRef<{ x: number; y: number } | null>(null);
  const velocityRef = useRef({ x: 0, y: 0 });
  const wasNavigatingRef = useRef(false);

  const maxRow = Math.max(0, Math.ceil(totalProducts / gridCols) - 1);
  const actualCols = Math.min(gridCols, totalProducts);
  const gridPixelWidth = actualCols * CELL_WIDTH;
  const gridPixelHeight = (maxRow + 1) * CELL_HEIGHT;

  const initialX = Math.round(viewportSize.width / 2 - gridPixelWidth / 2);
  const initialY = Math.round(viewportSize.height / 2 - gridPixelHeight / 2);

  const motionX = useMotionValue(0);
  const motionY = useMotionValue(0);
  const initialized = useRef(false);

  // Measure viewport
  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        setViewportSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Center camera on first load and filter changes
  useEffect(() => {
    if (viewportSize.width > 0) {
      if (!initialized.current) {
        initialized.current = true;
        motionX.set(initialX);
        motionY.set(initialY);
        setRenderOffset({ x: initialX, y: initialY });
      } else {
        animate(motionX, initialX, { type: "spring", stiffness: 200, damping: 30 });
        animate(motionY, initialY, { type: "spring", stiffness: 200, damping: 30 });
      }
    }
  }, [viewportSize.width, totalProducts, initialX, initialY, motionX, motionY]);

  // Sync motion values → render offset + momentum
  useAnimationFrame(() => {
    const x = motionX.get();
    const y = motionY.get();

    if (!pointerPos.current && modeRef.current === "resting") {
      const vx = velocityRef.current.x;
      const vy = velocityRef.current.y;
      if (Math.abs(vx) > MOMENTUM_MIN || Math.abs(vy) > MOMENTUM_MIN) {
        motionX.set(motionX.get() + vx);
        motionY.set(motionY.get() + vy);
        velocityRef.current.x *= MOMENTUM_DECAY;
        velocityRef.current.y *= MOMENTUM_DECAY;
      }
    }

    setRenderOffset((prev) => {
      if (Math.abs(prev.x - x) > 1 || Math.abs(prev.y - y) > 1) {
        return { x, y };
      }
      return prev;
    });
  });

  const visibleTiles = useGridVirtualization(
    renderOffset.x,
    renderOffset.y,
    viewportSize.width,
    viewportSize.height,
    maxRow,
    dataMap,
    gridCols
  );

  // ── Pointer handlers ─────────────────────────────────────
  const enterNavMode = useCallback(() => {
    modeRef.current = "navigating";
    setMode("navigating");
  }, []);

  const exitNavMode = useCallback(() => {
    modeRef.current = "resting";
    setMode("resting");
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      pointerPos.current = { x: e.clientX, y: e.clientY };
      lastPointerPos.current = { x: e.clientX, y: e.clientY };
      velocityRef.current = { x: 0, y: 0 };

      holdTimer.current = setTimeout(() => {
        enterNavMode();
      }, HOLD_DELAY);
    },
    [enterNavMode]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!pointerPos.current) return;

      const dx = e.clientX - pointerPos.current.x;
      const dy = e.clientY - pointerPos.current.y;

      if (modeRef.current === "resting" && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        if (holdTimer.current) {
          clearTimeout(holdTimer.current);
          holdTimer.current = null;
        }
        enterNavMode();
      }

      if (modeRef.current === "navigating" && lastPointerPos.current) {
        // Compensate drag for tile scale (smaller tiles = faster pan)
        const scaleFactor = 1 / tileScale;
        const moveDx = (e.clientX - lastPointerPos.current.x) * scaleFactor;
        const moveDy = (e.clientY - lastPointerPos.current.y) * scaleFactor;
        motionX.set(motionX.get() + moveDx);
        motionY.set(motionY.get() + moveDy);
        velocityRef.current = { x: moveDx, y: moveDy };
      }

      lastPointerPos.current = { x: e.clientX, y: e.clientY };
    },
    [enterNavMode, motionX, motionY, tileScale]
  );

  const handlePointerUp = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    pointerPos.current = null;
    lastPointerPos.current = null;

    if (modeRef.current === "navigating") {
      wasNavigatingRef.current = true;
      requestAnimationFrame(() => {
        wasNavigatingRef.current = false;
      });
      exitNavMode();
    }
  }, [exitNavMode]);

  // ── Per-tile 3D warp ─────────────────────────────────────
  const getTileTransform = useCallback(
    (screenX: number, screenY: number) => {
      // screenX/screenY = tile position in absolute grid coords
      // Convert to actual screen position
      const sx = renderOffset.x + screenX + CELL_WIDTH / 2;
      const sy = renderOffset.y + screenY + CELL_HEIGHT / 2;

      const nx = viewportSize.width > 0 ? ((sx / viewportSize.width) * 2 - 1) : 0;
      const ny = viewportSize.height > 0 ? ((sy / viewportSize.height) * 2 - 1) : 0;

      const cx = Math.max(-1, Math.min(1, nx));
      const cy = Math.max(-1, Math.min(1, ny));
      const dist = Math.min(1, Math.sqrt(cx * cx + cy * cy));
      const warpFactor = Math.pow(dist, WARP_POWER);

      const rotateY = -cx * ROTATE_Y_MAX * warpFactor;
      const rotateX = cy * ROTATE_X_MAX * warpFactor;
      const scale = 1 - (1 - SCALE_EDGE) * warpFactor;
      const translateZ = TRANSLATE_Z_EDGE * warpFactor;
      const opacity = 1 - 0.6 * warpFactor;

      return {
        transform: `perspective(${PERSPECTIVE}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateZ(${translateZ}px) scale(${scale})`,
        opacity,
      };
    },
    [renderOffset.x, renderOffset.y, viewportSize.width, viewportSize.height]
  );

  const isNavigating = mode === "navigating";

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
        touchAction: "none",
        cursor: isNavigating ? "grabbing" : "default",
        position: "relative",
      }}
    >
      {/* Vignette overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 10,
          background: `
            radial-gradient(
              ellipse 80% 80% at 50% 50%,
              transparent 30%,
              rgba(255, 255, 255, 0.6) 65%,
              rgba(255, 255, 255, 0.95) 100%
            )
          `,
        }}
      />

      {/* Tile layer — tiles positioned in screen space, wrapping infinitely */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "50% 50%",
          transform: `scale(${(isNavigating ? NAV_ZOOM : 1) * tileScale})`,
          transition: "transform 400ms cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        {visibleTiles.map(({ product, x, y, key }) => {
          // Screen position = grid position + camera offset
          const screenLeft = renderOffset.x + x;
          const screenTop = renderOffset.y + y;
          const warp = getTileTransform(x, y);
          return (
            /* Hit-test wrapper: flat, receives clicks + hover */
            <div
              key={key}
              className="tile-hitbox"
              onClick={() => {
                if (!isNavigating && !wasNavigatingRef.current) onSelectProduct(product);
              }}
              style={{
                position: "absolute",
                left: screenLeft,
                top: screenTop,
                width: TILE_WIDTH,
                height: TILE_HEIGHT,
                cursor: isNavigating ? "grabbing" : "pointer",
              }}
            >
              {/* Visual layer: 3D warped, ignores pointer events */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  transform: warp.transform,
                  opacity: warp.opacity,
                  transformOrigin: "center center",
                  willChange: "transform",
                  pointerEvents: "none",
                }}
              >
                <div
                  className="tile-hover-scale"
                  style={{
                    width: "100%",
                    height: "100%",
                    transition: "transform 200ms ease",
                  }}
                >
                  <RamenTile
                    product={product}
                    isDragging={isNavigating}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hover effect */}
      <style jsx global>{`
        @media (hover: hover) {
          .tile-hitbox:hover .tile-hover-scale {
            transform: scale(1.12);
          }
        }
      `}</style>
    </div>
  );
}
