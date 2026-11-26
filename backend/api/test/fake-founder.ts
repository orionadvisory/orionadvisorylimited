import type { Llm } from "../src/lib/llm";
import { RateLimiter, type AiLimits } from "../src/lib/rate-limit";
import type { Storage } from "../src/lib/storage";
import type { FounderRepo } from "../src/modules/founder/repo";
import type { FounderDeps } from "../src/modules/founder/routes";

/** Every repo method throws unless a test supplies it — so a test can't pass by accident. */
export function fakeRepo(overrides: Partial<FounderRepo> = {}): FounderRepo {
  return new Proxy(overrides as FounderRepo, {
    get(target, prop: string) {
      if (prop in target) return target[prop as keyof FounderRepo];
      return () => {
        throw new Error(`FounderRepo.${prop} not stubbed in this test`);
      };
    },
  });
}

/** LLM fake: returns queued completions / stream chunks and records the prompts it saw. */
export class FakeLlm implements Llm {
  calls: { messages: { role: string; content: string }[] }[] = [];
  constructor(
    private readonly completions: Array<string | Error> = [],
    private readonly chunks: string[] | Error = [],
  ) {}
  async complete(messages: { role: "system" | "user" | "assistant"; content: string }[]) {
    this.calls.push({ messages });
    const next = this.completions.shift();
    if (next === undefined) throw new Error("FakeLlm: no completion queued");
    if (next instanceof Error) throw next;
    return next;
  }
  async stream(messages: { role: "system" | "user" | "assistant"; content: string }[]) {
    this.calls.push({ messages });
    if (this.chunks instanceof Error) throw this.chunks;
    const chunks = this.chunks;
    return (async function* () {
      for (const c of chunks) yield c;
    })();
  }
}

export class FakeStorage implements Storage {
  objects = new Map<string, { body: string | Uint8Array; contentType: string }>();
  reads: string[] = [];
  async put(key: string, body: string | Uint8Array, contentType: string) {
    this.objects.set(key, { body, contentType });
  }
  async getBuffer(key: string) {
    this.reads.push(key);
    const o = this.objects.get(key);
    if (!o) throw new Error(`no object ${key}`);
    return Buffer.from(o.body as Uint8Array);
  }
  async delete(key: string) {
    this.objects.delete(key);
  }
  async signedUrl(key: string) {
    return `https://storage.example/${encodeURIComponent(key)}?sig=test`;
  }
  async extractText(buffer: Buffer) {
    return buffer.toString("utf-8");
  }
}

export function generousLimits(): AiLimits {
  return {
    guestScoringPerIp: new RateLimiter(1000, 60_000),
    guestScoringGlobal: new RateLimiter(1000, 60_000),
    perUser: new RateLimiter(1000, 60_000),
  };
}

export function founderDeps(over: Partial<FounderDeps> = {}): FounderDeps {
  return {
    repo: over.repo ?? fakeRepo(),
    llm: over.llm ?? new FakeLlm(),
    storage: over.storage ?? new FakeStorage(),
    limits: over.limits ?? generousLimits(),
  };
}
