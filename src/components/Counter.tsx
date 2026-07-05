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
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <button
          onClick={onDecrement}
          disabled={units <= 0}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-lg font-bold text-white transition-transform active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Decrement"
        >
          −
        </button>
        <span className="w-7 text-center font-mono text-lg tabular-nums">
          {units}
        </span>
        <button
          onClick={onIncrement}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-lg font-bold text-black transition-transform active:scale-90"
          aria-label="Increment"
        >
          +
        </button>
      </div>

      <div className="flex items-center gap-1 text-xs text-gray-500">
        <span className="tabular-nums">{piecesPerUnit}</span>
        <span>p/u</span>
        <input
          type="number"
          min={1}
          value={piecesPerUnit}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v)) onPiecesPerUnitChange(v);
          }}
          className="w-10 rounded border border-gray-700 bg-gray-900 px-1 py-0.5 text-center text-xs tabular-nums outline-none focus:border-amber-500"
        />
        <span>= {units * piecesPerUnit} pcs</span>
      </div>
    </div>
  );
}
