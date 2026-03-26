import { countCapturedPieces } from "@/lib/chess/replay";

const order = ["q", "r", "b", "n", "p"] as const;
const glyphs = {
  w: { p: "♙", n: "♘", b: "♗", r: "♖", q: "♕" },
  b: { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛" }
};

export function CapturedPieces({ fen }: { fen: string }) {
  const captured = countCapturedPieces(fen);

  return (
    <div className="space-y-3 rounded-3xl border border-line bg-surface p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-muted">Captured</div>
      <div className="space-y-2 text-2xl">
        <div className="flex flex-wrap gap-2 text-white/85">
          {order.flatMap((piece) =>
            Array.from({ length: captured.blackLost[piece] }).map((_, index) => (
              <span key={`white-${piece}-${index}`}>{glyphs.b[piece]}</span>
            ))
          )}
        </div>
        <div className="flex flex-wrap gap-2 text-white/85">
          {order.flatMap((piece) =>
            Array.from({ length: captured.whiteLost[piece] }).map((_, index) => (
              <span key={`black-${piece}-${index}`}>{glyphs.w[piece]}</span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
