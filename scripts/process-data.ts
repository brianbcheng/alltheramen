import fs from "fs";
import path from "path";
import Papa from "papaparse";

interface CsvRow {
  "Review #": string;
  Brand: string;
  Variety: string;
  Style: string;
  Country: string;
  Stars: string;
  "Top Ten"?: string;
  T?: string;
}

interface RamenProduct {
  id: string;
  reviewNumber: number;
  brand: string;
  variety: string;
  style: string;
  country: string;
  stars: number;
  topTen: string | null;
  imagePath: string | null;
  gridX: number;
  gridY: number;
}

const GRID_COLS = 50;

const csvPath = path.resolve(__dirname, "../data/ramen-ratings.csv");
const manifestPath = path.resolve(
  __dirname,
  "../ramen-image-scraper/output/images-manifest.json"
);
const outPath = path.resolve(__dirname, "../public/data/ramen.json");

// Load image manifest if it exists
let imageManifest: Record<string, { status: string; filename?: string }> = {};
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  imageManifest = manifest.images || {};
  console.log(
    `Loaded image manifest with ${Object.keys(imageManifest).length} entries`
  );
}

const csvContent = fs.readFileSync(csvPath, "utf-8");

const { data } = Papa.parse<CsvRow>(csvContent, {
  header: true,
  skipEmptyLines: true,
});

// Filter to rows with valid numeric Stars (0-5 range)
const filtered = data.filter((row) => {
  const stars = parseFloat(row.Stars);
  return !isNaN(stars) && stars >= 0 && stars <= 5 && row.Brand && row.Variety;
});

// Sort by country, then brand, then variety
filtered.sort((a, b) => {
  const cmp1 = a.Country.localeCompare(b.Country);
  if (cmp1 !== 0) return cmp1;
  const cmp2 = a.Brand.localeCompare(b.Brand);
  if (cmp2 !== 0) return cmp2;
  return a.Variety.localeCompare(b.Variety);
});

// Map to RamenProduct with grid coordinates
const products: RamenProduct[] = filtered.map((row, index) => {
  const style = (row.Style || "Other").trim().toLowerCase();
  const normalizedStyle =
    style.charAt(0).toUpperCase() + style.slice(1);

  const reviewNumber = parseInt(row["Review #"], 10);
  return {
    id: `ramen_${String(index + 1).padStart(4, "0")}`,
    reviewNumber,
    brand: row.Brand.trim(),
    variety: row.Variety.trim(),
    style: normalizedStyle,
    country: row.Country.trim(),
    stars: parseFloat(row.Stars),
    topTen: (row["Top Ten"] || row["T"])?.trim() || null,
    imagePath:
      imageManifest[String(reviewNumber)]?.status === "found"
        ? `/images/ramen/${reviewNumber}.webp`
        : null,
    gridX: index % GRID_COLS,
    gridY: Math.floor(index / GRID_COLS),
  };
});

// Ensure output directory exists
fs.mkdirSync(path.dirname(outPath), { recursive: true });

fs.writeFileSync(outPath, JSON.stringify(products, null, 2));

console.log(
  `Processed ${products.length} products into ${GRID_COLS}x${Math.ceil(products.length / GRID_COLS)} grid`
);
console.log(`Output: ${outPath}`);
