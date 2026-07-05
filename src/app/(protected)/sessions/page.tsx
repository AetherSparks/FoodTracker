"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  listSessions,
  createSession,
  getTodayDateString,
} from "@/lib/firestore";
import type { FoodSession } from "@/lib/types";

function computeStats(session: FoodSession) {
  let totalUnits = 0;
  let totalPieces = 0;
  for (const si of Object.values(session.items)) {
    totalUnits += si.units;
    totalPieces += si.units * si.piecesPerUnit;
  }
  return {
    totalUnits,
    totalPieces,
    itemCount: Object.keys(session.items).length,
  };
}

export default function SessionsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<FoodSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    listSessions(user.uid)
      .then(setSessions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const openSession = (date: string) => {
    router.push(`/track?date=${date}`);
  };

  const startToday = async () => {
    if (!user) return;
    const today = getTodayDateString();
    const exists = sessions.some((s) => s.date === today);
    if (!exists) {
      await createSession(user.uid, today);
    }
    router.push(`/track?date=${today}`);
  };

  const today = getTodayDateString();
  const todaySession = sessions.find((s) => s.date === today);
  const pastSessions = sessions.filter((s) => s.date !== today);

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
          Sessions
        </h1>
        <button
          onClick={signOut}
          className="rounded-lg border border-gray-800 bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-gray-400 transition-colors active:bg-gray-800 active:text-gray-200"
        >
          Exit
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="py-6">
          {todaySession ? (
            <div className="rounded-xl border border-amber-500/20 bg-gray-900/80 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                    Today&apos;s Session
                  </p>
                  <p className="mt-1 text-2xl font-bold text-white">{today}</p>
                </div>
                <button
                  onClick={() => openSession(today)}
                  className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-black transition-transform active:scale-95"
                >
                  Continue
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-gray-800 p-6">
              <p className="text-center text-sm text-gray-400">
                No session for today yet
              </p>
              <button
                onClick={startToday}
                className="rounded-xl bg-amber-500 px-10 py-4 text-lg font-bold text-black transition-transform active:scale-95"
              >
                Start New Session
              </button>
            </div>
          )}
        </div>

        {pastSessions.length > 0 && (
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
              Past Sessions
            </h2>
            <div className="space-y-2">
              {pastSessions.map((s) => {
                const stats = computeStats(s);
                return (
                  <button
                    key={s.date}
                    onClick={() => openSession(s.date)}
                    className="w-full rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-left transition-colors active:bg-gray-800"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{s.date}</p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {stats.itemCount} items &middot; {stats.totalUnits}{" "}
                          units &middot; {stats.totalPieces} pieces
                        </p>
                      </div>
                      <span className="text-xs font-medium text-amber-400">
                        Continue &rarr;
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {sessions.length === 0 && (
          <p className="mt-8 text-center text-sm text-gray-500">
            No sessions yet. Start your first one!
          </p>
        )}
      </main>
    </div>
  );
}
