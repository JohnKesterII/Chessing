"use client";

import { Chess } from "chess.js";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ChessWorkspace } from "@/components/chess/chess-workspace";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type AnalysisSeed = {
  key: string;
  fen?: string;
  pgn?: string;
};

export function AnalysisStudio({
  boardTheme,
  pieceTheme,
  soundEnabled,
  gameSeed
}: {
  boardTheme: "midnight" | "ember" | "slate";
  pieceTheme: "classic" | "neon";
  soundEnabled: boolean;
  gameSeed?: { fen?: string; pgn?: string } | null;
}) {
  const [fenInput, setFenInput] = useState(gameSeed?.fen ?? "");
  const [pgnInput, setPgnInput] = useState(gameSeed?.pgn ?? "");
  const [seed, setSeed] = useState<AnalysisSeed>({
    key: gameSeed?.pgn ?? gameSeed?.fen ?? "start",
    fen: gameSeed?.fen,
    pgn: gameSeed?.pgn
  });
  const [policy, setPolicy] = useState({ depth: 12, multiPv: 1 });

  useEffect(() => {
    const fen = gameSeed?.fen ?? new Chess().fen();
    void fetch("/api/analysis/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fen, mode: "analysis" })
    })
      .then((response) => response.json())
      .then((payload) => {
        if (payload.policy) {
          setPolicy(payload.policy);
        }
      });
  }, [gameSeed]);

  function loadFen() {
    try {
      const chess = new Chess(fenInput);
      setSeed({ key: `${fenInput}-${Date.now()}`, fen: chess.fen() });
      toast.success("FEN loaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid FEN.");
    }
  }

  function loadPgn() {
    try {
      const chess = new Chess();
      chess.loadPgn(pgnInput);
      setSeed({ key: `${pgnInput.length}-${Date.now()}`, pgn: pgnInput });
      toast.success("PGN loaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid PGN.");
    }
  }

  return (
    <div className="space-y-6">
      <Card className="grid gap-4 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end">
        <label className="space-y-2 text-sm text-muted">
          Import FEN
          <Input value={fenInput} onChange={(event) => setFenInput(event.target.value)} placeholder="Paste a FEN string" />
        </label>
        <label className="space-y-2 text-sm text-muted">
          Import PGN
          <Textarea value={pgnInput} onChange={(event) => setPgnInput(event.target.value)} placeholder="Paste a PGN" className="min-h-11" />
        </label>
        <Button variant="secondary" onClick={loadFen}>
          Load FEN
        </Button>
        <Button onClick={loadPgn}>Load PGN</Button>
      </Card>
      <Card className="flex flex-wrap items-center gap-6">
        <div>
          <div className="text-lg font-semibold text-text">Engine policy</div>
          <div className="mt-1 text-sm text-muted">
            Current plan allows depth {policy.depth} with {policy.multiPv} principal variation
            {policy.multiPv > 1 ? "s" : ""}.
          </div>
        </div>
      </Card>
      <ChessWorkspace
        key={seed.key}
        mode="analysis"
        initialFen={seed.fen}
        initialPgn={seed.pgn}
        boardTheme={boardTheme}
        pieceTheme={pieceTheme}
        soundEnabled={soundEnabled}
        analysisDepth={policy.depth}
        multiPv={policy.multiPv}
      />
    </div>
  );
}
