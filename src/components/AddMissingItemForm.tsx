"use client";

import { useState } from "react";
import { addFoodItem } from "@/lib/firestore";

type Category = "Veg" | "Non-Veg";

interface AddMissingItemFormProps {
  onAdded: () => void;
}

export function AddMissingItemForm({ onAdded }: AddMissingItemFormProps) {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("Veg");
  const [defaultPiecesPerUnit, setDefaultPiecesPerUnit] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setSubmitting(true);
    try {
      await addFoodItem(trimmedName, category, defaultPiecesPerUnit);
      setName("");
      setCategory("Veg");
      setDefaultPiecesPerUnit(1);
      setExpanded(false);
      onAdded();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-1/2 w-full max-w-[480px] -translate-x-1/2 border-t border-gray-800 bg-gray-950 px-4 py-3 backdrop-blur">
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="flex w-full items-center justify-between rounded-lg border border-dashed border-gray-700 px-4 py-3 text-sm text-gray-500 transition-colors active:bg-gray-900"
        >
          <span>What&apos;s missing? Tap to add...</span>
          <span className="text-lg leading-none text-gray-400">+</span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex gap-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Item name"
              className="min-w-0 flex-1 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
            />
            <div className="flex overflow-hidden rounded-lg border border-gray-700">
              {(["Veg", "Non-Veg"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`px-3 py-2.5 text-xs font-semibold transition-colors ${
                    category === c
                      ? "bg-amber-500 text-black"
                      : "bg-gray-900 text-gray-400"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Pieces/unit:</label>
              <input
                type="number"
                min={1}
                value={defaultPiecesPerUnit}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v) && v >= 1) setDefaultPiecesPerUnit(v);
                }}
                className="w-14 rounded-lg border border-gray-700 bg-gray-900 px-2 py-1.5 text-center text-sm tabular-nums outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="rounded-lg px-3 py-1.5 text-xs text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !name.trim()}
                className="rounded-lg bg-amber-500 px-5 py-1.5 text-sm font-semibold text-black disabled:opacity-50"
              >
                {submitting ? "..." : "Add"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
