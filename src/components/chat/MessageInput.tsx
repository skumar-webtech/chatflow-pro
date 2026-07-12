import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Send } from "lucide-react";

export function MessageInput({
  onSend,
  onTyping,
  onTypingStop,
  disabled,
}: {
  onSend: (text: string) => void;
  onTyping: () => void;
  onTypingStop: () => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSent = useRef(0);

  const submit = () => {
    if (!value.trim()) return;
    onSend(value);
    onTypingStop();
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
      onTypingStop();
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
      onTypingStop();
    };
  }, [onTypingStop]);

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-t border-white/15 bg-white/10 px-3 py-3 backdrop-blur-2xl backdrop-saturate-150 dark:bg-white/5 sm:px-6 sm:py-4">
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-white/25 bg-white/20 px-3 py-2 shadow-lg backdrop-blur-md transition focus-within:border-white/50 focus-within:ring-4 focus-within:ring-primary/25 dark:bg-white/5">
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
          className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-foreground/50"
        />
        <button
          onClick={submit}
          disabled={disabled || !value.trim()}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow ring-1 ring-white/20 transition hover:brightness-110 hover:scale-105 disabled:opacity-40 disabled:shadow-none disabled:hover:scale-100"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
