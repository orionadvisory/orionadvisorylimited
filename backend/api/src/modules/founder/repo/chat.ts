import { desc, eq } from "drizzle-orm";
import { getDb, getOrCreateStartup, schema } from "./shared";
import type { FounderRepo } from "./types";

type ChatRepo = Pick<FounderRepo, "getChatContext" | "saveChatMessage">;

export const chatRepo: ChatRepo = {
  /** Always the caller's own startup: a client-supplied startup id is never trusted. */
  async getChatContext(userId) {
    const startup = await getOrCreateStartup(userId);
    const db = await getDb();
    const { legalIssues, chatMessages } = await schema();
    const [issues, recent] = await Promise.all([
      db
        .select({
          title: legalIssues.title,
          severity: legalIssues.severity,
          domain: legalIssues.domain,
          isResolved: legalIssues.isResolved,
        })
        .from(legalIssues)
        .where(eq(legalIssues.startupId, startup.id)),
      db
        .select({ role: chatMessages.role, content: chatMessages.content })
        .from(chatMessages)
        .where(eq(chatMessages.startupId, startup.id))
        .orderBy(desc(chatMessages.createdAt))
        .limit(10),
    ]);
    const history = recent
      .reverse()
      .filter((m): m is { role: "user" | "assistant"; content: string } => m.role === "user" || m.role === "assistant");
    return { startup, issues, history };
  },

  async saveChatMessage({ userId, startupId, role, content }) {
    const db = await getDb();
    const { chatMessages } = await schema();
    await db.insert(chatMessages).values({ userId, startupId, role, content });
  },
};
