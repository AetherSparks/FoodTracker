"use client";

interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
        🔍
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search food items..."
        className="w-full rounded-lg border border-gray-800 bg-gray-900 py-2.5 pl-9 pr-9 text-sm outline-none placeholder:text-gray-600 focus:border-amber-500"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
        >
          ✕
        </button>
      )}
    </div>
  );
}
