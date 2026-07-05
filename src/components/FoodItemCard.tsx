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
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 flex-col gap-1.5 pr-3">
          <span className="text-sm font-medium leading-tight text-gray-100">
            {name}
          </span>
          <span
            className={`self-start rounded-md px-2 py-0.5 text-[10px] font-semibold ${
              category === "Non-Veg"
                ? "bg-rose-900/30 text-rose-400"
                : "bg-emerald-900/30 text-emerald-400"
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
    </div>
  );
}
