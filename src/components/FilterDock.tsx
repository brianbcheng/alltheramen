"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface FilterDockProps {
  brands: string[];
  search: string;
  onSearchChange: (value: string) => void;
  selectedBrand: string | null;
  onBrandChange: (brand: string | null) => void;
  minRating: number;
  onRatingChange: (rating: number) => void;
  resultCount: number;
}

export default function FilterDock({
  brands,
  search,
  onSearchChange,
  selectedBrand,
  onBrandChange,
  minRating,
  onRatingChange,
  resultCount,
}: FilterDockProps) {
  const [brandOpen, setBrandOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const brandRef = useRef<HTMLDivElement>(null);

  const [ratingOpen, setRatingOpen] = useState(false);
  const ratingRef = useRef<HTMLDivElement>(null);

  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  const ratingOptions = [3, 3.5, 4, 4.5, 5];
  const ratingLabel = minRating > 0 ? `${minRating}+ Stars` : "Rating";

  // Global hotkeys: / for search, b for brand, r for rating
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore when typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "/") {
        e.preventDefault();
        openSearch();
      } else if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        setBrandOpen((prev) => !prev);
        setRatingOpen(false);
        setSearchFocused(false);
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        setRatingOpen((prev) => !prev);
        setBrandOpen(false);
        setSearchFocused(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (brandRef.current && !brandRef.current.contains(e.target as Node)) {
        setBrandOpen(false);
      }
      if (ratingRef.current && !ratingRef.current.contains(e.target as Node)) {
        setRatingOpen(false);
      }
    }
    if (brandOpen || ratingOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [brandOpen, ratingOpen]);

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

  // Close search on Escape
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
    setBrandOpen(false);
    setRatingOpen(false);
    // Focus after the expansion animation starts
    requestAnimationFrame(() => searchInputRef.current?.focus());
  };

  const showFilters = !searchFocused;

  const kbdStyle: React.CSSProperties = {
    fontSize: 9,
    fontFamily: "system-ui, sans-serif",
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

  const filteredBrands = brandSearch
    ? brands.filter((b) => b.toLowerCase().includes(brandSearch.toLowerCase()))
    : brands;

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
          position: "relative",
        }}
      >
        {/* Center notch with logo */}
        <div
          style={{
            position: "absolute",
            top: -28,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderRadius: "10px 10px 0 0",
            padding: "5px 14px 2px",
            boxShadow:
              "0 -4px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)",
            clipPath: "inset(-20px -1px 0px -1px)",
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "#1A1A1A",
              textTransform: "lowercase",
              fontFamily: "system-ui, -apple-system, sans-serif",
              whiteSpace: "nowrap",
              userSelect: "none",
            }}
          >
            alltheramen
          </span>
        </div>

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

            {/* Brand dropdown */}
            <div ref={brandRef} style={{ position: "relative" }}>
              <button
                onClick={() => {
                  setBrandOpen(!brandOpen);
                  setRatingOpen(false);
                }}
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
                <kbd style={selectedBrand ? kbdActiveStyle : kbdStyle}>B</kbd>
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
                        backgroundColor: !selectedBrand
                          ? "#F3F4F6"
                          : "transparent",
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
                            selectedBrand === brand
                              ? "#F3F4F6"
                              : "transparent",
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

            <div
              style={{ width: 1, height: 24, backgroundColor: "#E5E7EB" }}
            />

            {/* Rating dropdown */}
            <div ref={ratingRef} style={{ position: "relative" }}>
              <button
                onClick={() => {
                  setRatingOpen(!ratingOpen);
                  setBrandOpen(false);
                }}
                style={{
                  height: 36,
                  borderRadius: 10,
                  border: "1px solid #E5E7EB",
                  padding: "0 12px",
                  fontSize: 13,
                  backgroundColor: minRating > 0 ? "#1A1A1A" : "#F9FAFB",
                  color: minRating > 0 ? "#FFFFFF" : "#6B7280",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  whiteSpace: "nowrap",
                }}
              >
                {ratingLabel}
                <kbd style={minRating > 0 ? kbdActiveStyle : kbdStyle}>R</kbd>
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

              {ratingOpen && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 44,
                    left: 0,
                    width: 140,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
                    border: "1px solid #E5E7EB",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ overflowY: "auto" }}>
                    <button
                      onClick={() => {
                        onRatingChange(0);
                        setRatingOpen(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        fontSize: 12,
                        border: "none",
                        backgroundColor:
                          minRating === 0 ? "#F3F4F6" : "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        color: "#1A1A1A",
                        fontWeight: minRating === 0 ? 600 : 400,
                      }}
                    >
                      Any Rating
                    </button>
                    {ratingOptions.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          onRatingChange(r);
                          setRatingOpen(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          fontSize: 12,
                          border: "none",
                          backgroundColor:
                            minRating === r ? "#F3F4F6" : "transparent",
                          cursor: "pointer",
                          textAlign: "left",
                          color: "#1A1A1A",
                          fontWeight: minRating === r ? 600 : 400,
                        }}
                      >
                        {r}+ Stars
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
    </div>
  );
}
