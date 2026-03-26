import type { ComponentType } from "react";

type PieceProps = {
  squareWidth: number;
  isDragging?: boolean;
};

const glyphs = {
  classic: {
    wP: "♙",
    wN: "♘",
    wB: "♗",
    wR: "♖",
    wQ: "♕",
    wK: "♔",
    bP: "♟",
    bN: "♞",
    bB: "♝",
    bR: "♜",
    bQ: "♛",
    bK: "♚"
  },
  neon: {
    wP: "♙",
    wN: "♘",
    wB: "♗",
    wR: "♖",
    wQ: "♕",
    wK: "♔",
    bP: "♟",
    bN: "♞",
    bB: "♝",
    bR: "♜",
    bQ: "♛",
    bK: "♚"
  }
} as const;

function makePieceRenderer(glyph: string, colorClass: string): ComponentType<PieceProps> {
  return function PieceRenderer({ squareWidth, isDragging }) {
    return (
      <div
        className={`grid h-full w-full place-items-center select-none ${colorClass}`}
        style={{
          fontSize: squareWidth * 0.82,
          opacity: isDragging ? 0.9 : 1,
          textShadow: "0 8px 24px rgba(0,0,0,0.25)"
        }}
      >
        {glyph}
      </div>
    );
  };
}

export function buildCustomPieces(theme: "classic" | "neon") {
  const colorClass =
    theme === "neon"
      ? "text-accent drop-shadow-[0_0_12px_rgba(101,214,255,0.45)]"
      : "text-white";

  return Object.fromEntries(
    Object.entries(glyphs[theme]).map(([key, glyph]) => [key, makePieceRenderer(glyph, colorClass)])
  );
}
