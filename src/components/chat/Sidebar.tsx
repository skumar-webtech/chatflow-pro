import { MessageCircle, LogOut, X } from "lucide-react";
import { setUsername } from "@/lib/session";
import type { ChatUser } from "@/lib/chat-socket";

interface SidebarProps {
  me: string;
  users: ChatUser[];
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ me, users, open, onClose }: SidebarProps) {
  const online = users.filter((u) => u.online);

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-foreground/40 backdrop-blur-sm transition-opacity md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-80 max-w-[85vw] flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-transform md:static md:z-auto md:w-72 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-sidebar-border px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold">Pulse Chat</h1>
              <p className="truncate text-xs text-muted-foreground">#general</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-muted-foreground hover:bg-sidebar-accent md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="px-2 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Online — {online.length}
          </div>
          <ul className="space-y-1">
            {online.map((u) => (
              <li key={u.username}>
                <div className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-sidebar-accent">
                  <Avatar name={u.username} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {u.username}
                      {u.username === me && (
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                          (you)
                        </span>
                      )}
                    </p>
                  </div>
                  <span
                    className="h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_0_3px_color-mix(in_oklab,var(--success)_25%,transparent)]"
                    aria-label="online"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/60 px-3 py-2">
            <Avatar name={me} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{me}</p>
              <p className="text-xs text-muted-foreground">Signed in</p>
            </div>
            <button
              onClick={() => setUsername(null)}
              className="rounded-md p-2 text-muted-foreground transition hover:bg-sidebar hover:text-foreground"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const hue = Math.abs(hash(name)) % 360;
  return (
    <div
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-primary-foreground"
      style={{
        background: `linear-gradient(135deg, oklch(0.7 0.15 ${hue}), oklch(0.55 0.18 ${(hue + 40) % 360}))`,
      }}
    >
      {initials}
    </div>
  );
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}
