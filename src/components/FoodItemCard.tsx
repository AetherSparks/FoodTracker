"use client";

import { Counter } from "./Counter";
import { useSession } from "@/context/SessionContext";

interface FoodItemCardProps {
  itemId: string;
  name: string;
}

export function FoodItemCard({ itemId, name }: FoodItemCardProps) {
  const { items, increment, decrement } = useSession();
  const count = items[itemId] ?? 0;

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="flex-1 text-sm font-medium">{name}</span>
      <Counter
        count={count}
        onIncrement={() => increment(itemId)}
        onDecrement={() => decrement(itemId)}
      />
    </div>
  );
}
