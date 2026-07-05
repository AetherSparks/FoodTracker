"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useFoodItems } from "@/hooks/useFoodItems";
import { listenLeaderboard } from "@/lib/firestore";
import type { LeaderboardEntry, FoodItem } from "@/lib/types";

function resolveItems(
  bestItems: Record<string, { units: number; piecesPerUnit: number }>,
  catalog: FoodItem[]
) {
  const foodMap = new Map(catalog.map((f) => [f.id, f]));
  return Object.entries(bestItems).map(([id, si]) => {
    const food = foodMap.get(id);
    return {
      id,
      name: food?.name ?? id,
      unitType: food?.unitType ?? "piece",
      units: si.units,
      pieces: si.units * si.piecesPerUnit,
    };
  });
}

function LeaderboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const companyId = searchParams.get("company");
  const { user, signOut } = useAuth();
  const { items: catalog } = useFoodItems(companyId ?? "");

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) {
      router.replace("/companies");
      return;
    }
  }, [companyId, router]);

  useEffect(() => {
    if (!companyId) return;
    const unsub = listenLeaderboard(companyId, (data) => {
      setEntries(data);
      setError(null);
    });
    return unsub;
  }, [companyId]);

  const ranks = ["gold", "silver", "bronze"] as const;
  const rankColors = [
    "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
    "text-gray-300 border-gray-400/30 bg-gray-400/10",
    "text-amber-700 border-amber-700/30 bg-amber-700/10",
  ];
  const rankLabels = ["#1", "#2", "#3"];

  if (!companyId) return null;

  return (
    <div className="flex h-screen flex-col bg-gray-950">
      <header className="flex items-center justify-between border-b border-gray-900 px-4 py-3">
        <h1 className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-xl font-black uppercase tracking-tight text-transparent">
          Leaderboard
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/sessions?company=${companyId}`)}
            className="rounded-lg border border-gray-800 bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-gray-400 transition-colors active:bg-gray-800 active:text-gray-200"
          >
            Back
          </button>
          <button
            onClick={signOut}
            className="rounded-lg border border-gray-800 bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-gray-400 transition-colors active:bg-gray-800 active:text-gray-200"
          >
            Exit
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-6">
        {error && (
          <div className="mb-4 mt-4 animate-fade-in rounded-xl border border-red-500/20 bg-red-950/40 p-4 text-sm text-red-400 backdrop-blur-sm">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-3 py-6">
          {entries.map((entry, i) => {
            const isExpanded = expanded === entry.uid;
            const dishes =
              catalog.length > 0
                ? resolveItems(entry.bestItems, catalog)
                : [];
            return (
              <div
                key={entry.uid}
                className={`rounded-xl border ${rankColors[i]} overflow-hidden transition-all`}
              >
                <button
                  onClick={() =>
                    setExpanded(isExpanded ? null : entry.uid)
                  }
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 text-lg font-black ${rankColors[i]}`}
                    >
                      {rankLabels[i]}
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-sm font-bold text-gray-400">
                      {entry.displayName[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">
                        {entry.displayName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {entry.bestDate} &middot; {entry.bestScore} pieces
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-800/50 px-4 py-3">
                    {dishes.length === 0 ? (
                      <p className="text-xs text-gray-500">No dish data</p>
                    ) : (
                      <div className="space-y-1.5">
                        {dishes.map((d, j) => (
                          <div
                            key={d.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-300">{d.name}</span>
                            <span className="text-gray-500">
                              {d.units} {d.unitType}
                              {d.units !== 1 ? "s" : ""} &middot; {d.pieces}{" "}
                              pieces
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {entries.length === 0 && (
          <div className="mt-16 text-center">
            <div className="mb-4 text-5xl">🏆</div>
            <p className="text-sm text-gray-500">
              No leaderboard records yet.
            </p>
            <p className="text-xs text-gray-600">
              Start a session to set the first record!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-gray-950">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
        </div>
      }
    >
      <LeaderboardContent />
    </Suspense>
  );
}
