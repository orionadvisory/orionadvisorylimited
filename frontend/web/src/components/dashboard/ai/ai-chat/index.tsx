"use client";

import { ShieldCheck, Sparkles } from "lucide-react";
import { Chip } from "@orion/ui/components/ui/chip";
import { ChatComposer } from "./chat-composer";
import { MessageBubble } from "./message-bubble";
import { useChat } from "./use-chat";

/** Compact one-row header so the conversation keeps the vertical space. */
function ChatHeader({ isStreaming }: { isStreaming: boolean }) {
  return (
    <div className="shrink-0 border-b border-line/70 px-4 pb-3 pt-1 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-ink text-cloud">
            <Sparkles className="size-4" aria-hidden="true" />
            <span
              aria-hidden="true"
              className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-canvas bg-aurora"
            />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-brand">Legal co-pilot</p>
            <h1 className="truncate font-display text-2xl leading-none tracking-tight text-ink sm:text-[1.7rem]">
              Ask <em className="text-brand">Orion</em>
            </h1>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Chip tone="teal" className="hidden sm:inline-flex" icon={<ShieldCheck />}>
            Knows your startup profile
          </Chip>
          <Chip tone={isStreaming ? "gold" : "neutral"}>{isStreaming ? "Typing…" : "Online"}</Chip>
        </div>
      </div>
    </div>
  );
}

export default function AiChat() {
  const { messages, input, setInput, isStreaming, handleSend, bottomRef, inputRef } = useChat();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChatHeader isStreaming={isStreaming} />

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-3xl space-y-5">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <ChatComposer
        input={input}
        setInput={setInput}
        isStreaming={isStreaming}
        onSend={handleSend}
        inputRef={inputRef}
      />
    </div>
  );
}
