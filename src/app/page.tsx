"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import GridCanvas from "@/components/GridCanvas";
import RamenModal from "@/components/RamenModal";
import FilterDock from "@/components/FilterDock";
import { FLAVOR_PROFILES, getFlavorTags } from "@/lib/flavors";
import type { RamenProduct } from "@/types";

const MAX_COLS = 50;

export default function Home() {
  const [products, setProducts] = useState<RamenProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<RamenProduct | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Filter state — all multi-select
  const [search, setSearch] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [selectedRatings, setSelectedRatings] = useState<Set<number>>(
    new Set()
  );
  const [selectedFlavors, setSelectedFlavors] = useState<Set<string>>(
    new Set()
  );

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

  // Precompute flavor tags for each product
  const flavorTagsMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const p of products) {
      map.set(p.id, getFlavorTags(p.variety));
    }
    return map;
  }, [products]);

  // Available flavor profiles (only those that have matches in the data)
  const availableFlavors = useMemo(() => {
    const counts = new Map<string, number>();
    for (const tags of flavorTagsMap.values()) {
      for (const tag of tags) {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      }
    }
    return FLAVOR_PROFILES.filter((f) => (counts.get(f.id) || 0) > 0);
  }, [flavorTagsMap]);

  // Filter and re-grid products
  const { dataMap, total, cols: gridCols } = useMemo(() => {
    const searchLower = search.toLowerCase();
    const filtered = products.filter((p) => {
      if (!p.imagePath) return false;

      // Rating: OR within selected (match any selected rating bucket)
      if (selectedRatings.size > 0) {
        const bucket = Math.floor(p.stars);
        // 5-star: exact match; others: bucket (e.g. 3 = 3.0–3.99)
        if (!selectedRatings.has(Math.min(bucket, 5))) return false;
      }

      // Brand: OR within selected
      if (selectedBrands.size > 0 && !selectedBrands.has(p.brand)) return false;

      // Flavor: AND within selected (must match ALL selected flavors)
      if (selectedFlavors.size > 0) {
        const tags = flavorTagsMap.get(p.id) || new Set();
        for (const flavor of selectedFlavors) {
          if (!tags.has(flavor)) return false;
        }
      }

      // Search
      if (
        search &&
        !p.brand.toLowerCase().includes(searchLower) &&
        !p.variety.toLowerCase().includes(searchLower)
      )
        return false;

      return true;
    });

    // Dynamically size grid: use fewer columns for small result sets
    const cols = Math.min(
      MAX_COLS,
      Math.max(1, Math.ceil(Math.sqrt(filtered.length * 2)))
    );

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
  }, [products, search, selectedBrands, selectedRatings, selectedFlavors, flavorTagsMap]);

  const handleSearchChange = useCallback((v: string) => setSearch(v), []);

  const handleToggleBrand = useCallback((brand: string) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brand)) next.delete(brand);
      else next.add(brand);
      return next;
    });
  }, []);

  const handleClearBrands = useCallback(() => setSelectedBrands(new Set()), []);

  const handleToggleRating = useCallback((rating: number) => {
    setSelectedRatings((prev) => {
      const next = new Set(prev);
      if (next.has(rating)) next.delete(rating);
      else next.add(rating);
      return next;
    });
  }, []);

  const handleClearRatings = useCallback(
    () => setSelectedRatings(new Set()),
    []
  );

  const handleToggleFlavor = useCallback((flavor: string) => {
    setSelectedFlavors((prev) => {
      const next = new Set(prev);
      if (next.has(flavor)) next.delete(flavor);
      else next.add(flavor);
      return next;
    });
  }, []);

  const handleClearFlavors = useCallback(
    () => setSelectedFlavors(new Set()),
    []
  );

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
        <p
          style={{
            color: "#6B7280",
            fontSize: 16,
            fontFamily: "var(--font-display)",
          }}
        >
          Loading noodles...
        </p>
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
        flavors={availableFlavors}
        search={search}
        onSearchChange={handleSearchChange}
        selectedBrands={selectedBrands}
        onToggleBrand={handleToggleBrand}
        onClearBrands={handleClearBrands}
        selectedRatings={selectedRatings}
        onToggleRating={handleToggleRating}
        onClearRatings={handleClearRatings}
        selectedFlavors={selectedFlavors}
        onToggleFlavor={handleToggleFlavor}
        onClearFlavors={handleClearFlavors}
        resultCount={total}
      />
      <RamenModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
