"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  getTodayDateString,
  getTodaySession,
  createSession as createSessionDb,
  updateSessionItems,
} from "@/lib/firestore";
import type { FoodSession, SessionItem } from "@/lib/types";

interface SessionContextValue {
  session: FoodSession | null;
  items: Record<string, SessionItem>;
  loading: boolean;
  error: string | null;
  hasSession: boolean;
  startNewSession: () => Promise<void>;
  increment: (itemId: string, defaultPiecesPerUnit: number) => void;
  decrement: (itemId: string) => void;
  setPiecesPerUnit: (itemId: string, value: number) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [session, setSession] = useState<FoodSession | null>(null);
  const [items, setItems] = useState<Record<string, SessionItem>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const date = getTodayDateString();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const uid = user?.uid ?? null;

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    setError(null);
    getTodaySession(uid, date)
      .then((s) => {
        if (s) {
          setSession(s);
          setItems(s.items ?? {});
        } else {
          setSession(null);
          setItems({});
        }
      })
      .catch((err) => {
        console.error("Session load error:", err);
        setError("Could not connect to Firestore. Make sure the database is created in Firebase Console.");
      })
      .finally(() => setLoading(false));
  }, [uid, date]);

  const triggerSync = useCallback(() => {
    if (!uid) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateSessionItems(uid, date, itemsRef.current);
    }, 400);
  }, [uid, date]);

  const increment = useCallback(
    (itemId: string, defaultPiecesPerUnit: number) => {
      setItems((prev) => {
        const current = prev[itemId];
        if (!current) {
          return {
            ...prev,
            [itemId]: { units: 1, piecesPerUnit: defaultPiecesPerUnit },
          };
        }
        return {
          ...prev,
          [itemId]: { ...current, units: current.units + 1 },
        };
      });
      triggerSync();
    },
    [triggerSync]
  );

  const decrement = useCallback(
    (itemId: string) => {
      setItems((prev) => {
        const current = prev[itemId];
        if (!current || current.units <= 0) return prev;
        return {
          ...prev,
          [itemId]: { ...current, units: current.units - 1 },
        };
      });
      triggerSync();
    },
    [triggerSync]
  );

  const setPiecesPerUnit = useCallback(
    (itemId: string, value: number) => {
      if (value < 1) return;
      setItems((prev) => {
        const current = prev[itemId] ?? { units: 0, piecesPerUnit: 1 };
        return {
          ...prev,
          [itemId]: { ...current, piecesPerUnit: value },
        };
      });
      triggerSync();
    },
    [triggerSync]
  );

  const startNewSession = useCallback(async () => {
    if (!uid) return;
    await createSessionDb(uid, date);
    setSession({ date, items: {} });
    setItems({});
  }, [uid, date]);

  return (
    <SessionContext.Provider
      value={{
        session,
        items,
        loading,
        error,
        hasSession: session !== null,
        startNewSession,
        increment,
        decrement,
        setPiecesPerUnit,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
