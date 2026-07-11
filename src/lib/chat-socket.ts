// Thin wrapper around socket.io-client with a built-in mock fallback so the
// UI is fully functional without a backend. Set VITE_API_BASE_URL to point
// at a real socket.io server; otherwise the mock takes over.

import { io, type Socket } from "socket.io-client";

export type ChatMessage = {
  id: string;
  username: string;
  text: string;
  createdAt: number;
};

export type ChatUser = {
  username: string;
  online: boolean;
};

export interface ChatSocket {
  connected: boolean;
  connect: (username: string) => void;
  disconnect: () => void;
  send: (text: string) => void;
  typing: () => void;
  on: <T = unknown>(event: string, cb: (payload: T) => void) => () => void;
}

const API = (import.meta as ImportMeta & { env: Record<string, string | undefined> })
  .env.VITE_API_BASE_URL;

/* ---------- Mock implementation ---------- */

type Listener = (payload: unknown) => void;

const BOTS = ["Ava", "Kai", "Noor", "Milo"];
const BOT_LINES = [
  "hey 👋",
  "did you see the new design?",
  "lol 😂",
  "brb, grabbing coffee",
  "sounds good to me",
  "anyone up for lunch?",
  "just pushed the fix",
  "typing tests are wild",
  "🔥🔥🔥",
  "let me know when you're free",
];

function makeMockSocket(): ChatSocket {
  const listeners = new Map<string, Set<Listener>>();
  let me = "";
  let connected = false;
  const users = new Map<string, ChatUser>();
  BOTS.forEach((u) => users.set(u, { username: u, online: true }));

  const emit = (event: string, payload: unknown) => {
    listeners.get(event)?.forEach((cb) => cb(payload));
  };

  let botTimer: ReturnType<typeof setInterval> | null = null;
  let typingTimer: ReturnType<typeof setTimeout> | null = null;

  const scheduleBotChatter = () => {
    if (botTimer) clearInterval(botTimer);
    botTimer = setInterval(() => {
      const bot = BOTS[Math.floor(Math.random() * BOTS.length)];
      // Typing indicator first
      emit("typing", { username: bot });
      if (typingTimer) clearTimeout(typingTimer);
      typingTimer = setTimeout(
        () => {
          const msg: ChatMessage = {
            id: crypto.randomUUID(),
            username: bot,
            text: BOT_LINES[Math.floor(Math.random() * BOT_LINES.length)],
            createdAt: Date.now(),
          };
          emit("message", msg);
        },
        1200 + Math.random() * 1500,
      );
    }, 9000);
  };

  return {
    get connected() {
      return connected;
    },
    connect(username) {
      me = username;
      connected = true;
      users.set(username, { username, online: true });
      setTimeout(() => {
        emit("connect", null);
        emit("users", Array.from(users.values()));
        emit("message", {
          id: crypto.randomUUID(),
          username: "Ava",
          text: `Welcome, ${username}! 🎉`,
          createdAt: Date.now(),
        } satisfies ChatMessage);
      }, 300);
      scheduleBotChatter();
    },
    disconnect() {
      connected = false;
      if (botTimer) clearInterval(botTimer);
      if (typingTimer) clearTimeout(typingTimer);
      users.delete(me);
      emit("disconnect", null);
    },
    send(text) {
      const msg: ChatMessage = {
        id: crypto.randomUUID(),
        username: me,
        text,
        createdAt: Date.now(),
      };
      // Echo back after the network "hop"
      setTimeout(() => emit("message", msg), 60);
    },
    typing() {
      // no-op for self in mock
    },
    on(event, cb) {
      const set = listeners.get(event) ?? new Set();
      set.add(cb as Listener);
      listeners.set(event, set);
      return () => set.delete(cb as Listener);
    },
  };
}

/* ---------- Real socket.io wrapper ---------- */

function makeRealSocket(url: string): ChatSocket {
  let socket: Socket | null = null;
  return {
    get connected() {
      return socket?.connected ?? false;
    },
    connect(username) {
      socket = io(url, { auth: { username }, transports: ["websocket"] });
    },
    disconnect() {
      socket?.disconnect();
      socket = null;
    },
    send(text) {
      socket?.emit("message", { text });
    },
    typing() {
      socket?.emit("typing");
    },
    on(event, cb) {
      socket?.on(event, cb as (...args: unknown[]) => void);
      return () => socket?.off(event, cb as (...args: unknown[]) => void);
    },
  };
}

let singleton: ChatSocket | null = null;
export function getChatSocket(): ChatSocket {
  if (singleton) return singleton;
  singleton = API ? makeRealSocket(API) : makeMockSocket();
  return singleton;
}

export const IS_MOCK = !API;

/* ---------- Message history (mock GET /api/messages) ---------- */

export async function fetchMessageHistory(): Promise<ChatMessage[]> {
  if (API) {
    const res = await fetch(`${API}/api/messages`);
    if (!res.ok) throw new Error("Failed to fetch messages");
    return res.json();
  }
  // Seed history
  const now = Date.now();
  return [
    { id: "h1", username: "Ava", text: "morning team ☀️", createdAt: now - 1000 * 60 * 32 },
    { id: "h2", username: "Kai", text: "morning!", createdAt: now - 1000 * 60 * 31 },
    {
      id: "h3",
      username: "Noor",
      text: "shipping the redesign today, wish me luck",
      createdAt: now - 1000 * 60 * 22,
    },
    { id: "h4", username: "Milo", text: "you got this 💪", createdAt: now - 1000 * 60 * 20 },
    {
      id: "h5",
      username: "Ava",
      text: "let me know if you want another pass on the copy",
      createdAt: now - 1000 * 60 * 12,
    },
  ];
}
