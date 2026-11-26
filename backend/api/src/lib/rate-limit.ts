/**
 * Fixed-window request limiter (in-memory, single process). Used to cap spend on the
 * LLM-backed endpoints. Move to Redis if the API runs more than one instance.
 */
export class RateLimiter {
  private readonly windows = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  /** Records a hit. Returns 0 if allowed, otherwise seconds until the window resets. */
  hit(key: string): number {
    const now = this.now();
    let w = this.windows.get(key);
    if (!w || w.resetAt <= now) {
      w = { count: 0, resetAt: now + this.windowMs };
      this.windows.set(key, w);
      if (this.windows.size > 10_000) this.sweep(now);
    }
    if (w.count >= this.limit) return Math.ceil((w.resetAt - now) / 1000);
    w.count += 1;
    return 0;
  }

  private sweep(now: number) {
    for (const [k, w] of this.windows) if (w.resetAt <= now) this.windows.delete(k);
  }
}

/** Spend limits for LLM-backed endpoints. Generous for real use, tight enough to stop abuse. */
export type AiLimits = {
  /** Guest health-check scoring, per client IP. */
  guestScoringPerIp: RateLimiter;
  /** Guest health-check scoring, across all guests (stops IP-rotation abuse). */
  guestScoringGlobal: RateLimiter;
  /** Signed-in AI calls (scoring, re-evaluation, generation, chat), per user. */
  perUser: RateLimiter;
};

export function defaultAiLimits(): AiLimits {
  const HOUR = 60 * 60 * 1000;
  return {
    guestScoringPerIp: new RateLimiter(5, HOUR),
    guestScoringGlobal: new RateLimiter(200, HOUR),
    perUser: new RateLimiter(60, HOUR),
  };
}
