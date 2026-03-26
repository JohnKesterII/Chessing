"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ChessWorkspace } from "@/components/chess/chess-workspace";
import { Card } from "@/components/ui/card";

function timeToSeconds(control: string) {
  return Number(control.split("+")[0] ?? 10) * 60;
}

export function PlayRoom({
  boardTheme,
  pieceTheme,
  soundEnabled
}: {
  boardTheme: "midnight" | "ember" | "slate";
  pieceTheme: "classic" | "neon";
  soundEnabled: boolean;
}) {
  const [timeControl, setTimeControl] = useState("10+0");

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xl font-semibold text-text">Local board</div>
          <div className="mt-1 text-sm text-muted">
            Self-play with legal validation, move list, clocks, save-to-history, and theme controls from settings.
          </div>
        </div>
        <select
          value={timeControl}
          onChange={(event) => setTimeControl(event.target.value)}
          className="h-11 rounded-xl border border-line bg-surface px-3 text-sm text-text outline-none"
        >
          <option value="3+2">3+2</option>
          <option value="5+0">5+0</option>
          <option value="10+0">10+0</option>
          <option value="15+10">15+10</option>
        </select>
      </Card>
      <ChessWorkspace
        mode="self"
        boardTheme={boardTheme}
        pieceTheme={pieceTheme}
        soundEnabled={soundEnabled}
        analysisDepth={12}
        multiPv={1}
        initialClockSeconds={timeToSeconds(timeControl)}
        onSave={async ({ pgn, fen, result }) => {
          const response = await fetch("/api/games", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mode: "self",
              pgn,
              fen,
              result,
              timeControl
            })
          });
          const payload = await response.json();
          if (!response.ok) {
            throw new Error(payload.error ?? "Unable to save game.");
          }
          toast.success("Game stored in history.");
        }}
      />
    </div>
  );
}
