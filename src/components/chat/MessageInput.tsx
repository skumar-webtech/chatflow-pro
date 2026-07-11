import { useRef, useState, type KeyboardEvent } from "react";
import { Send } from "lucide-react";

export function MessageInput({
  onSend,
  onTyping,
  disabled,
}: {
  onSend: (text: string) => void;
  onTyping: () => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSent = useRef(0);

  const submit = () => {
    if (!value.trim()) return;
    onSend(value);
    setValue("");
  };

  const debouncedTyping = () => {
    const now = Date.now();
    if (now - lastTypingSent.current > 1500) {
      onTyping();
      lastTypingSent.current = now;
    }
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      lastTypingSent.current = 0;
    }, 2000);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-t border-border bg-background/80 px-3 py-3 backdrop-blur-lg sm:px-6 sm:py-4">
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-border bg-card px-3 py-2 shadow-sm focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/30 transition">
        <textarea
          value={value}
          rows={1}
          onChange={(e) => {
            setValue(e.target.value);
            debouncedTyping();
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = Math.min(el.scrollHeight, 160) + "px";
          }}
          onKeyDown={onKeyDown}
          disabled={disabled}
          placeholder="Message #general"
          className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          onClick={submit}
          disabled={disabled || !value.trim()}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow transition hover:brightness-110 disabled:opacity-40 disabled:shadow-none"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
