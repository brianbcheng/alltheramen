"use client";

import { useState, useRef, useEffect } from "react";

interface FilterDockProps {
  brands: string[];
  search: string;
  onSearchChange: (value: string) => void;
  selectedBrand: string | null;
  onBrandChange: (brand: string | null) => void;
  selectedStyle: string | null;
  onStyleChange: (style: string | null) => void;
  minRating: number;
  onRatingChange: (rating: number) => void;
  resultCount: number;
}

const STYLES = ["Pack", "Cup", "Bowl", "Tray", "Box"];

export default function FilterDock({
  brands,
  search,
  onSearchChange,
  selectedBrand,
  onBrandChange,
  selectedStyle,
  onStyleChange,
  minRating,
  onRatingChange,
  resultCount,
}: FilterDockProps) {
  const [brandOpen, setBrandOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const brandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (brandRef.current && !brandRef.current.contains(e.target as Node)) {
        setBrandOpen(false);
      }
    }
    if (brandOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [brandOpen]);

  const filteredBrands = brandSearch
    ? brands.filter((b) => b.toLowerCase().includes(brandSearch.toLowerCase()))
    : brands;

  const ratingOptions = [3, 3.5, 4, 4.5, 5];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 40,
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRadius: 16,
          padding: "10px 16px",
          boxShadow:
            "0 4px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Search ramen..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: 180,
              height: 36,
              borderRadius: 10,
              border: "1px solid #E5E7EB",
              padding: "0 12px 0 32px",
              fontSize: 13,
              outline: "none",
              backgroundColor: "#F9FAFB",
              color: "#1A1A1A",
            }}
          />
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: "absolute", left: 10, top: 11 }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <div style={{ width: 1, height: 24, backgroundColor: "#E5E7EB" }} />

        {/* Brand dropdown */}
        <div ref={brandRef} style={{ position: "relative" }}>
          <button
            onClick={() => setBrandOpen(!brandOpen)}
            style={{
              height: 36,
              borderRadius: 10,
              border: "1px solid #E5E7EB",
              padding: "0 12px",
              fontSize: 13,
              backgroundColor: selectedBrand ? "#1A1A1A" : "#F9FAFB",
              color: selectedBrand ? "#FFFFFF" : "#6B7280",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
            }}
          >
            {selectedBrand || "Brand"}
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {brandOpen && (
            <div
              style={{
                position: "absolute",
                bottom: 44,
                left: 0,
                width: 220,
                maxHeight: 280,
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
                border: "1px solid #E5E7EB",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ padding: 8 }}>
                <input
                  type="text"
                  placeholder="Filter brands..."
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  autoFocus
                  style={{
                    width: "100%",
                    height: 32,
                    borderRadius: 8,
                    border: "1px solid #E5E7EB",
                    padding: "0 10px",
                    fontSize: 12,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ overflowY: "auto", maxHeight: 230 }}>
                <button
                  onClick={() => {
                    onBrandChange(null);
                    setBrandOpen(false);
                    setBrandSearch("");
                  }}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    fontSize: 12,
                    border: "none",
                    backgroundColor: !selectedBrand ? "#F3F4F6" : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    color: "#1A1A1A",
                    fontWeight: !selectedBrand ? 600 : 400,
                  }}
                >
                  All Brands
                </button>
                {filteredBrands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => {
                      onBrandChange(brand);
                      setBrandOpen(false);
                      setBrandSearch("");
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      fontSize: 12,
                      border: "none",
                      backgroundColor:
                        selectedBrand === brand ? "#F3F4F6" : "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      color: "#1A1A1A",
                      fontWeight: selectedBrand === brand ? 600 : 400,
                    }}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ width: 1, height: 24, backgroundColor: "#E5E7EB" }} />

        {/* Style filter (Pack/Cup/Bowl/Tray/Box) */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {STYLES.map((s) => (
            <button
              key={s}
              onClick={() => onStyleChange(selectedStyle === s ? null : s)}
              style={{
                height: 32,
                borderRadius: 8,
                border: "none",
                padding: "0 10px",
                fontSize: 12,
                backgroundColor: selectedStyle === s ? "#1A1A1A" : "#F9FAFB",
                color: selectedStyle === s ? "#FFFFFF" : "#6B7280",
                cursor: "pointer",
                fontWeight: selectedStyle === s ? 600 : 400,
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 24, backgroundColor: "#E5E7EB" }} />

        {/* Rating filter */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {ratingOptions.map((r) => (
            <button
              key={r}
              onClick={() => onRatingChange(r === minRating ? 0 : r)}
              style={{
                height: 32,
                minWidth: 32,
                borderRadius: 8,
                border: "none",
                padding: "0 8px",
                fontSize: 12,
                backgroundColor: minRating === r ? "#1A1A1A" : "#F9FAFB",
                color: minRating === r ? "#FFFFFF" : "#6B7280",
                cursor: "pointer",
                fontWeight: minRating === r ? 600 : 400,
              }}
            >
              {r}+
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 24, backgroundColor: "#E5E7EB" }} />

        {/* Result count */}
        <span style={{ fontSize: 12, color: "#9CA3AF", whiteSpace: "nowrap" }}>
          {resultCount}
        </span>
      </div>
    </div>
  );
}
