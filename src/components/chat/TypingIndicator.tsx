export function TypingIndicator({ username }: { username: string | null }) {
  return (
    <div
      className={`flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground transition-opacity ${
        username ? "opacity-100" : "opacity-0"
      }`}
      aria-live="polite"
    >
      <span className="flex gap-1">
        <Dot delay="0ms" />
        <Dot delay="150ms" />
        <Dot delay="300ms" />
      </span>
      <span>{username ? `${username} is typing...` : "\u00A0"}</span>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70"
      style={{ animationDelay: delay }}
    />
  );
}
