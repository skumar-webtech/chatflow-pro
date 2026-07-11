import { useEffect, useRef, useState } from "react";
import { format, isSameDay } from "date-fns";
import { Menu, ArrowDown } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { ConnectionBanner } from "./ConnectionBanner";
import { TypingIndicator } from "./TypingIndicator";
import type { ChatMessage } from "@/lib/chat-socket";

interface ChatWindowProps {
  me: string;
  messages: ChatMessage[];
  loading: boolean;
  connected: boolean;
  typingUser: string | null;
  onSend: (text: string) => void;
  onTyping: () => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onOpenSidebar: () => void;
  onlineCount: number;
}

export function ChatWindow({
  me,
  messages,
  loading,
  connected,
  typingUser,
  onSend,
  onTyping,
  onEdit,
  onDelete,
  onOpenSidebar,
  onlineCount,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pinnedToBottom, setPinnedToBottom] = useState(true);

  // Track whether the user is near the bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      setPinnedToBottom(distance < 80);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-scroll when new messages arrive AND user hasn't scrolled up.
  useEffect(() => {
    if (!pinnedToBottom) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typingUser, pinnedToBottom]);

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  return (
    <section className="relative flex h-dvh min-w-0 flex-1 flex-col bg-background">
      <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card/60 px-3 py-3 backdrop-blur-xl sm:px-6">
        <button
          onClick={onOpenSidebar}
          className="rounded-lg p-2 text-muted-foreground transition hover:bg-accent md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold tracking-tight">#general</h2>
          <p className="truncate text-xs text-muted-foreground">
            {onlineCount} {onlineCount === 1 ? "person" : "people"} online
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className={`inline-block h-2 w-2 rounded-full ${connected ? "bg-success" : "bg-destructive"}`}
          />
          <span className="hidden sm:inline">{connected ? "Live" : "Offline"}</span>
        </div>
      </header>

      <ConnectionBanner connected={connected} />

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-6 sm:px-6"
        style={{ scrollbarGutter: "stable" }}
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-1">
          {loading && (
            <p className="text-center text-sm text-muted-foreground">Loading messages...</p>
          )}
          {messages.map((m, i) => {
            const prev = messages[i - 1];
            const newDay = !prev || !isSameDay(prev.createdAt, m.createdAt);
            const changeAuthor = !prev || prev.username !== m.username || newDay;
            return (
              <div key={m.id} className={changeAuthor ? "mt-3" : ""}>
                {newDay && (
                  <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="h-px flex-1 bg-border" />
                    <span>{format(m.createdAt, "EEEE, MMM d")}</span>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                )}
                <MessageBubble
                  message={m}
                  isMe={m.username === me}
                  showMeta={changeAuthor}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative">
        {!pinnedToBottom && (
          <button
            onClick={scrollToBottom}
            className="absolute -top-12 right-4 grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-foreground shadow-md transition hover:bg-accent"
            aria-label="Scroll to latest"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        )}
        <div className="px-3 sm:px-6">
          <TypingIndicator username={typingUser} />
        </div>
        <MessageInput onSend={onSend} onTyping={onTyping} disabled={!connected} />
      </div>
    </section>
  );
}
