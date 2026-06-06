"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FlavorProfile } from "@/lib/flavors";

interface FilterDockProps {
  brands: string[];
  flavors: FlavorProfile[];
  countries: string[];
  ratings: number[];
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
  selectedCountries: Set<string>;
  onToggleCountry: (country: string) => void;
  onClearCountries: () => void;
  resultCount: number;
}

type DropdownId = "brand" | "rating" | "flavor" | "country" | null;

export default function FilterDock({
  brands,
  flavors,
  countries,
  ratings,
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
  selectedCountries,
  onToggleCountry,
  onClearCountries,
  resultCount,
}: FilterDockProps) {
  const [openDropdown, setOpenDropdown] = useState<DropdownId>(null);
  const [brandSearch, setBrandSearch] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Desktop states
  const [searchFocused, setSearchFocused] = useState(false);

  // Mobile states
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const ratingRef = useRef<HTMLDivElement>(null);
  const flavorRef = useRef<HTMLDivElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);

  // Detect mobile viewport
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const activeFilterCount =
    selectedBrands.size + selectedRatings.size + selectedFlavors.size + selectedCountries.size;

  const ratingOptions = ratings;

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

  const countryLabel =
    selectedCountries.size === 0
      ? "Country"
      : selectedCountries.size === 1
        ? Array.from(selectedCountries)[0]
        : `${selectedCountries.size} Countries`;

  const toggleDropdown = useCallback(
    (id: DropdownId) => {
      setOpenDropdown((prev) => (prev === id ? null : id));
      setSearchFocused(false);
      if (id !== "brand") setBrandSearch("");
      if (id !== "country") setCountrySearch("");
    },
    []
  );

  // Global hotkeys (desktop only — mobile has no physical keyboard)
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
      } else if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        toggleDropdown("country");
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close dropdown on outside click (desktop)
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
      if (
        openDropdown === "country" &&
        countryRef.current &&
        !countryRef.current.contains(target)
      ) {
        setOpenDropdown(null);
        setCountrySearch("");
      }
    }
    if (openDropdown && !isMobile) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [openDropdown, isMobile]);

  // Close desktop search on outside click
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
    if (isMobile) {
      setMobileSearchOpen(true);
      requestAnimationFrame(() => mobileSearchInputRef.current?.focus());
    } else {
      setSearchFocused(true);
      setOpenDropdown(null);
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  };

  const showDesktopFilters = !searchFocused && !isMobile;

  const filteredBrands = brandSearch
    ? brands.filter((b) =>
        b.toLowerCase().includes(brandSearch.toLowerCase())
      )
    : brands;

  const filteredCountries = countrySearch
    ? countries.filter((c) =>
        c.toLowerCase().includes(countrySearch.toLowerCase())
      )
    : countries;

  // ─── Shared styles ─────────────────────────────────────
  const kbdStyle: React.CSSProperties = {
    fontSize: 9,
    fontWeight: 500,
    lineHeight: 1,
    padding: "2px 4px",
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.06)",
    color: "#A8A29E",
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
      stroke="#1C1917"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  const whiteCheckmark = (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FFFFFF"
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
    border: "1px solid #E7E5E4",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  };

  const optionStyle = (isSelected: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "8px 12px",
    fontSize: 12,
    border: "none",
    backgroundColor: isSelected ? "#F5F5F4" : "transparent",
    cursor: "pointer",
    textAlign: "left",
    color: "#1C1917",
    fontWeight: isSelected ? 600 : 400,
    display: "flex",
    alignItems: "center",
    gap: 8,
  });

  // Mobile chip style for filter options
  const chipStyle = (selected: boolean): React.CSSProperties => ({
    padding: "8px 14px",
    borderRadius: 20,
    border: selected ? "1.5px solid #1C1917" : "1px solid #D6D3D1",
    backgroundColor: selected ? "#1C1917" : "transparent",
    color: selected ? "#FFFFFF" : "#44403C",
    fontSize: 13,
    fontWeight: selected ? 500 : 400,
    cursor: "pointer",
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
  });

  // Mobile list option style
  const mobileListOption = (isSelected: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "11px 16px",
    fontSize: 14,
    border: "none",
    backgroundColor: isSelected ? "#F5F5F4" : "transparent",
    cursor: "pointer",
    textAlign: "left",
    color: "#1C1917",
    fontWeight: isSelected ? 600 : 400,
    display: "flex",
    alignItems: "center",
    gap: 10,
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
    border: "1px solid #E7E5E4",
    padding: "0 12px",
    fontSize: 13,
    backgroundColor: active ? "#1C1917" : "#F5F5F4",
    color: active ? "#FFFFFF" : "#78716C",
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

  const searchIcon = (color: string) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );

  const closeIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  const filterIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="20" y2="12" />
      <line x1="12" y1="18" x2="20" y2="18" />
    </svg>
  );

  // ─── Bottom sheet backdrop + handle ────────────────────
  const sheetBackdrop = (onClick: () => void) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.2)",
        zIndex: 59,
      }}
    />
  );

  const sheetHandle = (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 10, paddingBottom: 6 }}>
      <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "#D6D3D1" }} />
    </div>
  );

  const clearAllFilters = () => {
    onClearBrands();
    onClearRatings();
    onClearFlavors();
    onClearCountries();
    setBrandSearch("");
    setCountrySearch("");
  };

  return (
    <>
      {/* ═══ Mobile: Search bottom sheet ═══ */}
      <AnimatePresence>
        {isMobile && mobileSearchOpen && (
          <>
            {sheetBackdrop(() => setMobileSearchOpen(false))}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 300 }}
              style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 60,
                backgroundColor: "#FFFFFF",
                borderRadius: "16px 16px 0 0",
                boxShadow: "0 -4px 24px rgba(0,0,0,0.1)",
              }}
            >
              {sheetHandle}
              <div style={{ padding: "4px 20px 20px" }}>
                {/* Search input */}
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <div style={{ position: "absolute", left: 12 }}>{searchIcon("#A8A29E")}</div>
                  <input
                    ref={mobileSearchInputRef}
                    type="text"
                    placeholder="Search by brand or variety..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        mobileSearchInputRef.current?.blur();
                        setMobileSearchOpen(false);
                      }
                    }}
                    autoFocus
                    style={{
                      width: "100%",
                      height: 44,
                      borderRadius: 12,
                      border: "1px solid #E7E5E4",
                      padding: "0 40px 0 38px",
                      fontSize: 16,
                      outline: "none",
                      backgroundColor: "#F5F5F4",
                      color: "#1C1917",
                      boxSizing: "border-box",
                    }}
                  />
                  {search && (
                    <button
                      onClick={() => onSearchChange("")}
                      style={{
                        position: "absolute",
                        right: 10,
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        color: "#A8A29E",
                        padding: 4,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {closeIcon}
                    </button>
                  )}
                </div>
                <div style={{ padding: "14px 0 4px", color: "#A8A29E", fontSize: 13, textAlign: "center" }}>
                  {search ? `${resultCount} results` : "Search for ramen by brand or variety"}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ Mobile: Filter bottom sheet ═══ */}
      <AnimatePresence>
        {isMobile && mobileFiltersOpen && (
          <>
            {sheetBackdrop(() => {
              setMobileFiltersOpen(false);
              setBrandSearch("");
              setCountrySearch("");
            })}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 300 }}
              style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                maxHeight: "80vh",
                zIndex: 60,
                backgroundColor: "#FFFFFF",
                borderRadius: "16px 16px 0 0",
                boxShadow: "0 -4px 24px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {sheetHandle}

              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "4px 20px 12px",
                  borderBottom: "1px solid #F5F5F4",
                }}
              >
                <span style={{ fontSize: 17, fontWeight: 600, color: "#1C1917" }}>Filters</span>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        color: "#E63946",
                        fontSize: 13,
                        fontWeight: 500,
                        padding: 0,
                      }}
                    >
                      Clear all
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setMobileFiltersOpen(false);
                      setBrandSearch("");
                      setCountrySearch("");
                    }}
                    style={{
                      border: "none",
                      backgroundColor: "#1C1917",
                      color: "#FFFFFF",
                      borderRadius: 8,
                      padding: "8px 16px",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Done{resultCount > 0 ? ` · ${resultCount}` : ""}
                  </button>
                </div>
              </div>

              {/* Scrollable filter content */}
              <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
                {/* ── Rating ── */}
                <div style={{ padding: "16px 20px 12px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#78716C", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
                    Rating
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {ratingOptions.map((r) => {
                      const sel = selectedRatings.has(r);
                      return (
                        <button key={r} onClick={() => onToggleRating(r)} style={chipStyle(sel)}>
                          {sel && whiteCheckmark}
                          {r === 5 ? "5 ★" : `${r}–${r}.9 ★`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Flavor ── */}
                <div style={{ padding: "8px 20px 12px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#78716C", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
                    Flavor
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {flavors.map((f) => {
                      const sel = selectedFlavors.has(f.id);
                      return (
                        <button key={f.id} onClick={() => onToggleFlavor(f.id)} style={chipStyle(sel)}>
                          {sel && whiteCheckmark}
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Country ── */}
                <div style={{ padding: "8px 20px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#78716C", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Country
                    </span>
                    {selectedCountries.size > 0 && (
                      <button
                        onClick={() => { onClearCountries(); setCountrySearch(""); }}
                        style={{ border: "none", background: "none", cursor: "pointer", color: "#E63946", fontSize: 12, fontWeight: 500, padding: 0 }}
                      >
                        Clear ({selectedCountries.size})
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Search countries..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    style={{
                      width: "100%",
                      height: 38,
                      borderRadius: 10,
                      border: "1px solid #E7E5E4",
                      padding: "0 12px",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                      marginBottom: 4,
                    }}
                  />
                  <div style={{ maxHeight: 180, overflowY: "auto", margin: "0 -20px", padding: "0 4px" }}>
                    {filteredCountries.map((c) => {
                      const sel = selectedCountries.has(c);
                      return (
                        <button key={c} onClick={() => onToggleCountry(c)} style={mobileListOption(sel)}>
                          <span style={{ width: 16, display: "flex", justifyContent: "center" }}>
                            {sel ? checkmark : null}
                          </span>
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Brand ── */}
                <div style={{ padding: "8px 20px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#78716C", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Brand
                    </span>
                    {selectedBrands.size > 0 && (
                      <button
                        onClick={() => { onClearBrands(); setBrandSearch(""); }}
                        style={{ border: "none", background: "none", cursor: "pointer", color: "#E63946", fontSize: 12, fontWeight: 500, padding: 0 }}
                      >
                        Clear ({selectedBrands.size})
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Search brands..."
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    style={{
                      width: "100%",
                      height: 38,
                      borderRadius: 10,
                      border: "1px solid #E7E5E4",
                      padding: "0 12px",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                      marginBottom: 4,
                    }}
                  />
                  <div style={{ maxHeight: 180, overflowY: "auto", margin: "0 -20px", padding: "0 4px" }}>
                    {filteredBrands.map((b) => {
                      const sel = selectedBrands.has(b);
                      return (
                        <button key={b} onClick={() => onToggleBrand(b)} style={mobileListOption(sel)}>
                          <span style={{ width: 16, display: "flex", justifyContent: "center" }}>
                            {sel ? checkmark : null}
                          </span>
                          {b}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ Dock bar ═══ */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          zIndex: 40,
          pointerEvents: "none",
        }}
      >
        <motion.div
          ref={dockRef}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
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
              "0 4px 24px rgba(28,25,23,0.10), 0 0 0 1px rgba(28,25,23,0.05)",
            pointerEvents: "auto",
            position: "relative",
          }}
        >
          {/* Center notch with logo — hidden on mobile */}
          {!isMobile && (
            <div
              style={{
                position: "absolute",
                top: -30,
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderRadius: "12px 12px 0 0",
                padding: "6px 24px 2px",
                boxShadow:
                  "0 -4px 16px rgba(28,25,23,0.06), 0 0 0 1px rgba(28,25,23,0.05)",
                clipPath: "inset(-20px -1px 0px -1px)",
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "#1C1917",
                  whiteSpace: "nowrap",
                  userSelect: "none",
                }}
              >
                infinite ramen
              </span>
            </div>
          )}

          {/* ─── Mobile dock ─── */}
          {isMobile && (
            <>
              {/* Search button / active search pill */}
              {search ? (
                <div
                  style={{
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: "#1C1917",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "0 6px 0 10px",
                    cursor: "pointer",
                  }}
                >
                  <div
                    onClick={() => setMobileSearchOpen(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {searchIcon("#FFFFFF")}
                    <span style={{
                      fontSize: 12,
                      color: "#FFFFFF",
                      maxWidth: 90,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {search}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSearchChange("");
                    }}
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      color: "rgba(255,255,255,0.6)",
                      padding: 4,
                      display: "flex",
                      alignItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setMobileSearchOpen(true)}
                  style={{
                    height: 36,
                    borderRadius: 10,
                    border: "1px solid #E7E5E4",
                    backgroundColor: "#F5F5F4",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    padding: "0 10px",
                    gap: 6,
                  }}
                >
                  {searchIcon("#A8A29E")}
                </button>
              )}

              <div style={{ width: 1, height: 24, backgroundColor: "#E7E5E4" }} />

              {/* Filter button / active filter pill */}
              {activeFilterCount > 0 ? (
                <div
                  style={{
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: "#1C1917",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "0 6px 0 10px",
                    cursor: "pointer",
                  }}
                >
                  <div
                    onClick={() => setMobileFiltersOpen(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      color: "#FFFFFF",
                    }}
                  >
                    {filterIcon}
                    <span style={{ fontSize: 12, color: "#FFFFFF", fontWeight: 500 }}>
                      {activeFilterCount}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAllFilters();
                    }}
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      color: "rgba(255,255,255,0.6)",
                      padding: 4,
                      display: "flex",
                      alignItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  style={{
                    ...btnStyle(false),
                    padding: "0 10px",
                  }}
                >
                  {filterIcon}
                </button>
              )}

              <div style={{ width: 1, height: 24, backgroundColor: "#E7E5E4" }} />

              {/* Result count + info */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, position: "relative" }}>
                <span style={{ fontSize: 12, color: "#A8A29E", whiteSpace: "nowrap" }}>
                  {resultCount}
                </span>
                <div
                  onClick={() => setShowInfo((prev) => !prev)}
                  style={{ position: "relative", display: "flex", alignItems: "center", cursor: "pointer" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <AnimatePresence>
                    {showInfo && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        style={{
                          position: "absolute",
                          bottom: 24,
                          right: 0,
                          width: 220,
                          backgroundColor: "#FFFFFF",
                          borderRadius: 10,
                          boxShadow: "0 8px 32px rgba(28,25,23,0.14)",
                          border: "1px solid #E7E5E4",
                          padding: "12px 14px",
                          fontSize: 12,
                          lineHeight: 1.5,
                          color: "#57534E",
                          zIndex: 50,
                        }}
                      >
                        Explore all the instant ramens in the world. Data and images sourced from{" "}
                        <a href="https://www.theramenrater.com" target="_blank" rel="noopener noreferrer" style={{ color: "#1C1917", fontWeight: 600, textDecoration: "underline" }}>
                          The Ramen Rater
                        </a>.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </>
          )}

          {/* ─── Desktop: search + inline filters ─── */}
          {!isMobile && (
            <>
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
                  <div style={{ position: "absolute", left: 10 }}>{searchIcon("#A8A29E")}</div>
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
                      border: "1px solid #E7E5E4",
                      padding: "0 36px 0 32px",
                      fontSize: 13,
                      outline: "none",
                      backgroundColor: "#F5F5F4",
                      color: "#1C1917",
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
                      color: "#A8A29E",
                      fontSize: 16,
                      lineHeight: 1,
                      padding: 2,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {closeIcon}
                  </button>
                </div>
              ) : (
                <button
                  onClick={openSearch}
                  style={{
                    height: 36,
                    borderRadius: 10,
                    border: search ? "none" : "1px solid #E7E5E4",
                    backgroundColor: search ? "#1C1917" : "#F5F5F4",
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
                  {searchIcon(search ? "#FFFFFF" : "#A8A29E")}
                  <kbd style={search ? kbdActiveStyle : kbdStyle}>/</kbd>
                </button>
              )}
            </>
          )}

          {/* Desktop: inline filter buttons */}
          {showDesktopFilters && (
            <>
              <div style={{ width: 1, height: 24, backgroundColor: "#E7E5E4" }} />

              {/* Country dropdown */}
              <div ref={countryRef} style={{ position: "relative" }}>
                <button onClick={() => toggleDropdown("country")} style={btnStyle(selectedCountries.size > 0)}>
                  {countryLabel}
                  <kbd style={selectedCountries.size > 0 ? kbdActiveStyle : kbdStyle}>C</kbd>
                  {chevron}
                </button>
                <AnimatePresence>
                  {openDropdown === "country" && (
                    <motion.div {...dropdownMotion} style={{ ...dropdownPanel, width: 200, maxHeight: 280 }}>
                      <div style={{ padding: 8 }}>
                        <input type="text" placeholder="Filter countries..." value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} autoFocus style={{ width: "100%", height: 32, borderRadius: 8, border: "1px solid #E7E5E4", padding: "0 10px", fontSize: 12, outline: "none", boxSizing: "border-box" }} />
                      </div>
                      <div style={{ overflowY: "auto", maxHeight: 230 }}>
                        {selectedCountries.size > 0 && (
                          <button onClick={() => { onClearCountries(); setCountrySearch(""); }} style={{ ...optionStyle(false), color: "#E63946", fontWeight: 500 }}>Clear All</button>
                        )}
                        {filteredCountries.map((c) => {
                          const sel = selectedCountries.has(c);
                          return (
                            <button key={c} onClick={() => onToggleCountry(c)} style={optionStyle(sel)}>
                              <span style={{ width: 14, display: "flex", justifyContent: "center" }}>{sel ? checkmark : null}</span>
                              {c}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div style={{ width: 1, height: 24, backgroundColor: "#E7E5E4" }} />

              {/* Brand dropdown */}
              <div ref={brandRef} style={{ position: "relative" }}>
                <button onClick={() => toggleDropdown("brand")} style={btnStyle(selectedBrands.size > 0)}>
                  {brandLabel}
                  <kbd style={selectedBrands.size > 0 ? kbdActiveStyle : kbdStyle}>B</kbd>
                  {chevron}
                </button>
                <AnimatePresence>
                  {openDropdown === "brand" && (
                    <motion.div {...dropdownMotion} style={{ ...dropdownPanel, width: 220, maxHeight: 280 }}>
                      <div style={{ padding: 8 }}>
                        <input type="text" placeholder="Filter brands..." value={brandSearch} onChange={(e) => setBrandSearch(e.target.value)} autoFocus style={{ width: "100%", height: 32, borderRadius: 8, border: "1px solid #E7E5E4", padding: "0 10px", fontSize: 12, outline: "none", boxSizing: "border-box" }} />
                      </div>
                      <div style={{ overflowY: "auto", maxHeight: 230 }}>
                        {selectedBrands.size > 0 && (
                          <button onClick={() => { onClearBrands(); setBrandSearch(""); }} style={{ ...optionStyle(false), color: "#E63946", fontWeight: 500 }}>Clear All</button>
                        )}
                        {filteredBrands.map((b) => {
                          const sel = selectedBrands.has(b);
                          return (
                            <button key={b} onClick={() => onToggleBrand(b)} style={optionStyle(sel)}>
                              <span style={{ width: 14, display: "flex", justifyContent: "center" }}>{sel ? checkmark : null}</span>
                              {b}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div style={{ width: 1, height: 24, backgroundColor: "#E7E5E4" }} />

              {/* Flavor dropdown */}
              <div ref={flavorRef} style={{ position: "relative" }}>
                <button onClick={() => toggleDropdown("flavor")} style={btnStyle(selectedFlavors.size > 0)}>
                  {flavorLabel}
                  <kbd style={selectedFlavors.size > 0 ? kbdActiveStyle : kbdStyle}>F</kbd>
                  {chevron}
                </button>
                <AnimatePresence>
                  {openDropdown === "flavor" && (
                    <motion.div {...dropdownMotion} style={{ ...dropdownPanel, width: 170, maxHeight: 320 }}>
                      <div style={{ overflowY: "auto", maxHeight: 300 }}>
                        {selectedFlavors.size > 0 && (
                          <button onClick={onClearFlavors} style={{ ...optionStyle(false), color: "#E63946", fontWeight: 500 }}>Clear All</button>
                        )}
                        {flavors.map((f) => {
                          const sel = selectedFlavors.has(f.id);
                          return (
                            <button key={f.id} onClick={() => onToggleFlavor(f.id)} style={optionStyle(sel)}>
                              <span style={{ width: 14, display: "flex", justifyContent: "center" }}>{sel ? checkmark : null}</span>
                              {f.label}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div style={{ width: 1, height: 24, backgroundColor: "#E7E5E4" }} />

              {/* Rating dropdown */}
              <div ref={ratingRef} style={{ position: "relative" }}>
                <button onClick={() => toggleDropdown("rating")} style={btnStyle(selectedRatings.size > 0)}>
                  {ratingLabel}
                  <kbd style={selectedRatings.size > 0 ? kbdActiveStyle : kbdStyle}>R</kbd>
                  {chevron}
                </button>
                <AnimatePresence>
                  {openDropdown === "rating" && (
                    <motion.div {...dropdownMotion} style={{ ...dropdownPanel, width: 150 }}>
                      <div style={{ overflowY: "auto" }}>
                        {selectedRatings.size > 0 && (
                          <button onClick={onClearRatings} style={{ ...optionStyle(false), color: "#E63946", fontWeight: 500 }}>Clear All</button>
                        )}
                        {ratingOptions.map((r) => {
                          const sel = selectedRatings.has(r);
                          return (
                            <button key={r} onClick={() => onToggleRating(r)} style={optionStyle(sel)}>
                              <span style={{ width: 14, display: "flex", justifyContent: "center" }}>{sel ? checkmark : null}</span>
                              {r === 5 ? "5 Stars" : `${r}–${r}.99 Stars`}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div style={{ width: 1, height: 24, backgroundColor: "#E7E5E4" }} />

              {/* Result count + info icon */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, position: "relative" }}>
                <span style={{ fontSize: 12, color: "#A8A29E", whiteSpace: "nowrap" }}>{resultCount}</span>
                <div
                  onMouseEnter={() => setShowInfo(true)}
                  onMouseLeave={() => setShowInfo(false)}
                  style={{ position: "relative", display: "flex", alignItems: "center", cursor: "pointer" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A8A29E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <AnimatePresence>
                    {showInfo && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        style={{
                          position: "absolute",
                          bottom: 24,
                          right: 0,
                          width: 240,
                          backgroundColor: "#FFFFFF",
                          borderRadius: 10,
                          boxShadow: "0 8px 32px rgba(28,25,23,0.14)",
                          border: "1px solid #E7E5E4",
                          padding: "12px 14px",
                          fontSize: 12,
                          lineHeight: 1.5,
                          color: "#57534E",
                          zIndex: 50,
                        }}
                      >
                        Explore all the instant ramens in the world. Data and images sourced from{" "}
                        <a href="https://www.theramenrater.com" target="_blank" rel="noopener noreferrer" style={{ color: "#1C1917", fontWeight: 600, textDecoration: "underline" }}>
                          The Ramen Rater
                        </a>.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </>
  );
}
