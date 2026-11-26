import { describe, expect, it } from "vitest";
import { effectiveStatus } from "../src/modules/founder/repo/compliance";

const now = new Date("2026-06-15T12:00:00Z");
const past = new Date("2026-06-01T12:00:00Z");
const future = new Date("2026-07-01T12:00:00Z");

describe("effectiveStatus", () => {
  it("marks an open obligation with a confirmed past date as overdue", () => {
    expect(effectiveStatus("upcoming", past, "confirmed", now)).toBe("overdue");
    expect(effectiveStatus("in_progress", past, "confirmed", now)).toBe("overdue");
  });

  it("never marks closed obligations overdue", () => {
    for (const status of ["completed", "submitted", "not_applicable"]) {
      expect(effectiveStatus(status, past, "confirmed", now)).toBe(status);
    }
  });

  it("does not treat an unconfirmed date as overdue", () => {
    expect(effectiveStatus("needs_confirmation", past, "pending_confirmation", now)).toBe("needs_confirmation");
  });

  it("leaves future and undated obligations unchanged", () => {
    expect(effectiveStatus("upcoming", future, "confirmed", now)).toBe("upcoming");
    expect(effectiveStatus("needs_confirmation", null, "pending_confirmation", now)).toBe("needs_confirmation");
  });

  it("clears a stale stored overdue once the date moves into the future", () => {
    expect(effectiveStatus("overdue", future, "confirmed", now)).toBe("upcoming");
    expect(effectiveStatus("overdue", null, "pending_confirmation", now)).toBe("needs_confirmation");
  });
});
