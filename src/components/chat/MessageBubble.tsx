import { format } from "date-fns";
import type { ChatMessage } from "@/lib/chat-socket";

export function MessageBubble({
  message,
  isMe,
  showMeta,
}: {
  message: ChatMessage;
  isMe: boolean;
  showMeta: boolean;
}) {
  const time = format(message.createdAt, "h:mm a");

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[80%] flex-col ${isMe ? "items-end" : "items-start"}`}>
        {showMeta && !isMe && (
          <span className="mb-1 px-1 text-xs font-medium text-muted-foreground">
            {message.username}
          </span>
        )}
        <div
          className={`group relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
            isMe
              ? "bg-gradient-primary text-primary-foreground rounded-br-md"
              : "bg-card text-card-foreground border border-border rounded-bl-md"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
          <span
            className={`ml-2 mt-1 inline-block text-[10px] tabular-nums ${
              isMe ? "text-primary-foreground/70" : "text-muted-foreground"
            }`}
          >
            {time}
          </span>
        </div>
      </div>
    </div>
  );
}
