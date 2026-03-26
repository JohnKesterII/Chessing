"use client";

import { cn } from "@/lib/utils";

type MoveListProps = {
  moves: string[];
  currentPly: number;
  onSelectPly: (ply: number) => void;
};

export function MoveList({ moves, currentPly, onSelectPly }: MoveListProps) {
  const rows = [];
  for (let index = 0; index < moves.length; index += 2) {
    rows.push({
      moveNumber: index / 2 + 1,
      white: moves[index],
      whitePly: index + 1,
      black: moves[index + 1],
      blackPly: index + 2
    });
  }

  return (
    <div className="rounded-3xl border border-line bg-surface p-4">
      <div className="mb-3 text-xs uppercase tracking-[0.18em] text-muted">Moves</div>
      <div className="max-h-[360px] space-y-1 overflow-auto pr-1">
        {rows.map((row) => (
          <div key={row.moveNumber} className="grid grid-cols-[40px_1fr_1fr] gap-2 text-sm">
            <div className="py-2 text-muted">{row.moveNumber}.</div>
            <button
              type="button"
              onClick={() => onSelectPly(row.whitePly)}
              className={cn(
                "rounded-xl px-3 py-2 text-left transition hover:bg-surface2",
                currentPly === row.whitePly && "bg-surface2 text-accent"
              )}
            >
              {row.white}
            </button>
            <button
              type="button"
              onClick={() => row.black && onSelectPly(row.blackPly)}
              className={cn(
                "rounded-xl px-3 py-2 text-left transition hover:bg-surface2",
                currentPly === row.blackPly && "bg-surface2 text-accent"
              )}
              disabled={!row.black}
            >
              {row.black ?? ""}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
