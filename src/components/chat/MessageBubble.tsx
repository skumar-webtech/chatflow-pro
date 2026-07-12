import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Pencil, Trash2, Check, X } from "lucide-react";
import type { ChatMessage } from "@/lib/chat-socket";

export function MessageBubble({
  message,
  isMe,
  showMeta,
  onEdit,
  onDelete,
}: {
  message: ChatMessage;
  isMe: boolean;
  showMeta: boolean;
  onEdit?: (id: string, text: string) => void;
  onDelete?: (id: string) => void;
}) {
  const time = format(message.createdAt, "h:mm a");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.text);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(draft.length, draft.length);
    }
  }, [editing, draft.length]);

  const commit = () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === message.text) {
      setEditing(false);
      setDraft(message.text);
      return;
    }
    onEdit?.(message.id, trimmed);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(message.text);
    setEditing(false);
  };

  if (message.deleted) {
    return (
      <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-[80%] rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-2 text-xs italic text-muted-foreground`}
        >
          Message deleted
        </div>
      </div>
    );
  }

  return (
    <div className={`group flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[80%] flex-col ${isMe ? "items-end" : "items-start"}`}>
        {showMeta && !isMe && (
          <span className="mb-1 px-1 text-xs font-medium text-muted-foreground">
            {message.username}
          </span>
        )}

        <div className={`flex items-center gap-1.5 ${isMe ? "flex-row-reverse" : ""}`}>
          <div
            className={`relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-lg backdrop-blur-md transition ${
              isMe
                ? "bg-gradient-primary text-primary-foreground rounded-br-md ring-1 ring-white/20"
                : "bg-white/25 text-foreground border border-white/30 rounded-bl-md dark:bg-white/10 dark:border-white/15"
            }`}
          >
            {editing ? (
              <div className="flex flex-col gap-2">
                <textarea
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      commit();
                    } else if (e.key === "Escape") {
                      cancel();
                    }
                  }}
                  rows={1}
                  className="min-w-[180px] resize-none rounded-md bg-background/20 px-2 py-1 text-sm text-inherit outline-none placeholder:text-primary-foreground/60 focus:ring-2 focus:ring-primary-foreground/40"
                />
                <div className="flex justify-end gap-1">
                  <button
                    onClick={cancel}
                    className="rounded-md bg-background/20 p-1 hover:bg-background/30"
                    aria-label="Cancel edit"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={commit}
                    className="rounded-md bg-background/30 p-1 hover:bg-background/40"
                    aria-label="Save edit"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-wrap break-words">{message.text}</p>
            )}
            {!editing && (
              <span
                className={`ml-2 mt-1 inline-block text-[10px] tabular-nums ${
                  isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                {time}
                {message.editedAt && <span className="ml-1 italic">(edited)</span>}
              </span>
            )}
          </div>

          {isMe && !editing && (
            <div className="flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:flex-row">
              <button
                onClick={() => {
                  setDraft(message.text);
                  setEditing(true);
                }}
                className="grid h-7 w-7 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition hover:bg-accent hover:text-foreground"
                aria-label="Edit message"
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => {
                  if (confirm("Delete this message?")) onDelete?.(message.id);
                }}
                className="grid h-7 w-7 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition hover:bg-destructive/10 hover:text-destructive"
                aria-label="Delete message"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
