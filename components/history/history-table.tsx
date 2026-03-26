import Link from "next/link";

import { Card } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";

export type GameRow = {
  id: string;
  result: string;
  mode: string;
  opening_name?: string | null;
  white_accuracy?: number | null;
  black_accuracy?: number | null;
  time_control: string;
  created_at: string;
};

export function HistoryTable({ games }: { games: GameRow[] }) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold text-text">Recent games</div>
          <div className="mt-1 text-sm text-muted">Replay, analyze, or open saved reviews.</div>
        </div>
      </div>
      <div className="overflow-x-auto">
        {games.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-surface2 px-6 py-10 text-sm text-muted">
            No games saved yet. Start from the play board, bot arena, or analysis import flow.
          </div>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="pb-3 font-medium">Mode</th>
                <th className="pb-3 font-medium">Result</th>
                <th className="pb-3 font-medium">Time</th>
                <th className="pb-3 font-medium">Accuracy</th>
                <th className="pb-3 font-medium">Opening</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {games.map((game) => (
                <tr key={game.id}>
                  <td className="py-3 text-text">{game.mode}</td>
                  <td className="py-3 text-text">{game.result}</td>
                  <td className="py-3 text-muted">{game.time_control}</td>
                  <td className="py-3 text-muted">
                    {game.white_accuracy !== null || game.black_accuracy !== null
                      ? `${game.white_accuracy ?? "-"} / ${game.black_accuracy ?? "-"}`
                      : "Not reviewed"}
                  </td>
                  <td className="py-3 text-muted">{game.opening_name ?? "Unknown"}</td>
                  <td className="py-3 text-muted">{formatRelativeTime(game.created_at)}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-3">
                      <Link href={`/game/${game.id}`} className="text-accent">
                        Replay
                      </Link>
                      <Link href={`/analysis?gameId=${game.id}`} className="text-accent2">
                        Analyze
                      </Link>
                      <Link href={`/review/${game.id}`} className="text-accent">
                        Review
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}
