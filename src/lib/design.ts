/**
 * Infinite Ramen — Design System Tokens
 *
 * Direction: "Clean Catalog" — minimal, editorial, the ramen speaks for itself.
 * Three-typeface editorial pairing:
 *   Bricolage Grotesque → display (product name, section titles, logo)
 *   Hanken Grotesk      → reading (description, metadata values)
 *   Space Mono           → data (uppercase labels, footnote, numbers)
 * One accent red, warm grays, white background.
 */

// ─── Colors ──────────────────────────────────────────────
export const colors = {
  // Warm neutrals (stone-based, not cool blue-grays)
  white: "#FFFFFF",
  gray50: "#FAFAF9",
  gray100: "#F5F5F4",
  gray200: "#E7E5E4",
  gray300: "#D6D3D1",
  gray400: "#A8A29E",
  gray500: "#78716C",
  gray600: "#57534E",
  gray700: "#44403C",
  gray800: "#292524",
  gray900: "#1C1917",

  // Accent — single red, used sparingly
  red: "#E63946",
  redLight: "#FEE2E2",

  // Semantic
  background: "#FFFFFF",
  foreground: "#1C1917",
  muted: "#78716C",
  subtle: "#A8A29E",
  border: "#E7E5E4",
  surface: "#F5F5F4",
} as const;

// ─── Typography ──────────────────────────────────────────
export const type = {
  display: 'var(--font-display)',
  text: 'var(--font-text)',
  mono: 'var(--font-mono)',

  // Scale (modular, base 14)
  size: {
    xs: 11,
    sm: 12,
    base: 13,
    md: 14,
    lg: 16,
    xl: 18,
    "2xl": 24,
    "3xl": 32,
  },

  // Weights
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
  },

  // Line heights
  leading: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.65,
  },
} as const;

// ─── Spacing ─────────────────────────────────────────────
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

// ─── Radii ───────────────────────────────────────────────
export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 16,
  full: 9999,
} as const;

// ─── Shadows ─────────────────────────────────────────────
export const shadows = {
  sm: "0 1px 3px rgba(28,25,23,0.06)",
  md: "0 4px 16px rgba(28,25,23,0.08)",
  lg: "0 8px 32px rgba(28,25,23,0.12)",
  xl: "0 25px 50px rgba(28,25,23,0.15)",
  dock: "0 4px 24px rgba(28,25,23,0.10), 0 0 0 1px rgba(28,25,23,0.05)",
  dropdown: "0 8px 32px rgba(28,25,23,0.14)",
} as const;

// ─── Transitions ─────────────────────────────────────────
export const motion = {
  fast: "0.15s ease",
  normal: "0.25s ease",
  slow: "0.4s ease",
} as const;
