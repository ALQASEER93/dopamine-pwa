import { describe, expect, it } from "vitest";
import { averageDurationMinutes } from "../../lib/stats-utils";

describe("averageDurationMinutes", () => {
  it("returns 0 for invalid input", () => {
    expect(averageDurationMinutes(0, 0)).toBe(0);
    expect(averageDurationMinutes(-10, 5)).toBe(0);
    expect(averageDurationMinutes(100, 0)).toBe(0);
  });

  it("computes average in minutes with one decimal", () => {
    // totalSeconds = 600, count = 2 => 5 minutes
    expect(averageDurationMinutes(600, 2)).toBe(5);

    // totalSeconds = 750, count = 2 => 6.25 minutes => 6.3
    expect(averageDurationMinutes(750, 2)).toBe(6.3);
  });
});

