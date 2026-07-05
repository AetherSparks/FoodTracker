"use client";

import { Counter } from "./Counter";
import { useSession } from "@/context/SessionContext";

interface FoodItemCardProps {
  itemId: string;
  name: string;
  category: "Veg" | "Non-Veg";
  defaultPiecesPerUnit: number;
}

export function FoodItemCard({
  itemId,
  name,
  category,
  defaultPiecesPerUnit,
}: FoodItemCardProps) {
  const { items, increment, decrement, setPiecesPerUnit } = useSession();
  const sessionItem = items[itemId];
  const units = sessionItem?.units ?? 0;
  const piecesPerUnit = sessionItem?.piecesPerUnit ?? defaultPiecesPerUnit;

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex flex-1 flex-col gap-1 pr-3">
        <span className="text-sm font-medium leading-tight">{name}</span>
        <span
          className={`self-start rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            category === "Non-Veg"
              ? "bg-red-900/50 text-red-400"
              : "bg-green-900/50 text-green-400"
          }`}
        >
          {category}
        </span>
      </div>
      <Counter
        units={units}
        piecesPerUnit={piecesPerUnit}
        onIncrement={() => increment(itemId, defaultPiecesPerUnit)}
        onDecrement={() => decrement(itemId)}
        onPiecesPerUnitChange={(v) => setPiecesPerUnit(itemId, v)}
      />
    </div>
  );
}
