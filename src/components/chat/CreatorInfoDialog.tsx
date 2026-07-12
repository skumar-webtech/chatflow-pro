import { useEffect } from "react";
import { X, ExternalLink, Sparkles } from "lucide-react";

export function CreatorInfoDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, 15000);
    return () => clearTimeout(t);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center px-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="creator-title"
    >
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-sm animate-scale-in rounded-3xl border border-white/25 bg-white/15 p-6 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.55)] backdrop-blur-2xl backdrop-saturate-150 dark:bg-white/10">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-white/25 bg-white/20 text-foreground/80 backdrop-blur-md transition hover:bg-white/40 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">
              Made with care
            </p>
            <h2 id="creator-title" className="text-lg font-semibold tracking-tight text-foreground">
              Creator
            </h2>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="rounded-2xl border border-white/25 bg-white/20 p-4 backdrop-blur-md dark:bg-white/5">
            <p className="text-xs uppercase tracking-wider text-foreground/60">
              Chat website creator
            </p>
            <p className="mt-1 text-base font-semibold text-foreground">Saurabh Kumar</p>
          </div>

          <a
            href="https://skumar.space"
            target="_blank"
            rel="noreferrer noopener"
            className="group flex items-center justify-between rounded-2xl border border-white/25 bg-white/20 p-4 backdrop-blur-md transition hover:border-white/40 hover:bg-white/30 dark:bg-white/5"
          >
            <div>
              <p className="text-xs uppercase tracking-wider text-foreground/60">Portfolio</p>
              <p className="mt-1 text-base font-semibold text-foreground group-hover:underline">
                skumar.space
              </p>
            </div>
            <ExternalLink className="h-4 w-4 text-foreground/70 transition group-hover:text-foreground" />
          </a>
        </div>

        <p className="mt-4 text-center text-[11px] text-foreground/55">
          This dialog will auto-close in 15 seconds.
        </p>
      </div>
    </div>
  );
}
