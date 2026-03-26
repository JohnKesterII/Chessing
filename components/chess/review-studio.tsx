"use client";

import { Chess } from "chess.js";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ChessWorkspace } from "@/components/chess/chess-workspace";
import { useStockfishEngine } from "@/hooks/use-stockfish-engine";
import { classifyMove, explainMove, scoreAccuracy } from "@/lib/review/classify";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ReviewMove = {
  ply: number;
  san: string;
  category: string;
  evaluation: number | null;
  bestMove: string | null;
  explanation: string;
};

type ExistingReview = {
  summary: {
    whiteAccuracy: number;
    blackAccuracy: number;
    openingName: string | null;
    resultLabel: string;
  };
  moves: ReviewMove[];
};

function toScore(scoreCp: number | null, mate: number | null) {
  if (mate !== null) {
    return mate > 0 ? 10000 : -10000;
  }
  return scoreCp ?? 0;
}

export function ReviewStudio({
  gameId,
  pgn,
  boardTheme,
  pieceTheme,
  soundEnabled,
  planDepth,
  multiPv,
  existingReview
}: {
  gameId: string;
  pgn: string;
  boardTheme: "midnight" | "ember" | "slate";
  pieceTheme: "classic" | "neon";
  soundEnabled: boolean;
  planDepth: number;
  multiPv: number;
  existingReview?: ExistingReview | null;
}) {
  const initialChess = useMemo(() => {
    const chess = new Chess();
    chess.loadPgn(pgn);
    return chess;
  }, [pgn]);
  const moves = useMemo(() => initialChess.history({ verbose: true }), [initialChess]);
  const maxPlies = multiPv > 1 ? moves.length : Math.min(moves.length, 28);
  const positions = useMemo(() => {
    const chess = new Chess();
    const fens = [chess.fen()];
    moves.slice(0, maxPlies).forEach((move) => {
      chess.move(move);
      fens.push(chess.fen());
    });
    return fens;
  }, [moves, maxPlies]);
  const { snapshot, analyze } = useStockfishEngine();
  const [cursor, setCursor] = useState(existingReview ? positions.length : 0);
  const [evaluations, setEvaluations] = useState<Record<number, { scoreCp: number | null; mate: number | null; bestMove: string | null }>>({});
  const [saving, setSaving] = useState(false);
  const [review, setReview] = useState<ExistingReview | null>(existingReview ?? null);

  useEffect(() => {
    if (existingReview || cursor >= positions.length) {
      return;
    }

    analyze({ fen: positions[cursor], depth: planDepth, multiPv }, 0);
  }, [analyze, cursor, existingReview, multiPv, planDepth, positions]);

  useEffect(() => {
    if (existingReview || snapshot.loading || cursor >= positions.length || snapshot.fen !== positions[cursor]) {
      return;
    }

    setEvaluations((current) => ({
      ...current,
      [cursor]: {
        scoreCp: snapshot.lines[0]?.scoreCp ?? null,
        mate: snapshot.lines[0]?.mate ?? null,
        bestMove: snapshot.lines[0]?.bestMove ?? null
      }
    }));
    setCursor((value) => value + 1);
  }, [cursor, existingReview, positions, snapshot]);

  useEffect(() => {
    if (existingReview || Object.keys(evaluations).length !== positions.length || review) {
      return;
    }

    const whiteDeltas: number[] = [];
    const blackDeltas: number[] = [];
    const moveReviews: ReviewMove[] = [];

    for (let index = 0; index < maxPlies; index += 1) {
      const before = evaluations[index];
      const after = evaluations[index + 1];
      const move = moves[index];

      const beforeScore = toScore(before.scoreCp, before.mate);
      const afterScore = -toScore(after.scoreCp, after.mate);
      const delta = Math.max(0, beforeScore - afterScore);
      const improvement = afterScore - beforeScore;
      const category = classifyMove({
        delta,
        openingPhase: index < 10,
        improvement
      });

      if (move.color === "w") {
        whiteDeltas.push(delta);
      } else {
        blackDeltas.push(delta);
      }

      moveReviews.push({
        ply: index + 1,
        san: move.san,
        category,
        evaluation: after.scoreCp,
        bestMove: before.bestMove,
        explanation: explainMove(category, before.bestMove)
      });
    }

    setReview({
      summary: {
        whiteAccuracy: scoreAccuracy(whiteDeltas),
        blackAccuracy: scoreAccuracy(blackDeltas),
        openingName: null,
        resultLabel: initialChess.isCheckmate()
          ? `Checkmate: ${initialChess.turn() === "w" ? "Black" : "White"} won`
          : initialChess.isDraw()
            ? "Draw"
            : "Game reviewed"
      },
      moves: moveReviews
    });
  }, [evaluations, existingReview, initialChess, maxPlies, moves, positions.length, review]);

  useEffect(() => {
    if (!review || existingReview || saving) {
      return;
    }

    setSaving(true);
    void fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId,
        summary: review.summary,
        moves: review.moves
      })
    })
      .then((response) => response.json().then((payload) => ({ ok: response.ok, payload })))
      .then(({ ok, payload }) => {
        if (!ok) {
          throw new Error(payload.error ?? "Could not save review.");
        }
        toast.success("Review saved to your account.");
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Could not save review.");
      })
      .finally(() => setSaving(false));
  }, [existingReview, gameId, review, saving]);

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold text-text">Game review</div>
          <div className="mt-2 text-sm text-muted">
            {review
              ? `White accuracy ${review.summary.whiteAccuracy}%, black accuracy ${review.summary.blackAccuracy}%.`
              : `Analyzing ${cursor}/${positions.length} positions with depth ${planDepth}.`}
          </div>
        </div>
        {multiPv === 1 ? (
          <div className="text-sm text-muted">
            Free tier review is partial and capped to the first {maxPlies} plies.
          </div>
        ) : null}
      </Card>
      <ChessWorkspace
        mode="analysis"
        initialPgn={pgn}
        boardTheme={boardTheme}
        pieceTheme={pieceTheme}
        soundEnabled={soundEnabled}
        analysisDepth={planDepth}
        multiPv={multiPv}
        readOnly
      />
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-xl font-semibold text-text">Move classifications</div>
          {saving ? <Button variant="secondary">Saving review...</Button> : null}
        </div>
        <div className="space-y-3">
          {review ? (
            review.moves.map((move) => (
              <div key={move.ply} className="rounded-2xl border border-line bg-surface2 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="font-medium text-text">
                    {move.ply}. {move.san}
                  </div>
                  <div className="text-sm uppercase tracking-[0.16em] text-accent">{move.category}</div>
                </div>
                <div className="mt-2 text-sm text-muted">{move.explanation}</div>
                {move.bestMove ? <div className="mt-2 text-xs uppercase tracking-[0.16em] text-muted">Best line started with {move.bestMove}</div> : null}
              </div>
            ))
          ) : (
            <div className="text-sm text-muted">Review in progress...</div>
          )}
        </div>
      </Card>
    </div>
  );
}
