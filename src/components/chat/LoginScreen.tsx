import { useState, type FormEvent } from "react";
import { setUsername } from "@/lib/session";
import { MessageCircle } from "lucide-react";

export function LoginScreen() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const name = value.trim();
    if (name.length < 2) {
      setError("Pick a name with at least 2 characters.");
      return;
    }
    if (name.length > 20) {
      setError("Keep it under 20 characters.");
      return;
    }
    setUsername(name);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,var(--accent-glow),transparent_55%),radial-gradient(circle_at_80%_90%,var(--primary-glow),transparent_50%)] opacity-70" />
      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-border/60 bg-card/80 p-8 shadow-elegant backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Pulse Chat</h1>
              <p className="text-xs text-muted-foreground">Real-time conversations, simplified.</p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">Jump in</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a display name to join the room. No account needed.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-3">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Display name
              </span>
              <input
                autoFocus
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. alex"
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none ring-ring/40 transition focus:border-ring focus:ring-4"
                maxLength={24}
              />
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 active:scale-[0.99]"
            >
              Enter chat
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            You'll be greeted by a few friendly bots so it doesn't feel lonely.
          </p>
        </div>
      </div>
    </div>
  );
}
