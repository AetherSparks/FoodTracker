"use client";

import { useSession } from "@/context/SessionContext";

export function SessionStarter() {
  const { startNewSession, loading } = useSession();

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6">
      <div className="mb-6 text-center">
        <div className="mb-4 text-6xl">🍽️</div>
        <h2 className="mb-2 text-2xl font-semibold">No session for today</h2>
        <p className="text-sm text-gray-400">
          Start tracking your buffet indulgences!
        </p>
      </div>
      <button
        onClick={startNewSession}
        disabled={loading}
        className="rounded-xl bg-amber-500 px-10 py-4 text-lg font-bold text-black transition-transform active:scale-95 disabled:opacity-50"
      >
        Start New Session
      </button>
    </div>
  );
}
