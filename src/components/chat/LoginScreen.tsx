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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <video
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      >
        <source src="/assets/bg.mp4" type="video/mp4" />
      </video>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-950/50 via-indigo-950/40 to-purple-950/50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,var(--accent-glow),transparent_55%),radial-gradient(circle_at_80%_90%,var(--primary-glow),transparent_50%)] opacity-60" />

      <div className="relative w-full max-w-md animate-glass-in">
        {showWarmupMessage && <BackendWarmupBanner warmupFailed={warmupFailed} />}
        <div className="rounded-[2rem] border border-white/25 bg-white/10 p-8 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.7)] backdrop-blur-[40px] backdrop-saturate-150 ring-1 ring-white/10">
          <div className="mb-7 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow ring-1 ring-white/30">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h1
                className="text-lg font-bold tracking-tight text-white"
                style={{ textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}
              >
                Pulse Chat
              </h1>
              <p className="text-xs text-white/75">Real-time conversations, simplified.</p>
            </div>
          </div>

          <h2
            className="text-3xl font-bold tracking-tight text-white"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
          >
            Jump in
          </h2>
          <p className="mt-1.5 text-sm text-white/80">
            Choose a display name to join the room. No account needed.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-3">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
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
                className="mt-2 w-full rounded-xl border border-white/25 bg-white/15 px-4 py-3 text-base font-medium text-white outline-none ring-primary/50 backdrop-blur-md transition placeholder:text-white/45 focus:border-white/50 focus:bg-white/25 focus:ring-4"
                maxLength={24}
              />
            </label>
            {error && <p className="text-sm font-medium text-red-300">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow ring-1 ring-white/20 transition hover:brightness-110 hover:scale-[1.01] active:scale-[0.99]"
            >
              Enter chat
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-white/70">
            You'll be greeted by a few friendly bots so it doesn't feel lonely.
          </p>
          <p className="mt-2 text-center text-xs text-white/60">
            Browser notifications are requested automatically after you enter the chat.
          </p>
        </div>
      </div>
    </div>
  );
}

