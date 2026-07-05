"use client";

import { FoodItemCard } from "./FoodItemCard";
import type { FoodItem } from "@/lib/types";

interface CategoryGroupProps {
  category: string;
  items: FoodItem[];
}

export function CategoryGroup({ category, items }: CategoryGroupProps) {
  return (
    <div className="mb-4">
      <div className="sticky top-[57px] z-10 border-b border-gray-800 bg-gray-950/90 px-4 py-2 backdrop-blur">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
          {category}
        </h2>
      </div>
      <div className="divide-y divide-gray-800/50">
        {items.map((item) => (
          <FoodItemCard key={item.id} itemId={item.id} name={item.name} category={item.category} defaultPiecesPerUnit={item.defaultPiecesPerUnit} />
        ))}
      </div>
    </div>
  );
}
