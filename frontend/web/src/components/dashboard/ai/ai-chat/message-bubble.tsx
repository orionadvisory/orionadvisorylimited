import { Sparkles } from "lucide-react";
import type { Message } from "./use-chat";

function formatMessage(content: string) {
  return content
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function ThinkingDots() {
  return (
    <span className="flex items-center gap-2 py-1 text-mist" role="status">
      <span className="flex gap-1" aria-hidden="true">
        {[0, 150, 300].map((d) => (
          <span
            key={d}
            className="size-1.5 animate-bounce rounded-full bg-brand/70 motion-reduce:animate-none"
            style={{ animationDelay: `${d}ms` }}
          />
        ))}
      </span>
      <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em]">Thinking</span>
    </span>
  );
}

/** Assistant: white card with an Orion icon chip. User: ink pill, right-aligned. */
export function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] sm:max-w-[70%]">
          <div className="break-words rounded-[22px] rounded-br-md bg-ink px-4 py-2.5 text-sm leading-relaxed text-cloud shadow-bento">
            <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
          </div>
          <p className="mt-1 pr-2 text-right font-mono text-[0.6rem] uppercase tracking-[0.14em] text-mist/80">
            You · {formatTime(msg.timestamp)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 sm:gap-3">
      <span
        aria-hidden="true"
        className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-brand-soft text-brand ring-4 ring-canvas"
      >
        <Sparkles className="size-3.5" />
      </span>
      <div className="min-w-0 max-w-[88%] sm:max-w-[75%]">
        <div className="break-words rounded-[22px] rounded-tl-md border border-line bg-white px-4 py-3 text-sm leading-relaxed text-ink-soft shadow-bento [&_strong]:font-semibold [&_strong]:text-ink">
          {msg.content ? <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} /> : <ThinkingDots />}
        </div>
        {msg.content && (
          <p className="mt-1 pl-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-mist/80">
            Orion · {formatTime(msg.timestamp)}
          </p>
        )}
      </div>
    </div>
  );
}
