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

  const dataMap = useMemo(() => {
    const map = new Map<string, RamenProduct>();
    for (const product of products) {
      map.set(`${product.gridX},${product.gridY}`, product);
    }
    return map;
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
        totalProducts={products.length}
        onSelectProduct={setSelectedProduct}
      />
      <RamenModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
