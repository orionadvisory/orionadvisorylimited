import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { ChatBodySchema } from "@orion/contracts";
import { ApiError } from "../../../lib/errors";
import type { ChatMessage } from "../../../lib/llm";
import { requireUser } from "../../../middleware/session";
import { CHAT_SYSTEM_PROMPT, buildChatContext } from "../prompts";
import { currentUserId, enforceUserAiLimit, errorResponse, json, type FounderDeps } from "./shared";

const chatRoute = createRoute({
  method: "post",
  path: "/v1/chat",
  tags: ["chat"],
  summary: "Ask the AI co-pilot (Server-Sent Events: `data: {content}` chunks, then `data: [DONE]`)",
  middleware: [requireUser] as const,
  request: { body: { content: json(ChatBodySchema), required: true } },
  responses: {
    200: { description: "SSE stream", content: { "text/event-stream": { schema: { type: "string" } } } },
    400: errorResponse("Invalid body"),
    401: errorResponse("Not signed in"),
    429: errorResponse("Rate limited"),
    502: errorResponse("AI unavailable"),
  },
});

const sse = (payload: unknown) => `data: ${typeof payload === "string" ? payload : JSON.stringify(payload)}\n\n`;

export function chatRoutes(deps: FounderDeps) {
  return new OpenAPIHono().openapi(chatRoute, async (c) => {
    const userId = currentUserId(c);
    const { message } = c.req.valid("json");
    enforceUserAiLimit(deps, userId);

    // Context is always the caller's own startup; any client-sent startupId is ignored.
    const ctx = await deps.repo.getChatContext(userId);
    const messages: ChatMessage[] = [
      { role: "system", content: CHAT_SYSTEM_PROMPT },
      { role: "system", content: buildChatContext(ctx) },
      ...ctx.history,
      { role: "user", content: message },
    ];

    let deltas: AsyncIterable<string>;
    try {
      deltas = await deps.llm.stream(messages, { temperature: 0.7, maxTokens: 1000 });
    } catch (err) {
      console.error(JSON.stringify({ level: "error", msg: "chat stream failed to start", err: String(err) }));
      throw new ApiError(502, "service_unavailable", "The assistant is unavailable right now. Please try again.");
    }
    await deps.repo.saveChatMessage({ userId, startupId: ctx.startup.id, role: "user", content: message });

    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        let full = "";
        try {
          for await (const delta of deltas) {
            full += delta;
            controller.enqueue(encoder.encode(sse({ content: delta })));
          }
          if (full) {
            await deps.repo.saveChatMessage({ userId, startupId: ctx.startup.id, role: "assistant", content: full });
          }
        } catch (err) {
          console.error(JSON.stringify({ level: "error", msg: "chat stream broke", err: String(err) }));
          controller.enqueue(encoder.encode(sse({ error: "The response was interrupted. Please try again." })));
        }
        controller.enqueue(encoder.encode(sse("[DONE]")));
        controller.close();
      },
    });

    return c.body(body, 200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    });
  });
}
