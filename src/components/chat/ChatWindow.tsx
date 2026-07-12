import { useEffect, useRef, useState, type ReactNode } from "react";
import { format, isSameDay } from "date-fns";
import { Menu, ArrowDown, Sun, Moon, Info } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { ConnectionBanner } from "./ConnectionBanner";
import { TypingIndicator } from "./TypingIndicator";
import type { ChatMessage } from "@/lib/chat-socket";
import type { Theme } from "@/lib/theme";

interface ChatWindowProps {
  me: string;
  messages: ChatMessage[];
  loading: boolean;
  connected: boolean;
  theme: Theme;
  onToggleTheme: () => void;
  onOpenInfo: () => void;
  notificationBanner?: ReactNode;
  typingUser: string | null;
  onSend: (text: string) => void;
  onTyping: () => void;
  onTypingStop: () => void;
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
  theme,
  onToggleTheme,
  onOpenInfo,
  notificationBanner,
  typingUser,
  onSend,
  onTyping,
  onTypingStop,
  onEdit,
  onDelete,
  onOpenSidebar,
  onlineCount,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pinnedToBottom, setPinnedToBottom] = useState(true);

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
    <section className="relative flex h-dvh min-w-0 flex-1 flex-col">
      <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-white/15 bg-white/10 px-3 py-3 backdrop-blur-2xl backdrop-saturate-150 dark:bg-white/5 sm:px-6">
        <button
          onClick={onOpenSidebar}
          className="rounded-lg p-2 text-foreground/70 transition hover:bg-white/20 md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold tracking-tight">#general</h2>
          <p className="truncate text-xs text-foreground/70">
            {onlineCount} {onlineCount === 1 ? "person" : "people"} online
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="mr-1 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-foreground/80 backdrop-blur-md">
            <span
              className={`inline-block h-2 w-2 rounded-full ${connected ? "bg-success shadow-[0_0_8px_var(--success)]" : "bg-destructive"}`}
            />
            <span className="hidden sm:inline">{connected ? "Live" : "Offline"}</span>
          </div>
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            title={theme === "dark" ? "Switch to light" : "Switch to dark"}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 text-foreground/80 backdrop-blur-md transition hover:bg-white/25 hover:text-foreground hover:scale-105"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={onOpenInfo}
            aria-label="Creator info"
            title="Creator info"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 text-foreground/80 backdrop-blur-md transition hover:bg-white/25 hover:text-foreground hover:scale-105"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
      </header>

      <ConnectionBanner connected={connected} />
      {notificationBanner}

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-6 sm:px-6"
        style={{ scrollbarGutter: "stable" }}
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-1">
          {loading && (
            <p className="text-center text-sm text-foreground/70">Loading messages...</p>
          )}
          {messages.map((m, i) => {
            const prev = messages[i - 1];
            const newDay = !prev || !isSameDay(prev.createdAt, m.createdAt);
            const changeAuthor = !prev || prev.username !== m.username || newDay;
            return (
              <div key={m.id} className={changeAuthor ? "mt-3" : ""}>
                {newDay && (
                  <div className="my-4 flex items-center gap-3 text-xs text-foreground/60">
                    <span className="h-px flex-1 bg-white/20" />
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-0.5 backdrop-blur-md">
                      {format(m.createdAt, "EEEE, MMM d")}
                    </span>
                    <span className="h-px flex-1 bg-white/20" />
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
            className="absolute -top-12 right-4 grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-white/20 text-foreground shadow-md backdrop-blur-md transition hover:bg-white/30"
            aria-label="Scroll to latest"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        )}
        <div className="px-3 sm:px-6">
          <TypingIndicator username={typingUser} />
        </div>
        <MessageInput
          onSend={onSend}
          onTyping={onTyping}
          onTypingStop={onTypingStop}
          disabled={!connected}
        />
      </div>
    </section>
  );
}
