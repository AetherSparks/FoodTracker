export type UnitType = "stick" | "piece" | "scoop" | "bowl" | "plate" | "skewer";

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  defaultPiecesPerUnit: number;
  unitType: UnitType;
}

export interface SessionItem {
  units: number;
  piecesPerUnit: number;
}

export interface FoodSession {
  date: string;
  items: Record<string, SessionItem>;
  notes?: string;
}

export interface CategoryGroup {
  category: string;
  items: FoodItem[];
}

export interface Restaurant {
  id: string;
  name: string;
}

export interface LeaderboardEntry {
  id: string;
  uid: string;
  displayName: string;
  photoURL: string;
  bestScore: number;
  bestDate: string;
  bestItems: Record<string, SessionItem>;
}
