"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GridCanvas from "@/components/GridCanvas";
import RamenModal from "@/components/RamenModal";
import Header from "@/components/Header";
import type { RamenProduct } from "@/types";

export default function Home() {
  const [products, setProducts] = useState<RamenProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<RamenProduct | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/ramen.json")
      .then((res) => res.json())
      .then((data: RamenProduct[]) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load ramen data:", err);
        setLoading(false);
      });
  }, []);

  // Only show products that have images, re-grid them compactly
  const { dataMap, totalWithImages } = useMemo(() => {
    const withImages = products.filter((p) => p.imagePath);
    const COLS = 50;
    const map = new Map<string, RamenProduct>();
    for (let i = 0; i < withImages.length; i++) {
      const p = {
        ...withImages[i],
        gridX: i % COLS,
        gridY: Math.floor(i / COLS),
      };
      map.set(`${p.gridX},${p.gridY}`, p);
    }
    return { dataMap: map, totalWithImages: withImages.length };
  }, [products]);

  if (loading) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F5F3EF",
          gap: 16,
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ fontSize: 48 }}
        >
          🍜
        </motion.div>
        <p style={{ color: "#6B7280", fontSize: 14 }}>Loading noodles...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <GridCanvas
        dataMap={dataMap}
        totalProducts={totalWithImages}
        onSelectProduct={setSelectedProduct}
      />
      <RamenModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
