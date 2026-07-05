"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchFoodItems } from "@/lib/firestore";
import { CategoryGroup } from "./CategoryGroup";
import type { FoodItem, CategoryGroup as CategoryGroupType } from "@/lib/types";

interface FoodCatalogProps {
  refreshKey: number;
}

export function FoodCatalog({ refreshKey }: FoodCatalogProps) {
  const [groups, setGroups] = useState<CategoryGroupType[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const items = await fetchFoodItems();
      const grouped = items.reduce<Record<string, FoodItem[]>>((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      }, {});
      setGroups(
        Object.entries(grouped).map(([category, items]) => ({
          category,
          items,
        }))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems, refreshKey]);

  if (loading) {
    return (
      <div className="flex-1 p-4">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-lg bg-gray-800"
            />
          ))}
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 text-gray-500">
        No food items yet. Add one below!
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-36">
      {groups.map((g) => (
        <CategoryGroup key={g.category} category={g.category} items={g.items} />
      ))}
    </div>
  );
}
