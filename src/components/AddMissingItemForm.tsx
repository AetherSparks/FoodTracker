"use client";

import { useState } from "react";
import { addFoodItem } from "@/lib/firestore";

interface AddMissingItemFormProps {
  onAdded: () => void;
}

export function AddMissingItemForm({ onAdded }: AddMissingItemFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedCategory = category.trim();
    if (!trimmedName || !trimmedCategory) return;

    setSubmitting(true);
    try {
      await addFoodItem(trimmedName, trimmedCategory);
      setName("");
      setCategory("");
      onAdded();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-1/2 w-full max-w-[480px] -translate-x-1/2 border-t border-gray-800 bg-gray-950/95 p-4 backdrop-blur">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name"
          className="min-w-0 flex-1 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
        />
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          className="w-28 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          disabled={submitting || !name.trim() || !category.trim()}
          className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black transition-transform active:scale-95 disabled:opacity-50"
        >
          {submitting ? "..." : "Add"}
        </button>
      </form>
    </div>
  );
}
