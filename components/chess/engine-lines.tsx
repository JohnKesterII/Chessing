import type { EngineLine } from "@/lib/analysis/types";

export function EngineLines({ lines }: { lines: EngineLine[] }) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-4">
      <div className="mb-3 text-xs uppercase tracking-[0.18em] text-muted">Top Lines</div>
      <div className="space-y-3">
        {lines.length === 0 ? (
          <div className="text-sm text-muted">Engine waiting for a stable position.</div>
        ) : (
          lines.map((line) => (
            <div key={line.multiPv} className="rounded-2xl border border-line bg-surface2 p-3">
              <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-muted">
                <span>PV {line.multiPv}</span>
                <span>Depth {line.depth}</span>
              </div>
              <div className="text-sm font-medium text-text">
                {line.mate !== null ? `Mate in ${line.mate}` : `${((line.scoreCp ?? 0) / 100).toFixed(1)}`}
              </div>
              <div className="mt-2 text-sm text-muted">{line.pv.slice(0, 8).join(" ")}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
