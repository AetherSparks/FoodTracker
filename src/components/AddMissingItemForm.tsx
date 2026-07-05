"use client";

import { useState } from "react";
import { addFoodItem } from "@/lib/firestore";

type Category = "Veg" | "Non-Veg";

interface AddMissingItemFormProps {
  onAdded: () => void;
}

export function AddMissingItemForm({ onAdded }: AddMissingItemFormProps) {
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
      onAdded();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-1/2 w-full max-w-[480px] -translate-x-1/2 border-t border-gray-800 bg-gray-950/95 p-4 backdrop-blur">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Item name"
            className="min-w-0 flex-1 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
          />
          <div className="flex rounded-lg border border-gray-700 overflow-hidden">
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
        <div className="flex gap-2 items-center">
          <label className="text-xs text-gray-400 whitespace-nowrap">
            Pieces per unit:
          </label>
          <input
            type="number"
            min={1}
            value={defaultPiecesPerUnit}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v >= 1) setDefaultPiecesPerUnit(v);
            }}
            className="w-16 rounded-lg border border-gray-700 bg-gray-900 px-2 py-1.5 text-center text-sm tabular-nums outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="ml-auto rounded-lg bg-amber-500 px-6 py-2 text-sm font-semibold text-black transition-transform active:scale-95 disabled:opacity-50"
          >
            {submitting ? "..." : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}
