"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";
import { useAuth } from "@/context/AuthContext";
import { useFoodItems } from "@/hooks/useFoodItems";
import { SessionSummary } from "@/components/SessionSummary";
import { CategoryFilter, type Filter } from "@/components/CategoryFilter";
import { SearchBar } from "@/components/SearchBar";
import { FoodCatalog } from "@/components/FoodCatalog";
import { SessionNotes } from "@/components/SessionNotes";
import { CATEGORY_ORDER } from "@/lib/constants";
import type {
  FoodItem,
  CategoryGroup as CategoryGroupType,
} from "@/lib/types";

function TrackPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const companyId = searchParams.get("company");
  const date = searchParams.get("date");
  const {
    session,
    loading: sessionLoading,
    error,
    items: sessionItems,
    loadSession,
  } = useSession();
  const { user, signOut } = useAuth();
  const { items: foodItems, loading: catalogLoading } =
    useFoodItems(companyId ?? "");

  useEffect(() => {
    if (!companyId) {
      router.replace("/companies");
      return;
    }
    if (!date) {
      router.replace(`/sessions?company=${companyId}`);
      return;
    }
    loadSession(companyId, date);
  }, [companyId, date, loadSession, router]);

  const [filter, setFilter] = useState<Filter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const allCategories = useMemo(() => {
    return [...new Set(foodItems.map((f) => f.category))].sort(
      (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b)
    );
  }, [foodItems]);

  const topCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    const foodMap = new Map(foodItems.map((f) => [f.id, f]));
    for (const [itemId, si] of Object.entries(sessionItems)) {
      const food = foodMap.get(itemId);
      if (food) {
        counts[food.category] = (counts[food.category] ?? 0) + si.units;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, units]) => ({ name, units }));
  }, [sessionItems, foodItems]);

  const stats = useMemo(() => {
    let totalUnits = 0;
    let totalPieces = 0;
    for (const si of Object.values(sessionItems)) {
      totalUnits += si.units;
      totalPieces += si.units * si.piecesPerUnit;
    }
    return { totalUnits, totalPieces };
  }, [sessionItems]);

  const filteredGroups: CategoryGroupType[] = useMemo(() => {
    let result: FoodItem[] = foodItems;

    if (filter !== "all") {
      result = result.filter((item) => item.category === filter);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((item) => item.name.toLowerCase().includes(q));
    }

    const grouped = result.reduce<Record<string, FoodItem[]>>((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([category, items]) => ({ category, items }))
      .sort(
        (a, b) =>
          CATEGORY_ORDER.indexOf(a.category) -
          CATEGORY_ORDER.indexOf(b.category)
      );
  }, [foodItems, filter, searchQuery]);

  const loading = sessionLoading || catalogLoading;

  if (loading) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center bg-gray-950">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <div className="absolute h-full w-full animate-ping rounded-full bg-amber-500/20" />
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent shadow-lg shadow-amber-500/20" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-950">
      <header className="sticky top-0 z-30 border-b border-gray-900 bg-gray-950/95 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-xl font-black uppercase tracking-tight text-transparent">
            Absolute Tracker
          </h1>
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex flex-col items-end">
                <span className="max-w-[120px] truncate text-xs font-semibold text-gray-300">
                  {user.displayName?.split(" ")[0]}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                  <span className="h-1 w-1 rounded-full bg-emerald-400" /> Active
                </span>
              </div>
            )}
            <button
              onClick={() =>
                router.push(`/sessions?company=${companyId}`)
              }
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
        </div>
        {session && (
          <div className="flex items-center justify-between border-t border-gray-900 bg-gray-900/40 px-4 py-1.5 text-[11px] font-medium tracking-wide text-gray-500">
            <span>ABSOLUTE BARBECUE</span>
            <span>{session.date}</span>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-6">
        {error && (
          <div className="mb-4 mt-4 animate-fade-in rounded-xl border border-red-500/20 bg-red-950/40 p-4 text-sm text-red-400 backdrop-blur-sm">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-4 py-4">
          <SessionSummary stats={stats} topCategories={topCategories} />

          <div className="space-y-3">
            <CategoryFilter
              active={filter}
              onChange={setFilter}
              categories={allCategories}
            />
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          <FoodCatalog groups={filteredGroups} />

          <SessionNotes />
        </div>
      </main>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-gray-950">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
        </div>
      }
    >
      <TrackPageContent />
    </Suspense>
  );
}
