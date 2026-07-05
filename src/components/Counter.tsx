"use client";

interface CounterProps {
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function Counter({ count, onIncrement, onDecrement }: CounterProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onDecrement}
        disabled={count <= 0}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-lg font-bold text-white transition-transform active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Decrement"
      >
        −
      </button>
      <span className="w-7 text-center font-mono text-lg tabular-nums">
        {count}
      </span>
      <button
        onClick={onIncrement}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-lg font-bold text-black transition-transform active:scale-90"
        aria-label="Increment"
      >
        +
      </button>
    </div>
  );
}
