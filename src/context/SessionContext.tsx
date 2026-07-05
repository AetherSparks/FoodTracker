"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  getSession,
  createSession as createSessionDb,
  updateSessionItems,
} from "@/lib/firestore";
import type { FoodSession, SessionItem } from "@/lib/types";

interface SessionContextValue {
  session: FoodSession | null;
  items: Record<string, SessionItem>;
  loading: boolean;
  error: string | null;
  activeDate: string | null;
  loadSession: (date: string) => Promise<void>;
  startNewSession: (date: string) => Promise<void>;
  increment: (itemId: string, defaultPiecesPerUnit: number) => void;
  decrement: (itemId: string) => void;
  setPiecesPerUnit: (itemId: string, value: number) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [session, setSession] = useState<FoodSession | null>(null);
  const [items, setItems] = useState<Record<string, SessionItem>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDate, setActiveDate] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const uid = user?.uid ?? null;

  const triggerSync = useCallback(() => {
    if (!uid || !activeDate) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateSessionItems(uid, activeDate, itemsRef.current);
    }, 400);
  }, [uid, activeDate]);

  const loadSession = useCallback(
    async (date: string) => {
      if (!uid) return;
      setLoading(true);
      setError(null);
      try {
        const s = await getSession(uid, date);
        if (s) {
          setSession(s);
          setItems(s.items ?? {});
          setActiveDate(date);
        } else {
          setSession(null);
          setItems({});
          setActiveDate(null);
          setError("No session found for this date");
        }
      } catch (err) {
        console.error("Session load error:", err);
        setError(
          "Could not connect to Firestore. Make sure the database is created in Firebase Console."
        );
        setSession(null);
        setItems({});
        setActiveDate(null);
      } finally {
        setLoading(false);
      }
    },
    [uid]
  );

  const startNewSession = useCallback(
    async (date: string) => {
      if (!uid) return;
      await createSessionDb(uid, date);
      setSession({ date, items: {} });
      setItems({});
      setActiveDate(date);
    },
    [uid]
  );

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

  return (
    <SessionContext.Provider
      value={{
        session,
        items,
        loading,
        error,
        activeDate,
        loadSession,
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
