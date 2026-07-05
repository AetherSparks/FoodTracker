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
import type { FoodSession } from "@/lib/types";

interface SessionContextValue {
  session: FoodSession | null;
  items: Record<string, number>;
  loading: boolean;
  hasSession: boolean;
  startNewSession: () => Promise<void>;
  increment: (itemId: string) => void;
  decrement: (itemId: string) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [session, setSession] = useState<FoodSession | null>(null);
  const [items, setItems] = useState<Record<string, number>>({});
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
    (itemId: string) => {
      setItems((prev) => ({ ...prev, [itemId]: (prev[itemId] ?? 0) + 1 }));
      triggerSync();
    },
    [triggerSync]
  );

  const decrement = useCallback(
    (itemId: string) => {
      setItems((prev) => {
        const current = prev[itemId] ?? 0;
        if (current <= 0) return prev;
        return { ...prev, [itemId]: current - 1 };
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
