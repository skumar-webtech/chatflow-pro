// Simple client-only session store for the dummy auth username.
// Kept out of localStorage-during-render paths to stay SSR-safe.

let currentUsername: string | null = null;
const listeners = new Set<() => void>();

export function getUsername(): string | null {
  return currentUsername;
}

export function setUsername(name: string | null) {
  currentUsername = name;
  listeners.forEach((l) => l());
}

export function subscribeUsername(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
