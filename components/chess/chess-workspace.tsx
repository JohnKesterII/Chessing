"use client";

import { Chess, type Square } from "chess.js";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Chessboard } from "react-chessboard";
import { toast } from "sonner";

import { buildCustomPieces } from "@/lib/chess/pieces";
import { BOARD_THEMES } from "@/lib/constants/chess";
import { getGameOutcome } from "@/lib/chess/replay";
import { Button } from "@/components/ui/button";
import { CapturedPieces } from "@/components/chess/captured-pieces";
import { MoveList } from "@/components/chess/move-list";
import { PromotionPicker } from "@/components/chess/promotion-picker";
import { EngineLines } from "@/components/chess/engine-lines";
import { EvaluationBar } from "@/components/chess/evaluation-bar";
import { useMoveSounds } from "@/hooks/use-move-sounds";
import { useStockfishEngine } from "@/hooks/use-stockfish-engine";
import { formatClock } from "@/lib/utils";

type WorkspaceMode = "self" | "analysis" | "bot";

type WorkspaceProps = {
  mode: WorkspaceMode;
  initialFen?: string;
  initialPgn?: string;
  boardTheme: keyof typeof BOARD_THEMES;
  pieceTheme: "classic" | "neon";
  soundEnabled: boolean;
  analysisDepth: number;
  multiPv: number;
  botDepth?: number;
  readOnly?: boolean;
  startingSide?: "white" | "black";
  initialClockSeconds?: number;
  onSave?: (payload: { pgn: string; fen: string; result: string; moves: string[] }) => Promise<void>;
};

type PendingPromotion = {
  from: Square;
  to: Square;
  color: "w" | "b";
};

