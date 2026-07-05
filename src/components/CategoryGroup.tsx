"use client";

import { FoodItemCard } from "./FoodItemCard";
import type { FoodItem } from "@/lib/types";

interface CategoryGroupProps {
  category: string;
  items: FoodItem[];
}

export function CategoryGroup({ category, items }: CategoryGroupProps) {
  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-gray-800 bg-gray-950 px-4 py-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            {category}
          </h2>
          <span className="text-[11px] font-medium tabular-nums text-gray-500">
            {items.length}
          </span>
        </div>
      </div>
      <div className="space-y-2 px-0.5 py-2">
        {items.map((item) => (
          <FoodItemCard
            key={item.id}
            itemId={item.id}
            name={item.name}
            category={item.category}
            defaultPiecesPerUnit={item.defaultPiecesPerUnit}
          />
        ))}
      </div>
    </div>
  );
}
