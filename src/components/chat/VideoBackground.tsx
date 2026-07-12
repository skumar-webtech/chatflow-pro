import darkBg from "../../../public/assets/Dark-BG.mp4.asset.json";
import lightBg from "../../../public/assets/Light-BG.mp4.asset.json";
import type { Theme } from "@/lib/theme";

export function VideoBackground({ theme }: { theme: Theme }) {
  const src = theme === "dark" ? darkBg.url : lightBg.url;
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <video
        key={src}
        aria-hidden="true"
        className="h-full w-full object-cover transition-opacity duration-700"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      >
        <source src={src} type="video/mp4" />
      </video>
      <div
        className={
          theme === "dark"
            ? "absolute inset-0 bg-gradient-to-br from-slate-950/70 via-slate-900/50 to-indigo-950/60"
            : "absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-sky-100/40"
        }
      />
    </div>
  );
}
