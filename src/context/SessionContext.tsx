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
  sanitizeEmail,
} from "@/lib/firestore";
import type { FoodSession, SessionItem } from "@/lib/types";

interface SessionContextValue {
  session: FoodSession | null;
  items: Record<string, SessionItem>;
  loading: boolean;
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

  const date = getTodayDateString();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const userEmail = user?.email ? sanitizeEmail(user.email) : null;

  useEffect(() => {
    if (!userEmail) return;
    setLoading(true);
    getTodaySession(userEmail, date)
      .then((s) => {
        if (s) {
          setSession(s);
          setItems(s.items ?? {});
        } else {
          setSession(null);
          setItems({});
        }
      })
      .finally(() => setLoading(false));
  }, [userEmail, date]);

  const triggerSync = useCallback(() => {
    if (!userEmail) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateSessionItems(userEmail, date, itemsRef.current);
    }, 400);
  }, [userEmail, date]);

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
    if (!userEmail) return;
    await createSessionDb(userEmail, date);
    setSession({ date, items: {} });
    setItems({});
  }, [userEmail, date]);

  return (
    <SessionContext.Provider
      value={{
        session,
        items,
        loading,
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
