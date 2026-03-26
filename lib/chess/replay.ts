import { Chess, type Move } from "chess.js";

import { detectOpening } from "@/lib/chess/openings";

export type ReplayMove = {
  ply: number;
  moveNumber: number;
  san: string;
  uci: string;
  fenAfter: string;
  color: "w" | "b";
  isCapture: boolean;
  isCheck: boolean;
};

export function buildReplayFromPgn(pgn: string) {
  const chess = new Chess();
  chess.loadPgn(pgn);

  const replay = new Chess();
  const verbose = chess.history({ verbose: true }) as Move[];
  const moves: ReplayMove[] = [];

  for (const move of verbose) {
    replay.move(move);
    moves.push({
      ply: moves.length + 1,
      moveNumber: Math.ceil((moves.length + 1) / 2),
      san: move.san,
      uci: `${move.from}${move.to}${move.promotion ?? ""}`,
      fenAfter: replay.fen(),
      color: move.color,
      isCapture: move.flags.includes("c") || move.flags.includes("e"),
      isCheck: move.san.includes("+") || move.san.includes("#")
    });
  }

  return {
    moves,
    finalFen: replay.fen(),
    openingName: detectOpening(moves.map((move) => move.san))
  };
}

export function countCapturedPieces(fen: string) {
  const [board] = fen.split(" ");
  const pieces = board.replace(/[1-8/]/g, "").split("");

  const totals = {
    w: { p: 8, n: 2, b: 2, r: 2, q: 1 },
    b: { p: 8, n: 2, b: 2, r: 2, q: 1 }
  };

  for (const piece of pieces) {
    if (piece === piece.toUpperCase()) {
      totals.w[piece.toLowerCase() as keyof (typeof totals)["w"]] -= 1;
    } else {
      totals.b[piece as keyof (typeof totals)["b"]] -= 1;
    }
  }

  return {
    whiteLost: totals.w,
    blackLost: totals.b
  };
}

export function getGameOutcome(chess: Chess) {
  if (chess.isCheckmate()) {
    return chess.turn() === "w" ? "black" : "white";
  }
  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition()) {
    return "draw";
  }
  return "ongoing";
}
