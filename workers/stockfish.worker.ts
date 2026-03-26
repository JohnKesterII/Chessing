/// <reference lib="webworker" />

import Stockfish from "stockfish";

import type { EngineLine, EngineSnapshot } from "@/lib/analysis/types";

type IncomingMessage =
  | { type: "init" }
  | { type: "analyze"; fen: string; depth: number; multiPv: number; moveTime?: number }
  | { type: "stop" }
  | { type: "quit" };

const ctx: DedicatedWorkerGlobalScope = self as DedicatedWorkerGlobalScope;

const engine = Stockfish();
let currentFen = "start";
let currentLines: EngineLine[] = [];
let currentDepth = 0;

function postSnapshot(loading: boolean) {
  const payload: EngineSnapshot = {
    fen: currentFen,
    depth: currentDepth,
    lines: [...currentLines].sort((a, b) => a.multiPv - b.multiPv),
    loading
  };
  ctx.postMessage(payload);
}

function parseScore(tokens: string[]) {
  const scoreIndex = tokens.indexOf("score");
  if (scoreIndex === -1) {
    return { scoreCp: null, mate: null };
  }

  const kind = tokens[scoreIndex + 1];
  const value = Number(tokens[scoreIndex + 2]);

  if (kind === "cp") {
    return { scoreCp: value, mate: null };
  }

  if (kind === "mate") {
    return { scoreCp: null, mate: value };
  }

  return { scoreCp: null, mate: null };
}

function parseInfo(line: string) {
  if (!line.startsWith("info")) {
    return;
  }

  const tokens = line.trim().split(/\s+/);
  const depthIndex = tokens.indexOf("depth");
  const pvIndex = tokens.indexOf("pv");
  const multiPvIndex = tokens.indexOf("multipv");

  if (depthIndex === -1 || pvIndex === -1) {
    return;
  }

  currentDepth = Number(tokens[depthIndex + 1]);
  const multiPv = multiPvIndex === -1 ? 1 : Number(tokens[multiPvIndex + 1]);
  const { scoreCp, mate } = parseScore(tokens);
  const pv = tokens.slice(pvIndex + 1);

  const nextLine: EngineLine = {
    depth: currentDepth,
    multiPv,
    scoreCp,
    mate,
    pv,
    bestMove: pv[0] ?? null
  };

  currentLines = currentLines.filter((entry) => entry.multiPv !== multiPv).concat(nextLine);
  postSnapshot(true);
}

engine.onmessage = (payload: string | { data: string }) => {
  const line = typeof payload === "string" ? payload : payload.data;

  if (!line) {
    return;
  }

  if (line.startsWith("bestmove")) {
    postSnapshot(false);
    return;
  }

  parseInfo(line);
};

ctx.onmessage = (event: MessageEvent<IncomingMessage>) => {
  const message = event.data;

  switch (message.type) {
    case "init":
      engine.postMessage("uci");
      engine.postMessage("isready");
      break;
    case "analyze":
      currentFen = message.fen;
      currentLines = [];
      currentDepth = 0;
      postSnapshot(true);
      engine.postMessage("stop");
      engine.postMessage(`setoption name MultiPV value ${message.multiPv}`);
      engine.postMessage(`position fen ${message.fen}`);
      engine.postMessage(
        message.moveTime
          ? `go movetime ${message.moveTime}`
          : `go depth ${Math.max(4, Math.min(message.depth, 24))}`
      );
      break;
    case "stop":
      engine.postMessage("stop");
      postSnapshot(false);
      break;
    case "quit":
      engine.postMessage("quit");
      close();
      break;
  }
};
