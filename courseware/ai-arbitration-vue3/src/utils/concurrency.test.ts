import { describe, expect, it } from "vitest";

import { runWithConcurrency } from "./concurrency";

describe("runWithConcurrency", () => {
  it("processes all items while respecting the concurrency limit", async () => {
    let active = 0;
    let maxActive = 0;
    const completed: number[] = [];

    await runWithConcurrency([1, 2, 3, 4, 5], 3, async (item) => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await new Promise((resolve) => setTimeout(resolve, 10));
      completed.push(item);
      active -= 1;
    });

    expect(completed.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);
    expect(maxActive).toBeLessThanOrEqual(3);
  });
});
