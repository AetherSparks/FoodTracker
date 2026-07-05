"use client";

import { useState } from "react";
import { FoodCatalog } from "@/components/FoodCatalog";
import { AddMissingItemForm } from "@/components/AddMissingItemForm";
import { SessionStarter } from "@/components/SessionStarter";
import { useSession } from "@/context/SessionContext";
import { useAuth } from "@/context/AuthContext";

export default function TrackPage() {
  const { hasSession, loading, session, error } = useSession();
  const { user, signOut } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-gray-800 bg-gray-950/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-amber-400">Absolute Tracker</h1>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-gray-400 sm:block">
              {user?.displayName}
            </span>
            <button
              onClick={signOut}
              className="text-xs text-gray-500 underline-offset-2 hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>
        {session && (
          <div className="px-4 pb-2 text-xs text-gray-500">
            Session: {session.date}
          </div>
        )}
      </header>

      {error && (
        <div className="mx-4 mt-2 rounded-lg bg-red-900/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {!hasSession ? (
        <SessionStarter />
      ) : (
        <>
          <FoodCatalog refreshKey={refreshKey} />
          <AddMissingItemForm onAdded={() => setRefreshKey((k) => k + 1)} />
        </>
      )}
    </div>
  );
}
