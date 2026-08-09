"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import GridCanvas from "@/components/GridCanvas";
import RamenModal from "@/components/RamenModal";
import FilterDock from "@/components/FilterDock";
import { FLAVOR_PROFILES, getFlavorTags } from "@/lib/flavors";
import type { RamenProduct } from "@/types";

const MAX_COLS = 50;

export default function RamenExplorer() {
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
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(
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

  // Precompute flavor tags for each product
  const flavorTagsMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const p of products) {
      map.set(p.id, getFlavorTags(p.variety));
    }
    return map;
  }, [products]);

  // Cascading filter + grid computation
  // Each dropdown shows only options that produce results given the OTHER active filters
  const { dataMap, total, cols: gridCols, availableBrands, availableCountries, availableFlavors, availableRatings } = useMemo(() => {
    const searchLower = search.toLowerCase();

    // Base: has image + matches search
    const base = products.filter((p) => {
      if (!p.imagePath) return false;
      if (
        search &&
        !p.brand.toLowerCase().includes(searchLower) &&
        !p.variety.toLowerCase().includes(searchLower)
      )
        return false;
      return true;
    });

    // Per-dimension matchers
    const matchesRating = (p: RamenProduct): boolean => {
      if (selectedRatings.size === 0) return true;
      const bucket = Math.floor(p.stars);
      return selectedRatings.has(Math.min(bucket, 5));
    };

    const matchesFlavor = (p: RamenProduct): boolean => {
      if (selectedFlavors.size === 0) return true;
      const tags = flavorTagsMap.get(p.id) || new Set<string>();
      for (const flavor of selectedFlavors) {
        if (tags.has(flavor)) return true;
      }
      return false;
    };

    const matchesBrand = (p: RamenProduct): boolean =>
      selectedBrands.size === 0 || selectedBrands.has(p.brand);

    const matchesCountry = (p: RamenProduct): boolean =>
      selectedCountries.size === 0 || selectedCountries.has(p.country);

    // Available options per dimension (apply all OTHER filters, skip own)
    const brandsSet = new Set<string>();
    const countriesSet = new Set<string>();
    const flavorsSet = new Set<string>();
    const ratingsSet = new Set<number>();

    for (const p of base) {
      const rating = matchesRating(p);
      const flavor = matchesFlavor(p);
      const brand = matchesBrand(p);
      const country = matchesCountry(p);

      // Brands: apply country + rating + flavor (skip brand)
      if (country && rating && flavor) brandsSet.add(p.brand);

      // Countries: apply brand + rating + flavor (skip country)
      if (brand && rating && flavor) countriesSet.add(p.country);

      // Ratings: apply brand + country + flavor (skip rating)
      if (brand && country && flavor) {
        ratingsSet.add(Math.min(Math.floor(p.stars), 5));
      }

      // Flavors: apply brand + country + rating (skip flavor)
      // (OR logic means adding flavors expands results, so show all available)
      if (brand && country && rating) {
        const tags = flavorTagsMap.get(p.id) || new Set<string>();
        for (const tag of tags) flavorsSet.add(tag);
      }
    }

    // Full filtered set (all filters applied)
    const filtered = base.filter(
      (p) => matchesBrand(p) && matchesCountry(p) && matchesRating(p) && matchesFlavor(p)
    );

    // Dynamically size grid: fewer columns for small result sets
    const cols = Math.min(
      MAX_COLS,
      Math.max(1, Math.ceil(Math.sqrt(filtered.length * 2)))
    );

    const map = new Map<string, RamenProduct>();
    for (let i = 0; i < filtered.length; i++) {
      const fp = {
        ...filtered[i],
        gridX: i % cols,
        gridY: Math.floor(i / cols),
      };
      map.set(`${fp.gridX},${fp.gridY}`, fp);
    }

    return {
      dataMap: map,
      total: filtered.length,
      cols,
      availableBrands: Array.from(brandsSet).sort(),
      availableCountries: Array.from(countriesSet).sort(),
      availableFlavors: FLAVOR_PROFILES.filter((f) => flavorsSet.has(f.id)),
      availableRatings: Array.from(ratingsSet).sort((a, b) => a - b),
    };
  }, [products, search, selectedBrands, selectedRatings, selectedFlavors, selectedCountries, flavorTagsMap]);

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

  const handleToggleCountry = useCallback((country: string) => {
    setSelectedCountries((prev) => {
      const next = new Set(prev);
      if (next.has(country)) next.delete(country);
      else next.add(country);
      return next;
    });
  }, []);

  const handleClearCountries = useCallback(
    () => setSelectedCountries(new Set()),
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
            color: "#78716C",
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
        brands={availableBrands}
        flavors={availableFlavors}
        countries={availableCountries}
        search={search}
        onSearchChange={handleSearchChange}
        selectedBrands={selectedBrands}
        onToggleBrand={handleToggleBrand}
        onClearBrands={handleClearBrands}
        ratings={availableRatings}
        selectedRatings={selectedRatings}
        onToggleRating={handleToggleRating}
        onClearRatings={handleClearRatings}
        selectedFlavors={selectedFlavors}
        onToggleFlavor={handleToggleFlavor}
        onClearFlavors={handleClearFlavors}
        selectedCountries={selectedCountries}
        onToggleCountry={handleToggleCountry}
        onClearCountries={handleClearCountries}
        resultCount={total}
      />
      <RamenModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
