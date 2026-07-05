"use client";

export type Filter = "all" | "Veg" | "Non-Veg";

interface CategoryFilterProps {
  active: Filter;
  onChange: (filter: Filter) => void;
}

const OPTIONS: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Veg", value: "Veg" },
  { label: "Non-Veg", value: "Non-Veg" },
];

export function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-1.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            active === opt.value
              ? "bg-amber-500 text-black"
              : "bg-gray-900 text-gray-400"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
