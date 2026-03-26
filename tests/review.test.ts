import { describe, expect, it } from "vitest";

import { classifyMove, explainMove, scoreAccuracy } from "@/lib/review/classify";

describe("review classification", () => {
  it("marks small deltas as best", () => {
    expect(classifyMove({ delta: 8, openingPhase: false, improvement: 0 })).toBe("best");
  });

  it("marks large deltas as blunders", () => {
    expect(classifyMove({ delta: 420, openingPhase: false, improvement: -320 })).toBe("blunder");
  });

  it("marks strong improving tactical moves as brilliant", () => {
    expect(classifyMove({ delta: 16, openingPhase: false, improvement: 220 })).toBe("brilliant");
  });

  it("produces a stable explanation string", () => {
    expect(explainMove("mistake", "Nf3")).toContain("Nf3");
  });

  it("keeps accuracy inside the valid range", () => {
    expect(scoreAccuracy([0, 10, 25, 50, 200])).toBeGreaterThanOrEqual(0);
    expect(scoreAccuracy([0, 10, 25, 50, 200])).toBeLessThanOrEqual(100);
  });
});
