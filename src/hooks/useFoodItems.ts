"use client";

import { useState, useEffect } from "react";
import { fetchFoodItems } from "@/lib/firestore";
import { seedFoodItems } from "@/lib/seed";
import type { FoodItem } from "@/lib/types";

export function useFoodItems(companyId: string) {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) return;
    let cancelled = false;
    setLoading(true);
    seedFoodItems(companyId).then(() => {
      if (cancelled) return;
      fetchFoodItems(companyId).then((data) => {
        if (!cancelled) {
          setItems(data);
          setLoading(false);
        }
      });
    });
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  return { items, loading };
}
