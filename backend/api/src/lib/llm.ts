/**
 * The only place the API talks to an LLM provider. Routes depend on the `Llm` interface,
 * so tests inject a fake and never call OpenAI.
 */
export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type CompletionOptions = { temperature?: number; maxTokens?: number };

export interface Llm {
  /** Single completion, returned as text. Throws LlmError on provider failure. */
  complete(messages: ChatMessage[], opts?: CompletionOptions): Promise<string>;
  /** Streamed completion, yielding text deltas. Throws LlmError if the stream can't start. */
  stream(messages: ChatMessage[], opts?: CompletionOptions): Promise<AsyncIterable<string>>;
}

export class LlmError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "LlmError";
  }
}

/** Models sometimes wrap JSON in ```json fences despite instructions; strip and parse. */
export function parseJsonLoose(raw: string): unknown {
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

export function createOpenAiLlm(config: { apiKey?: string; model: string }): Llm {
  type OpenAIClient = InstanceType<typeof import("openai").default>;
  let client: Promise<OpenAIClient> | undefined;
  const getClient = () =>
    (client ??= import("openai").then(({ default: OpenAI }) => new OpenAI({ apiKey: config.apiKey })));

  return {
    async complete(messages, opts = {}) {
      try {
        const openai = await getClient();
        const completion = await openai.chat.completions.create({
          model: config.model,
          messages,
          temperature: opts.temperature ?? 0.4,
          max_tokens: opts.maxTokens ?? 4000,
        });
        const text = completion.choices[0]?.message?.content;
        if (!text) throw new LlmError("Empty completion");
        return text;
      } catch (err) {
        throw err instanceof LlmError ? err : new LlmError("LLM request failed", err);
      }
    },

    async stream(messages, opts = {}) {
      let stream;
      try {
        const openai = await getClient();
        stream = await openai.chat.completions.create({
          model: config.model,
          messages,
          stream: true,
          temperature: opts.temperature ?? 0.7,
          max_tokens: opts.maxTokens ?? 1000,
        });
      } catch (err) {
        throw new LlmError("LLM stream failed to start", err);
      }
      return (async function* () {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) yield delta;
        }
      })();
    },
  };
}
