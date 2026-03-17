"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FlavorProfile } from "@/lib/flavors";

interface FilterDockProps {
  brands: string[];
  flavors: FlavorProfile[];
  search: string;
  onSearchChange: (value: string) => void;
  selectedBrands: Set<string>;
  onToggleBrand: (brand: string) => void;
  onClearBrands: () => void;
  selectedRatings: Set<number>;
  onToggleRating: (rating: number) => void;
  onClearRatings: () => void;
  selectedFlavors: Set<string>;
  onToggleFlavor: (flavor: string) => void;
  onClearFlavors: () => void;
  resultCount: number;
}

type DropdownId = "brand" | "rating" | "flavor" | null;

export default function FilterDock({
  brands,
  flavors,
  search,
  onSearchChange,
  selectedBrands,
  onToggleBrand,
  onClearBrands,
  selectedRatings,
  onToggleRating,
  onClearRatings,
  selectedFlavors,
  onToggleFlavor,
  onClearFlavors,
  resultCount,
}: FilterDockProps) {
  const [openDropdown, setOpenDropdown] = useState<DropdownId>(null);
  const [brandSearch, setBrandSearch] = useState("");

  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const ratingRef = useRef<HTMLDivElement>(null);
  const flavorRef = useRef<HTMLDivElement>(null);

  const ratingOptions = [1, 2, 3, 4, 5];

  // Labels
  const brandLabel =
    selectedBrands.size === 0
      ? "Brand"
      : selectedBrands.size === 1
        ? Array.from(selectedBrands)[0]
        : `${selectedBrands.size} Brands`;

  const ratingLabel =
    selectedRatings.size === 0
      ? "Rating"
      : selectedRatings.size === 1
        ? `${Array.from(selectedRatings)[0]} Stars`
        : `${selectedRatings.size} Ratings`;

  const flavorLabel =
    selectedFlavors.size === 0
      ? "Flavor"
      : selectedFlavors.size === 1
        ? flavors.find((f) => f.id === Array.from(selectedFlavors)[0])?.label ||
          "Flavor"
        : `${selectedFlavors.size} Flavors`;

  const toggleDropdown = useCallback(
    (id: DropdownId) => {
      setOpenDropdown((prev) => (prev === id ? null : id));
      setSearchFocused(false);
      if (id !== "brand") setBrandSearch("");
    },
    []
  );

  // Global hotkeys
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "/") {
        e.preventDefault();
        openSearch();
      } else if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        toggleDropdown("brand");
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        toggleDropdown("rating");
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleDropdown("flavor");
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        openDropdown === "brand" &&
        brandRef.current &&
        !brandRef.current.contains(target)
      ) {
        setOpenDropdown(null);
        setBrandSearch("");
      }
      if (
        openDropdown === "rating" &&
        ratingRef.current &&
        !ratingRef.current.contains(target)
      ) {
        setOpenDropdown(null);
      }
      if (
        openDropdown === "flavor" &&
        flavorRef.current &&
        !flavorRef.current.contains(target)
      ) {
        setOpenDropdown(null);
      }
    }
    if (openDropdown) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [openDropdown]);

  // Close search on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
        if (!search) setSearchFocused(false);
      }
    }
    if (searchFocused) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [searchFocused, search]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onSearchChange("");
        setSearchFocused(false);
        searchInputRef.current?.blur();
      }
    },
    [onSearchChange]
  );

  const openSearch = () => {
    setSearchFocused(true);
    setOpenDropdown(null);
    requestAnimationFrame(() => searchInputRef.current?.focus());
  };

  const showFilters = !searchFocused;

  const filteredBrands = brandSearch
    ? brands.filter((b) =>
        b.toLowerCase().includes(brandSearch.toLowerCase())
      )
    : brands;

  const kbdStyle: React.CSSProperties = {
    fontSize: 9,
    fontWeight: 500,
    lineHeight: 1,
    padding: "2px 4px",
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.06)",
    color: "#9CA3AF",
    border: "1px solid rgba(0,0,0,0.08)",
    marginLeft: 2,
  };

  const kbdActiveStyle: React.CSSProperties = {
    ...kbdStyle,
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "rgba(255,255,255,0.7)",
    border: "1px solid rgba(255,255,255,0.15)",
  };

  const checkmark = (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1A1A1A"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  const dropdownPanel: React.CSSProperties = {
    position: "absolute",
    bottom: 44,
    left: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
    border: "1px solid #E5E7EB",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  };

  const optionStyle = (isSelected: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "8px 12px",
    fontSize: 12,
    border: "none",
    backgroundColor: isSelected ? "#F3F4F6" : "transparent",
    cursor: "pointer",
    textAlign: "left",
    color: "#1A1A1A",
    fontWeight: isSelected ? 600 : 400,
    display: "flex",
    alignItems: "center",
    gap: 8,
  });

  const chevron = (
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
  );

  const btnStyle = (active: boolean): React.CSSProperties => ({
    height: 36,
    borderRadius: 10,
    border: "1px solid #E5E7EB",
    padding: "0 12px",
    fontSize: 13,
    backgroundColor: active ? "#1A1A1A" : "#F9FAFB",
    color: active ? "#FFFFFF" : "#6B7280",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    whiteSpace: "nowrap",
  });

  const dropdownMotion = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
    transition: { duration: 0.15, ease: "easeOut" as const },
  };

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
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
        ref={dockRef}
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
          transition: "width 0.2s ease",
        }}
      >
        {/* Search icon / expanded search bar */}
        {searchFocused ? (
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              flex: 1,
              minWidth: 280,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ position: "absolute", left: 10, flexShrink: 0 }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search ramen..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              autoFocus
              style={{
                width: "100%",
                height: 36,
                borderRadius: 10,
                border: "1px solid #E5E7EB",
                padding: "0 36px 0 32px",
                fontSize: 13,
                outline: "none",
                backgroundColor: "#F9FAFB",
                color: "#1A1A1A",
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={() => {
                onSearchChange("");
                setSearchFocused(false);
              }}
              style={{
                position: "absolute",
                right: 8,
                border: "none",
                background: "none",
                cursor: "pointer",
                color: "#9CA3AF",
                fontSize: 16,
                lineHeight: 1,
                padding: 2,
                display: "flex",
                alignItems: "center",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={openSearch}
            style={{
              height: 36,
              borderRadius: 10,
              border: search ? "none" : "1px solid #E5E7EB",
              backgroundColor: search ? "#1A1A1A" : "#F9FAFB",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              flexShrink: 0,
              padding: "0 8px",
            }}
            title="Search ( / )"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={search ? "#FFFFFF" : "#9CA3AF"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <kbd style={search ? kbdActiveStyle : kbdStyle}>/</kbd>
          </button>
        )}

        {showFilters && (
          <>
            <div
              style={{ width: 1, height: 24, backgroundColor: "#E5E7EB" }}
            />

            {/* Brand dropdown — multi-select */}
            <div ref={brandRef} style={{ position: "relative" }}>
              <button
                onClick={() => toggleDropdown("brand")}
                style={btnStyle(selectedBrands.size > 0)}
              >
                {brandLabel}
                <kbd
                  style={
                    selectedBrands.size > 0 ? kbdActiveStyle : kbdStyle
                  }
                >
                  B
                </kbd>
                {chevron}
              </button>

              <AnimatePresence>
                {openDropdown === "brand" && (
                  <motion.div {...dropdownMotion} style={{ ...dropdownPanel, width: 220, maxHeight: 280 }}>
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
                      {selectedBrands.size > 0 && (
                        <button
                          onClick={() => {
                            onClearBrands();
                            setBrandSearch("");
                          }}
                          style={{
                            ...optionStyle(false),
                            color: "#E63946",
                            fontWeight: 500,
                          }}
                        >
                          Clear All
                        </button>
                      )}
                      {filteredBrands.map((brand) => {
                        const selected = selectedBrands.has(brand);
                        return (
                          <button
                            key={brand}
                            onClick={() => onToggleBrand(brand)}
                            style={optionStyle(selected)}
                          >
                            <span
                              style={{
                                width: 14,
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              {selected ? checkmark : null}
                            </span>
                            {brand}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div
              style={{ width: 1, height: 24, backgroundColor: "#E5E7EB" }}
            />

            {/* Rating dropdown — multi-select */}
            <div ref={ratingRef} style={{ position: "relative" }}>
              <button
                onClick={() => toggleDropdown("rating")}
                style={btnStyle(selectedRatings.size > 0)}
              >
                {ratingLabel}
                <kbd
                  style={
                    selectedRatings.size > 0 ? kbdActiveStyle : kbdStyle
                  }
                >
                  R
                </kbd>
                {chevron}
              </button>

              <AnimatePresence>
                {openDropdown === "rating" && (
                  <motion.div {...dropdownMotion} style={{ ...dropdownPanel, width: 150 }}>
                    <div style={{ overflowY: "auto" }}>
                      {selectedRatings.size > 0 && (
                        <button
                          onClick={onClearRatings}
                          style={{
                            ...optionStyle(false),
                            color: "#E63946",
                            fontWeight: 500,
                          }}
                        >
                          Clear All
                        </button>
                      )}
                      {ratingOptions.map((r) => {
                        const selected = selectedRatings.has(r);
                        return (
                          <button
                            key={r}
                            onClick={() => onToggleRating(r)}
                            style={optionStyle(selected)}
                          >
                            <span
                              style={{
                                width: 14,
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              {selected ? checkmark : null}
                            </span>
                            {r === 5 ? "5 Stars" : `${r}–${r}.99 Stars`}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div
              style={{ width: 1, height: 24, backgroundColor: "#E5E7EB" }}
            />

            {/* Flavor dropdown — multi-select (AND logic) */}
            <div ref={flavorRef} style={{ position: "relative" }}>
              <button
                onClick={() => toggleDropdown("flavor")}
                style={btnStyle(selectedFlavors.size > 0)}
              >
                {flavorLabel}
                <kbd
                  style={
                    selectedFlavors.size > 0 ? kbdActiveStyle : kbdStyle
                  }
                >
                  F
                </kbd>
                {chevron}
              </button>

              <AnimatePresence>
                {openDropdown === "flavor" && (
                  <motion.div {...dropdownMotion} style={{ ...dropdownPanel, width: 170, maxHeight: 320 }}>
                    <div style={{ overflowY: "auto", maxHeight: 300 }}>
                      {selectedFlavors.size > 0 && (
                        <button
                          onClick={onClearFlavors}
                          style={{
                            ...optionStyle(false),
                            color: "#E63946",
                            fontWeight: 500,
                          }}
                        >
                          Clear All
                        </button>
                      )}
                      {flavors.map((f) => {
                        const selected = selectedFlavors.has(f.id);
                        return (
                          <button
                            key={f.id}
                            onClick={() => onToggleFlavor(f.id)}
                            style={optionStyle(selected)}
                          >
                            <span
                              style={{
                                width: 14,
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              {selected ? checkmark : null}
                            </span>
                            {f.label}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div
              style={{ width: 1, height: 24, backgroundColor: "#E5E7EB" }}
            />

            {/* Result count */}
            <span
              style={{ fontSize: 12, color: "#9CA3AF", whiteSpace: "nowrap" }}
            >
              {resultCount}
            </span>
          </>
        )}
      </div>
    </motion.div>
  );
}
