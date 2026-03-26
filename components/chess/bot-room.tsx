"use client";

import { useState } from "react";

import { ChessWorkspace } from "@/components/chess/chess-workspace";
import { Card } from "@/components/ui/card";

const depthMap: Record<string, number> = {
  "1": 4,
  "2": 6,
  "3": 8,
  "4": 10,
  "5": 12,
  "6": 14,
  "7": 16
};

function timeToSeconds(control: string) {
  return Number(control.split("+")[0] ?? 10) * 60;
}

export function BotRoom({
  boardTheme,
  pieceTheme,
  soundEnabled,
  planBotDepth
}: {
  boardTheme: "midnight" | "ember" | "slate";
  pieceTheme: "classic" | "neon";
  soundEnabled: boolean;
  planBotDepth: number;
}) {
  const [level, setLevel] = useState("4");
  const [side, setSide] = useState<"white" | "black">("white");
  const [timeControl, setTimeControl] = useState("10+0");
  const effectiveDepth = Math.min(planBotDepth, depthMap[level]);

  return (
    <div className="space-y-6">
      <Card className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2 text-sm text-muted">
          Difficulty
          <select
            value={level}
            onChange={(event) => setLevel(event.target.value)}
            className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-text outline-none"
          >
            {Object.keys(depthMap).map((value) => (
              <option key={value} value={value}>
                Level {value}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm text-muted">
          Your side
          <select
            value={side}
            onChange={(event) => setSide(event.target.value as "white" | "black")}
            className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-text outline-none"
          >
            <option value="white">White</option>
            <option value="black">Black</option>
          </select>
        </label>
        <label className="space-y-2 text-sm text-muted">
          Time control
          <select
            value={timeControl}
            onChange={(event) => setTimeControl(event.target.value)}
            className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-text outline-none"
          >
            <option value="3+2">3+2</option>
            <option value="5+0">5+0</option>
            <option value="10+0">10+0</option>
            <option value="15+10">15+10</option>
          </select>
        </label>
      </Card>
      <ChessWorkspace
        key={`${level}-${side}-${timeControl}`}
        mode="bot"
        boardTheme={boardTheme}
        pieceTheme={pieceTheme}
        soundEnabled={soundEnabled}
        analysisDepth={12}
        multiPv={1}
        botDepth={effectiveDepth}
        startingSide={side}
        initialClockSeconds={timeToSeconds(timeControl)}
        onSave={async ({ pgn, fen, result }) => {
          const response = await fetch("/api/games", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mode: "bot",
              pgn,
              fen,
              result,
              timeControl,
              userColor: side
            })
          });

          const payload = await response.json();
          if (!response.ok) {
            throw new Error(payload.error ?? "Could not save the bot game.");
          }
        }}
      />
    </div>
  );
}
