import type { RefObject } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { cn } from "@orion/ui/utils";

const chips = [
  "What legal issues should I fix first?",
  "Explain vesting schedules",
  "Do I need an NDA?",
  "Am I ready for fundraising?",
];

/** Pinned bottom composer: suggestion chips + rounded pill input with a round send button. */
export function ChatComposer({
  input,
  setInput,
  isStreaming,
  onSend,
  inputRef,
}: {
  input: string;
  setInput: (v: string) => void;
  isStreaming: boolean;
  onSend: (text?: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  const canSend = !!input.trim() && !isStreaming;

  return (
    <div className="shrink-0 border-t border-line/70 bg-canvas/85 px-4 pb-3 pt-3 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="-mx-4 mb-2.5 flex gap-2 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onSend(chip)}
              disabled={isStreaming}
              className="focus-ring shrink-0 whitespace-nowrap rounded-full border border-line bg-white/80 px-3 py-1.5 text-xs font-medium text-ink-soft transition-all duration-200 hover:-translate-y-px hover:border-brand/30 hover:bg-brand-soft hover:text-brand disabled:pointer-events-none disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-full border border-line bg-white py-1.5 pl-5 pr-1.5 shadow-bento transition-all focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
          <label htmlFor="ai-chat-input" className="sr-only">
            Ask Orion
          </label>
          <input
            id="ai-chat-input"
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSend()}
            placeholder="Ask Orion anything about your legal setup..."
            className="min-w-0 flex-1 bg-transparent py-1.5 text-[0.95rem] text-ink outline-none placeholder:text-mist/60"
            disabled={isStreaming}
          />
          <button
            type="button"
            onClick={() => onSend()}
            disabled={!canSend}
            aria-label="Send message"
            className={cn(
              "focus-ring grid size-10 shrink-0 place-items-center rounded-full transition-all duration-300",
              canSend ? "bg-ink text-cloud hover:bg-brand hover:-rotate-12" : "bg-canvas-deep text-mist"
            )}
          >
            {isStreaming ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <ArrowUp className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
        <p className="mt-2 text-center text-[0.65rem] text-mist">
          Orion provides guidance, not legal advice. Consult a licensed attorney for binding decisions.
        </p>
      </div>
    </div>
  );
}
