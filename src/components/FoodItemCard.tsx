"use client";

import { Counter } from "./Counter";
import { useSession } from "@/context/SessionContext";
import type { UnitType } from "@/lib/types";

const CATEGORY_COLORS: Record<string, string> = {
  Chicken: "bg-blue-900/30 text-blue-400",
  Seafood: "bg-cyan-900/30 text-cyan-400",
  "Veg Grill": "bg-emerald-900/30 text-emerald-400",
  "Veg Starters": "bg-lime-900/30 text-lime-400",
  Chaat: "bg-orange-900/30 text-orange-400",
  Desserts: "bg-pink-900/30 text-pink-400",
};

interface FoodItemCardProps {
  itemId: string;
  name: string;
  category: string;
  defaultPiecesPerUnit: number;
  unitType: UnitType;
}

export function FoodItemCard({
  itemId,
  name,
  category,
  defaultPiecesPerUnit,
  unitType,
}: FoodItemCardProps) {
  const { items, increment, decrement, setPiecesPerUnit } = useSession();
  const sessionItem = items[itemId];
  const units = sessionItem?.units ?? 0;
  const piecesPerUnit = sessionItem?.piecesPerUnit ?? defaultPiecesPerUnit;
  const badgeColor =
    CATEGORY_COLORS[category] ?? "bg-gray-800 text-gray-400";

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 flex-col gap-1.5 pr-3">
          <span className="text-sm font-medium leading-tight text-gray-100">
            {name}
          </span>
          <span className={`self-start rounded-md px-2 py-0.5 text-[10px] font-semibold ${badgeColor}`}>
            {category}
          </span>
        </div>
        <Counter
          units={units}
          piecesPerUnit={piecesPerUnit}
          unitType={unitType}
          onIncrement={() => increment(itemId, defaultPiecesPerUnit)}
          onDecrement={() => decrement(itemId)}
          onPiecesPerUnitChange={(v) => setPiecesPerUnit(itemId, v)}
        />
      </div>
    </div>
  );
}
