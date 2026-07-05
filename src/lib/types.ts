export interface FoodItem {
  id: string;
  name: string;
  category: string;
}

export interface FoodSession {
  date: string;
  items: Record<string, number>;
}

export interface CategoryGroup {
  category: string;
  items: FoodItem[];
}
