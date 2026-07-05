"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchFoodItems } from "@/lib/firestore";
import { seedFoodItems } from "@/lib/seed";
import type { FoodItem } from "@/lib/types";

export function useFoodItems() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await seedFoodItems();
      const fetched = await fetchFoodItems();
      setItems(fetched);
    } catch (err) {
      console.error("Failed to load food items:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, loading, refresh };
}
