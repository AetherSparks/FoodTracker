export interface FoodItem {
  id: string;
  name: string;
  category: "Veg" | "Non-Veg";
  defaultPiecesPerUnit: number;
}

export interface SessionItem {
  units: number;
  piecesPerUnit: number;
}

export interface FoodSession {
  date: string;
  items: Record<string, SessionItem>;
}

export interface CategoryGroup {
  category: string;
  items: FoodItem[];
}
