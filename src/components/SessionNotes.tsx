"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "@/context/SessionContext";
import { useAuth } from "@/context/AuthContext";
import { updateSessionNotes, getTodayDateString } from "@/lib/firestore";

export function SessionNotes() {
  const { session } = useSession();
  const { user } = useAuth();
  const [notes, setNotes] = useState(session?.notes ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setNotes(session?.notes ?? "");
  }, [session?.notes]);

  const handleChange = (value: string) => {
    setNotes(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!user?.uid) return;
      updateSessionNotes(user.uid, getTodayDateString(), value);
    }, 600);
  };

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-3">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
        Personal Notes
      </label>
      <textarea
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Items not on the menu? Note them here..."
        rows={3}
        className="mt-2 w-full resize-none rounded-lg border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100 outline-none placeholder:text-gray-600 focus:border-amber-500"
      />
    </div>
  );
}
