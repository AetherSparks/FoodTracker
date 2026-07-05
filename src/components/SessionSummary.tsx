"use client";

interface SessionSummaryProps {
  stats: {
    totalUnits: number;
    totalPieces: number;
    vegUnits: number;
    nonVegUnits: number;
  };
}

export function SessionSummary({ stats }: SessionSummaryProps) {
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
      <div className="mt-2 flex gap-4 border-t border-gray-800 pt-2 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="tabular-nums text-emerald-400">{stats.vegUnits}</span>
          <span className="text-gray-500">veg</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-400" />
          <span className="tabular-nums text-rose-400">{stats.nonVegUnits}</span>
          <span className="text-gray-500">non-veg</span>
        </span>
      </div>
    </div>
  );
}
