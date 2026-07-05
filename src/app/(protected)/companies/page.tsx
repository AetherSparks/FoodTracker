"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  listRestaurants,
  seedDefaultRestaurant,
} from "@/lib/firestore";
import type { Restaurant } from "@/lib/types";

export default function CompaniesPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    seedDefaultRestaurant()
      .then(() => listRestaurants())
      .then(setRestaurants)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const openCompany = (id: string) => {
    router.push(`/sessions?company=${id}`);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <div className="absolute h-full w-full animate-ping rounded-full bg-amber-500/20" />
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent shadow-lg shadow-amber-500/20" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-950">
      <header className="flex items-center justify-between border-b border-gray-900 px-4 py-3">
        <h1 className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-xl font-black uppercase tracking-tight text-transparent">
          Choose Restaurant
        </h1>
        <button
          onClick={signOut}
          className="rounded-lg border border-gray-800 bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-gray-400 transition-colors active:bg-gray-800 active:text-gray-200"
        >
          Exit
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="space-y-3 py-6">
          {restaurants.map((r) => (
            <button
              key={r.id}
              onClick={() => openCompany(r.id)}
              className="w-full rounded-xl border border-gray-800 bg-gray-900/50 p-5 text-left transition-colors active:bg-gray-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{r.name}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{r.id}</p>
                </div>
                <span className="text-sm font-medium text-amber-400">
                  Select &rarr;
                </span>
              </div>
            </button>
          ))}
        </div>

        {restaurants.length === 0 && (
          <p className="mt-8 text-center text-sm text-gray-500">
            No restaurants available.
          </p>
        )}
      </main>
    </div>
  );
}
