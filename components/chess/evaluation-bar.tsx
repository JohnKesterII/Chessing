import { cn, formatCp } from "@/lib/utils";

export function EvaluationBar({
  scoreCp,
  mate
}: {
  scoreCp: number | null;
  mate: number | null;
}) {
  const score = mate !== null ? (mate > 0 ? 1000 : -1000) : scoreCp ?? 0;
  const whitePercent = Math.max(5, Math.min(95, 50 + score / 20));

  return (
    <div className="flex h-full w-6 flex-col overflow-hidden rounded-full border border-line bg-surface2">
      <div className="grid place-items-center bg-white text-[10px] font-semibold text-black" style={{ height: `${whitePercent}%` }}>
        {mate !== null ? `M${mate}` : formatCp(scoreCp)}
      </div>
      <div
        className={cn("grid flex-1 place-items-center bg-bg text-[10px] font-semibold text-white")}
      >
        {mate !== null ? `M${mate}` : formatCp(-(scoreCp ?? 0))}
      </div>
    </div>
  );
}
