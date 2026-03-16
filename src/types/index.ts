export interface RamenProduct {
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
