import { Wifi, WifiOff } from "lucide-react";

export function ConnectionBanner({ connected }: { connected: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 border-b px-4 py-1.5 text-xs font-medium transition-colors ${
        connected
          ? "border-transparent bg-success/10 text-success"
          : "border-destructive/30 bg-destructive/10 text-destructive"
      }`}
    >
      {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
      <span>{connected ? "Connected — live" : "Reconnecting..."}</span>
    </div>
  );
}
