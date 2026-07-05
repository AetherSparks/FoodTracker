"use client";

interface CategoryStat {
  name: string;
  units: number;
  color?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Chicken: "bg-blue-400",
  Seafood: "bg-cyan-400",
  "Veg Grill": "bg-emerald-400",
  "Veg Starters": "bg-lime-400",
  Chaat: "bg-orange-400",
  Desserts: "bg-pink-400",
};

interface SessionSummaryProps {
  stats: {
    totalUnits: number;
    totalPieces: number;
  };
  topCategories: CategoryStat[];
}

export function SessionSummary({ stats, topCategories }: SessionSummaryProps) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/80 px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
          Today&apos;s Intake
        </span>
        <span className="text-2xl font-bold tabular-nums text-amber-400">
          {stats.totalPieces}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="tabular-nums">{stats.totalUnits} units</span>
        <span className="tabular-nums">{stats.totalPieces} pieces</span>
      </div>
      {topCategories.length > 0 && (
        <div className="mt-2 flex gap-4 border-t border-gray-800 pt-2 text-xs">
          {topCategories.map((cat) => (
            <span key={cat.name} className="flex items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  CATEGORY_COLORS[cat.name] ?? "bg-gray-500"
                }`}
              />
              <span className="tabular-nums text-gray-300">{cat.units}</span>
              <span className="text-gray-500">{cat.name}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
