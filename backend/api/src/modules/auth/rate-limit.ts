/**
 * In-memory failed-attempt limiter, keyed by email. Login requests arrive from the Next
 * servers (not browsers), so client IPs aren't meaningful here; per-account limiting is
 * what stops password guessing. Single-process only: move to Redis if the API scales out.
 */
export class FailureLimiter {
  private readonly entries = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly maxFailures = 10,
    private readonly windowMs = 15 * 60_000,
    private readonly now: () => number = Date.now,
  ) {}

  /** Seconds until the key may try again, or 0 if it isn't blocked. */
  retryAfterSeconds(key: string): number {
    const entry = this.live(key);
    if (!entry || entry.count < this.maxFailures) return 0;
    return Math.ceil((entry.resetAt - this.now()) / 1000);
  }

  recordFailure(key: string): void {
    const entry = this.live(key) ?? { count: 0, resetAt: this.now() + this.windowMs };
    entry.count += 1;
    this.entries.set(key, entry);
    if (this.entries.size > 10_000) this.sweep();
  }

  reset(key: string): void {
    this.entries.delete(key);
  }

  private live(key: string) {
    const entry = this.entries.get(key);
    if (entry && entry.resetAt <= this.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return entry;
  }

  private sweep() {
    const now = this.now();
    for (const [key, entry] of this.entries) if (entry.resetAt <= now) this.entries.delete(key);
  }
}