export function ChessWorkspace({
  mode,
  initialFen,
  initialPgn,
  boardTheme,
  pieceTheme,
  soundEnabled,
  analysisDepth,
  multiPv,
  botDepth = 8,
  readOnly = false,
  startingSide = "white",
  initialClockSeconds = 600,
  onSave
}: WorkspaceProps) {
  const [chess, setChess] = useState(() => {
    const next = new Chess();
    if (initialPgn) {
      next.loadPgn(initialPgn);
    } else if (initialFen) {
      next.load(initialFen);
    }
    return next;
  });
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(null);
  const [currentPly, setCurrentPly] = useState(() => {
    const seeded = new Chess();
    if (initialPgn) {
      seeded.loadPgn(initialPgn);
      return seeded.history().length;
    }
    return 0;
  });
  const [orientation, setOrientation] = useState<"white" | "black">(startingSide);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [whiteClock, setWhiteClock] = useState(initialClockSeconds);
  const [blackClock, setBlackClock] = useState(initialClockSeconds);
  const [awaitingBot, setAwaitingBot] = useState(false);
  const [botFen, setBotFen] = useState<string | null>(null);
  const sounds = useMoveSounds(soundEnabled);
  const { snapshot, analyze } = useStockfishEngine();

  const liveFen = chess.fen();
  const moveList = chess.history();
  const previewChess = useMemo(() => {
    const next = new Chess();
    if (initialFen && !initialPgn) {
      next.load(initialFen);
    }
    chess.history({ verbose: true })
      .slice(0, currentPly)
      .forEach((move) => next.move(move));
    return next;
  }, [chess, currentPly, initialFen, initialPgn]);
  const fen = currentPly === moveList.length ? liveFen : previewChess.fen();
  const humanTurnColor = startingSide === "white" ? "w" : "b";
  const interactionLocked =
    readOnly ||
    currentPly !== moveList.length ||
    (mode === "bot" && chess.turn() !== humanTurnColor);
  const legalTargets = selectedSquare
    ? currentPly === moveList.length
      ? chess.moves({ square: selectedSquare, verbose: true }).map((move) => move.to)
      : []
    : [];
  const lastMove = (currentPly === moveList.length ? chess : previewChess).history({ verbose: true }).at(-1);
  const boardPalette = BOARD_THEMES[boardTheme];
  const customPieces = useMemo(() => buildCustomPieces(pieceTheme), [pieceTheme]);
  const customArrows = snapshot.lines
    .map((line, index) => {
      const bestMove = line.bestMove;
      if (!bestMove) {
        return null;
      }
      return [
        bestMove.slice(0, 2),
        bestMove.slice(2, 4),
        index === 0 ? "rgba(159,232,112,0.7)" : "rgba(101,214,255,0.55)"
      ] as [string, string, string];
    })
    .filter(Boolean) as [string, string, string][];

  const customSquareStyles = useMemo(() => {
    const styles: Record<string, CSSProperties> = {};
    if (selectedSquare) {
      styles[selectedSquare] = { boxShadow: "inset 0 0 0 3px rgba(101,214,255,0.75)" };
    }
    legalTargets.forEach((square) => {
      styles[square] = {
        background:
          "radial-gradient(circle, rgba(159,232,112,0.58) 0%, rgba(159,232,112,0.18) 40%, transparent 42%)"
      };
    });
    if (lastMove) {
      styles[lastMove.from] = { backgroundColor: "rgba(101,214,255,0.24)" };
      styles[lastMove.to] = { backgroundColor: "rgba(101,214,255,0.24)" };
    }
    return styles;
  }, [legalTargets, selectedSquare, lastMove]);

  function syncEngine(nextChess: Chess) {
    if (mode === "analysis" || mode === "bot") {
      analyze({
        fen: nextChess.fen(),
        depth: mode === "bot" ? botDepth : analysisDepth,
        multiPv: mode === "bot" ? 1 : multiPv,
        moveTime: mode === "bot" ? Math.min(600, 120 + botDepth * 40) : undefined
      });
    }
  }

  function commitMove(from: Square, to: Square, promotion?: "q" | "r" | "b" | "n") {
    if (currentPly !== moveList.length) {
      toast.info("Return to the live position before making a new move.");
      return false;
    }

    const nextChess = new Chess(chess.fen());
    const move = nextChess.move({ from, to, promotion });

    if (!move) {
      return false;
    }

    setChess(nextChess);
    setCurrentPly(nextChess.history().length);
    setSelectedSquare(null);

    if (move.flags.includes("c") || move.flags.includes("e")) {
      sounds.playCapture();
    } else if (nextChess.isCheck()) {
      sounds.playCheck();
    } else {
      sounds.playMove();
    }

    syncEngine(nextChess);
    if (mode === "bot") {
      const humanColor = startingSide === "white" ? "w" : "b";
      if (!nextChess.isGameOver() && nextChess.turn() !== humanColor) {
        setAwaitingBot(true);
        setBotFen(nextChess.fen());
        analyze(
          {
            fen: nextChess.fen(),
            depth: botDepth,
            multiPv: 1,
            moveTime: 240 + botDepth * 50
          },
          0
        );
      }
    }
    return true;
  }

  useEffect(() => {
    if (!awaitingBot || !botFen || snapshot.loading || snapshot.fen !== botFen) {
      return;
    }

    const moveUci = snapshot.lines[0]?.bestMove;
    const current = new Chess(chess.fen());
    const fallback = current.moves({ verbose: true })[0];
    const reply = moveUci
      ? {
          from: moveUci.slice(0, 2) as Square,
          to: moveUci.slice(2, 4) as Square,
          promotion: (moveUci.slice(4, 5) as "q" | "r" | "b" | "n" | "") || undefined
        }
      : fallback
        ? { from: fallback.from, to: fallback.to, promotion: fallback.promotion }
        : null;

    if (!reply) {
      setAwaitingBot(false);
      return;
    }

    current.move(reply);
    setChess(current);
    setCurrentPly(current.history().length);
    setAwaitingBot(false);
    setBotFen(null);
    sounds.playMove();
    syncEngine(current);
  }, [awaitingBot, botFen, chess, snapshot, sounds]);

  useEffect(() => {
    if (mode === "analysis" || chess.isGameOver() || currentPly !== moveList.length) {
      return;
    }

    const interval = window.setInterval(() => {
      if (chess.turn() === "w") {
        setWhiteClock((value) => Math.max(0, value - 1));
      } else {
        setBlackClock((value) => Math.max(0, value - 1));
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [chess, currentPly, mode, moveList.length]);

  useEffect(() => {
    if (mode !== "bot" || startingSide !== "black" || moveList.length !== 0 || awaitingBot) {
      return;
    }

    const opening = new Chess();
    setAwaitingBot(true);
    setBotFen(opening.fen());
    analyze({ fen: opening.fen(), depth: botDepth, multiPv: 1, moveTime: 240 + botDepth * 50 }, 0);
  }, [analyze, awaitingBot, botDepth, mode, moveList.length, startingSide]);

  function handleDrop(sourceSquare: string, targetSquare: string) {
    if (interactionLocked) {
      return false;
    }

    const moves = chess.moves({ square: sourceSquare as Square, verbose: true });
    const candidate = moves.find((move) => move.to === targetSquare);

    if (!candidate) {
      return false;
    }

    if (candidate.promotion) {
      setPendingPromotion({
        from: sourceSquare as Square,
        to: targetSquare as Square,
        color: candidate.color
      });
      return false;
    }

    return commitMove(sourceSquare as Square, targetSquare as Square);
  }

  function handleSquareClick(square: string) {
    if (interactionLocked) {
      return;
    }

    if (selectedSquare) {
      const moved = commitMove(selectedSquare, square as Square);
      if (!moved) {
        setSelectedSquare(square as Square);
      }
      return;
    }

    setSelectedSquare(square as Square);
  }

  function handleJumpToPly(ply: number) {
    setCurrentPly(ply);
    const nextChess = new Chess();
    if (initialFen && !initialPgn) {
      nextChess.load(initialFen);
    }
    chess.history({ verbose: true })
      .slice(0, ply)
      .forEach((move) => nextChess.move(move));
    analyze({ fen: nextChess.fen(), depth: analysisDepth, multiPv });
  }

  async function handleSave() {
    if (!onSave) {
      return;
    }

    try {
      await onSave({
        pgn: chess.pgn(),
        fen: chess.fen(),
        result: getGameOutcome(chess),
        moves: chess.history()
      });
      toast.success("Game saved to your history.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save the game.");
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[24px_1fr]">
          <EvaluationBar scoreCp={snapshot.lines[0]?.scoreCp ?? null} mate={snapshot.lines[0]?.mate ?? null} />
          <div className="relative rounded-[30px] border border-line bg-surface p-3 shadow-card">
            {pendingPromotion ? (
              <PromotionPicker
                color={pendingPromotion.color}
                onPick={(piece) => {
                  commitMove(pendingPromotion.from, pendingPromotion.to, piece);
                  setPendingPromotion(null);
                }}
              />
            ) : null}
            <div className="mb-3 flex items-center justify-between rounded-2xl bg-surface2 px-4 py-3 text-sm">
              <div>
                <div className="font-semibold text-text">Black</div>
                <div className="text-muted">{formatClock(blackClock)}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setOrientation((value) => (value === "white" ? "black" : "white"))}>
                  Flip
                </Button>
                {currentPly !== moveList.length ? (
                  <Button variant="ghost" onClick={() => setCurrentPly(moveList.length)}>
                    Live
                  </Button>
                ) : null}
                <Button variant="ghost" onClick={() => toast.info("Draw offers are available in online play rooms.")}>
                  Draw
                </Button>
                <Button variant="ghost" onClick={() => toast.info("Abort is available before move two in online rooms.")}>
                  Abort
                </Button>
              </div>
            </div>
            <Chessboard
              id={`knightshift-${mode}`}
              position={fen}
              boardOrientation={orientation}
              onPieceDrop={handleDrop}
              onSquareClick={handleSquareClick}
              customPieces={customPieces}
              customDarkSquareStyle={{ backgroundColor: boardPalette.dark }}
              customLightSquareStyle={{ backgroundColor: boardPalette.light }}
              customSquareStyles={customSquareStyles}
              customBoardStyle={{
                borderRadius: 24,
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)"
              }}
              customArrows={customArrows}
              arePiecesDraggable={!interactionLocked}
              animationDuration={220}
            />
            <div className="mt-3 flex items-center justify-between rounded-2xl bg-surface2 px-4 py-3 text-sm">
              <div>
                <div className="font-semibold text-text">White</div>
                <div className="text-muted">{formatClock(whiteClock)}</div>
              </div>
              <div className="flex gap-2">
                {onSave ? <Button onClick={handleSave}>Save game</Button> : null}
              <Button
                  variant="secondary"
                  onClick={() => {
                    const reset = new Chess();
                    setChess(reset);
                    setCurrentPly(0);
                    setWhiteClock(initialClockSeconds);
                    setBlackClock(initialClockSeconds);
                    syncEngine(reset);
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <CapturedPieces fen={fen} />
          <EngineLines lines={snapshot.lines} />
        </div>
      </div>
      <MoveList moves={moveList} currentPly={currentPly} onSelectPly={handleJumpToPly} />
    </div>
  );
}
