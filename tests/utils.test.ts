import { describe, expect, it } from "vitest";

import { formatClock, slugifyUsername } from "@/lib/utils";

describe("utility helpers", () => {
  it("formats chess clocks", () => {
    expect(formatClock(605)).toBe("10:05");
  });

  it("slugifies usernames safely", () => {
    expect(slugifyUsername("John Kester II")).toBe("john_kester_ii");
  });
});
