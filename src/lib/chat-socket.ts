import { io, type Socket } from "socket.io-client";

import { getApiUrl } from "@/services/api";

export type { ChatMessage, ChatUser } from "@/services/api";

export interface ChatSocket {
  connected: boolean;
  connect: (username: string) => void;
  disconnect: () => void;
  sendMessage: (msg: { content: string; clientId: string }) => void;
  startTyping: () => void;
  stopTyping: () => void;
  on: <T = unknown>(event: string, cb: (payload: T) => void) => () => void;
}

let singleton: Socket | null = null;
let activeUsername: string | null = null;

function ensureSocket() {
  if (!singleton) {
    singleton = io(getApiUrl(), {
      autoConnect: false,
      transports: ["websocket"],
    });

    singleton.on("connect", () => {
      if (activeUsername) {
        singleton?.emit("user:join", { username: activeUsername });
      }
    });
  }

  return singleton;
}

function makeSocket(): ChatSocket {
  return {
    get connected() {
      return singleton?.connected ?? false;
    },
    connect(username) {
      activeUsername = username;
      const client = ensureSocket();
      if (!client.connected) {
        client.connect();
      }
    },
    disconnect() {
      singleton?.removeAllListeners();
      singleton?.disconnect();
      singleton = null;
      activeUsername = null;
    },
    sendMessage({ content, clientId }) {
      ensureSocket().emit("message:send", { content, clientId });
    },
    startTyping() {
      ensureSocket().emit("typing:start");
    },
    stopTyping() {
      ensureSocket().emit("typing:stop");
    },
    on(event, cb) {
      const client = ensureSocket();
      client.on(event, cb as (...args: unknown[]) => void);
      return () => client.off(event, cb as (...args: unknown[]) => void);
    },
  };
}

let chatSocket: ChatSocket | null = null;

export function getChatSocket(): ChatSocket {
  if (!chatSocket) {
    chatSocket = makeSocket();
  }

  return chatSocket;
}

export function resetChatSocket() {
  chatSocket?.disconnect();
  chatSocket = null;
}
