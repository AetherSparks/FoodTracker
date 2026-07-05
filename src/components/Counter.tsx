"use client";

interface CounterProps {
  units: number;
  piecesPerUnit: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onPiecesPerUnitChange: (value: number) => void;
}

export function Counter({
  units,
  piecesPerUnit,
  onIncrement,
  onDecrement,
  onPiecesPerUnitChange,
}: CounterProps) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <div className="flex items-center gap-1">
        <button
          onClick={onDecrement}
          disabled={units <= 0}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-base font-bold text-white transition-colors active:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-20"
          aria-label="Decrement"
        >
          −
        </button>
        <span className="flex w-8 items-center justify-center font-mono text-lg font-semibold tabular-nums text-white">
          {units}
        </span>
        <button
          onClick={onIncrement}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-base font-bold text-black transition-colors active:bg-amber-400"
          aria-label="Increment"
        >
          +
        </button>
      </div>
      <div className="flex items-center gap-1 text-[11px] text-gray-500">
        <span className="tabular-nums font-medium text-gray-400">
          {units * piecesPerUnit}
        </span>
        <span>pcs</span>
        <span className="text-gray-700">·</span>
        <input
          type="number"
          min={1}
          value={piecesPerUnit}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v)) onPiecesPerUnitChange(Math.max(1, v));
          }}
          className="w-7 border-0 bg-transparent p-0 text-center text-[11px] tabular-nums text-gray-500 outline-none focus:text-amber-400"
        />
        <span>/u</span>
      </div>
    </div>
  );
}
