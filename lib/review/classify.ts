import type { ReviewCategory } from "@/lib/db/types";

export function classifyMove({
  delta,
  openingPhase,
  improvement
}: {
  delta: number;
  openingPhase: boolean;
  improvement: number;
}): ReviewCategory {
  if (openingPhase && delta <= 10) {
    return "book";
  }

  if (delta <= 10) {
    return "best";
  }

  if (improvement >= 180 && delta <= 20) {
    return "brilliant";
  }

  if (delta <= 40) {
    return "excellent";
  }

  if (delta <= 85) {
    return "good";
  }

  if (delta <= 150) {
    return "inaccuracy";
  }

  if (delta <= 300) {
    return "mistake";
  }

  return "blunder";
}

export function explainMove(category: ReviewCategory, bestMove: string | null) {
  switch (category) {
    case "book":
      return "This follows a known opening path and keeps the position healthy.";
    case "best":
      return "You found the engine's top continuation and preserved the evaluation.";
    case "brilliant":
      return "This move keeps the best line while creating a sharp tactical resource.";
    case "excellent":
      return "A strong practical choice. The engine only prefers a marginally cleaner line.";
    case "good":
      return "Playable and stable, though a more precise continuation was available.";
    case "inaccuracy":
      return bestMove
        ? `This drifted slightly. ${bestMove} kept more control of the position.`
        : "This gave away a small amount of value.";
    case "mistake":
      return bestMove
        ? `This gave up a meaningful edge. ${bestMove} would have held the position together.`
        : "This costs real equity and makes the position harder to defend.";
    case "blunder":
      return bestMove
        ? `A major swing. ${bestMove} was necessary to avoid the collapse.`
        : "This loses decisive material or allows a forced finish.";
  }
}

export function scoreAccuracy(deltas: number[]) {
  if (deltas.length === 0) {
    return 100;
  }

  const normalized = deltas.map((delta) => Math.max(0, 100 - delta / 12));
  const average = normalized.reduce((sum, value) => sum + value, 0) / normalized.length;
  return Math.max(0, Math.min(100, Number(average.toFixed(1))));
}
