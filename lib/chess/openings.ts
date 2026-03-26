const OPENING_BOOK: Array<{ line: string[]; name: string }> = [
  { line: ["e4", "e5", "Nf3", "Nc6", "Bb5"], name: "Ruy Lopez" },
  { line: ["e4", "c5"], name: "Sicilian Defense" },
  { line: ["e4", "e6"], name: "French Defense" },
  { line: ["e4", "c6"], name: "Caro-Kann Defense" },
  { line: ["d4", "d5", "c4"], name: "Queen's Gambit" },
  { line: ["d4", "Nf6", "c4", "g6"], name: "King's Indian Defense" },
  { line: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4"], name: "Nimzo-Indian Defense" },
  { line: ["Nf3", "d5", "g3"], name: "Catalan Opening" },
  { line: ["c4"], name: "English Opening" },
  { line: ["d4", "f5"], name: "Dutch Defense" }
];

export function detectOpening(moveSans: string[]) {
  const normalized = moveSans.map((move) => move.replace(/[+#?!]/g, ""));

  const match = OPENING_BOOK.find((opening) =>
    opening.line.every((move, index) => normalized[index] === move)
  );

  return match?.name ?? null;
}
