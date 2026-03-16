"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, useMotionValue, useAnimationFrame } from "framer-motion";
import { useGridVirtualization } from "@/hooks/useGridVirtualization";
import { CELL_WIDTH, CELL_HEIGHT, GRID_COLS } from "@/lib/grid";
import RamenTile from "./RamenTile";
import type { RamenProduct } from "@/types";

interface GridCanvasProps {
  dataMap: Map<string, RamenProduct>;
  totalProducts: number;
  onSelectProduct: (product: RamenProduct) => void;
}

export default function GridCanvas({
  dataMap,
  totalProducts,
  onSelectProduct,
}: GridCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [renderOffset, setRenderOffset] = useState({ x: 0, y: 0 });

  // Pointer tracking for click-vs-drag detection
  const pointerStart = useRef<{
    x: number;
    y: number;
    time: number;
  } | null>(null);

  const maxRow = Math.ceil(totalProducts / GRID_COLS) - 1;
  const gridPixelWidth = GRID_COLS * CELL_WIDTH;
  const gridPixelHeight = (maxRow + 1) * CELL_HEIGHT;

  // Center the camera on the grid initially
  const initialX = Math.round(
    viewportSize.width / 2 - gridPixelWidth / 2
  );
  const initialY = Math.round(
    viewportSize.height / 2 - gridPixelHeight / 2
  );

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

  // Set initial position once viewport is measured
  useEffect(() => {
    if (viewportSize.width > 0 && !initialized.current) {
      initialized.current = true;
      motionX.set(initialX);
      motionY.set(initialY);
      setRenderOffset({ x: initialX, y: initialY });
    }
  }, [viewportSize.width, initialX, initialY, motionX, motionY]);

  // Track motion values for virtualization via animation frame
  useAnimationFrame(() => {
    const x = motionX.get();
    const y = motionY.get();
    setRenderOffset((prev) => {
      // Only update if changed significantly (reduces re-renders)
      if (
        Math.abs(prev.x - x) > 1 ||
        Math.abs(prev.y - y) > 1
      ) {
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
    dataMap
  );

  // Drag constraints: don't let user pan beyond the grid
  const constraints = {
    left: Math.min(0, viewportSize.width - gridPixelWidth),
    right: Math.max(0, viewportSize.width - gridPixelWidth) > 0 ? (viewportSize.width - gridPixelWidth) / 2 + 100 : 100,
    top: Math.min(0, viewportSize.height - gridPixelHeight),
    bottom: Math.max(0, viewportSize.height - gridPixelHeight) > 0 ? (viewportSize.height - gridPixelHeight) / 2 + 100 : 100,
  };

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerStart.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent, product: RamenProduct) => {
      if (!pointerStart.current) return;
      const dx = Math.abs(e.clientX - pointerStart.current.x);
      const dy = Math.abs(e.clientY - pointerStart.current.y);
      const elapsed = Date.now() - pointerStart.current.time;
      pointerStart.current = null;

      if (dx < 5 && dy < 5 && elapsed < 300) {
        onSelectProduct(product);
      }
    },
    [onSelectProduct]
  );

  return (
    <div
      ref={containerRef}
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#F5F3EF",
        touchAction: "none",
        cursor: isDragging ? "grabbing" : "grab",
        position: "relative",
      }}
    >
      <motion.div
        drag
        dragMomentum
        dragTransition={{
          power: 0.3,
          timeConstant: 200,
          bounceStiffness: 300,
          bounceDamping: 30,
        }}
        dragConstraints={constraints}
        dragElastic={0.1}
        style={{
          x: motionX,
          y: motionY,
          width: gridPixelWidth,
          height: gridPixelHeight,
          position: "absolute",
        }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => {
          // Small delay to prevent click firing after drag end
          setTimeout(() => setIsDragging(false), 50);
        }}
      >
        {visibleTiles.map(({ product, x, y }) => (
          <div
            key={product.id}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 200,
              height: 240,
            }}
          >
            <RamenTile
              product={product}
              isDragging={isDragging}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
