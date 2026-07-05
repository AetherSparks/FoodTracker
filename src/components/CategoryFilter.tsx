"use client";

export type Filter = "all" | string;

interface CategoryFilterProps {
  active: Filter;
  onChange: (filter: Filter) => void;
  categories: string[];
}

export function CategoryFilter({
  active,
  onChange,
  categories,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1">
      <button
        onClick={() => onChange("all")}
        className={`shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
          active === "all"
            ? "bg-amber-500 text-black"
            : "bg-gray-900 text-gray-400"
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            active === cat
              ? "bg-amber-500 text-black"
              : "bg-gray-900 text-gray-400"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
