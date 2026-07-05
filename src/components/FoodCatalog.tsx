"use client";

import { CategoryGroup } from "./CategoryGroup";
import type { CategoryGroup as CategoryGroupType } from "@/lib/types";

interface FoodCatalogProps {
  groups: CategoryGroupType[];
}

export function FoodCatalog({ groups }: FoodCatalogProps) {
  if (groups.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-gray-500">
        No items match your search
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <CategoryGroup key={g.category} category={g.category} items={g.items} />
      ))}
    </div>
  );
}
