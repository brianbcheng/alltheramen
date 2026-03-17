"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import GridCanvas from "@/components/GridCanvas";
import RamenModal from "@/components/RamenModal";
import FilterDock from "@/components/FilterDock";
import type { RamenProduct } from "@/types";

const MAX_COLS = 50;

export default function Home() {
  const [products, setProducts] = useState<RamenProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<RamenProduct | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Filter state
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [minRating, setMinRating] = useState(0);

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

  // Extract unique brands from products with images
  const brands = useMemo(() => {
    const brandSet = new Set<string>();
    for (const p of products) {
      if (p.imagePath) brandSet.add(p.brand);
    }
    return Array.from(brandSet).sort();
  }, [products]);

  // Filter and re-grid products
  const { dataMap, total, cols: gridCols } = useMemo(() => {
    const searchLower = search.toLowerCase();
    const filtered = products.filter((p) => {
      if (!p.imagePath) return false;
      if (minRating > 0 && p.stars < minRating) return false;
      if (selectedBrand && p.brand !== selectedBrand) return false;
      if (
        search &&
        !p.brand.toLowerCase().includes(searchLower) &&
        !p.variety.toLowerCase().includes(searchLower)
      )
        return false;
      return true;
    });

    // Dynamically size grid: use fewer columns for small result sets
    const cols = Math.min(MAX_COLS, Math.max(1, Math.ceil(Math.sqrt(filtered.length * 2))));

    const map = new Map<string, RamenProduct>();
    for (let i = 0; i < filtered.length; i++) {
      const p = {
        ...filtered[i],
        gridX: i % cols,
        gridY: Math.floor(i / cols),
      };
      map.set(`${p.gridX},${p.gridY}`, p);
    }
    return { dataMap: map, total: filtered.length, cols };
  }, [products, search, selectedBrand, minRating]);

  const handleSearchChange = useCallback((v: string) => setSearch(v), []);
  const handleBrandChange = useCallback(
    (b: string | null) => setSelectedBrand(b),
    []
  );
  const handleRatingChange = useCallback((r: number) => setMinRating(r), []);

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
          backgroundColor: "#FFFFFF",
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
      <GridCanvas
        dataMap={dataMap}
        totalProducts={total}
        gridCols={gridCols}
        onSelectProduct={setSelectedProduct}
      />
      <FilterDock
        brands={brands}
        search={search}
        onSearchChange={handleSearchChange}
        selectedBrand={selectedBrand}
        onBrandChange={handleBrandChange}
        minRating={minRating}
        onRatingChange={handleRatingChange}
        resultCount={total}
      />
      <RamenModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
