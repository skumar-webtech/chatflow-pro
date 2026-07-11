import { useState, type FormEvent } from "react";
import { setUsername } from "@/lib/session";
import { MessageCircle } from "lucide-react";

import { BackendWarmupBanner } from "./BackendWarmupBanner";

type LoginScreenProps = {
  showWarmupMessage?: boolean;
  warmupFailed?: boolean;
};

export function LoginScreen({ showWarmupMessage = false, warmupFailed = false }: LoginScreenProps) {
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
      <video
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      >
        <source src="/assets/bg.mp4" type="video/mp4" />
      </video>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,var(--accent-glow),transparent_55%),radial-gradient(circle_at_80%_90%,var(--primary-glow),transparent_50%)] opacity-70" />
      <div className="relative w-full max-w-md">
        {showWarmupMessage && <BackendWarmupBanner warmupFailed={warmupFailed} />}
        <div className="rounded-[2rem] border border-white/25 bg-white/12 p-8 shadow-[0_24px_80px_-28px_rgba(15,23,42,0.45)] backdrop-blur-3xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/10">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Pulse Chat</h1>
              <p className="text-xs text-foreground/70">Real-time conversations, simplified.</p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">Jump in</h2>
          <p className="mt-1 text-sm text-foreground/70">
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
                className="mt-1.5 w-full rounded-xl border border-white/18 bg-white/25 px-4 py-3 text-base text-foreground outline-none placeholder:text-foreground/35 ring-ring/40 transition backdrop-blur-md focus:border-white/35 focus:bg-white/30 focus:ring-4"
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

          <p className="mt-6 text-center text-xs text-foreground/65">
            You'll be greeted by a few friendly bots so it doesn't feel lonely.
          </p>
          <p className="mt-2 text-center text-xs text-foreground/65">
            Browser notifications are requested automatically after you enter the chat.
          </p>
        </div>
      </div>
    </div>
  );
}
