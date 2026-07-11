const API_URL = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env
  .VITE_API_URL;

export type BackendMessage = {
  _id: string;
  sender: string;
  content: string;
  timestamp: string | number;
  clientId?: string;
};

export type ChatMessage = {
  id: string;
  username: string;
  text: string;
  createdAt: number;
  clientId?: string;
  pending?: boolean;
  editedAt?: number;
  deleted?: boolean;
};

export type ChatUser = {
  username: string;
  online: boolean;
};

export type SendMessageInput = {
  sender: string;
  content: string;
  clientId?: string;
};

type MessageEnvelope = {
  success: boolean;
  data: BackendMessage[] | BackendMessage;
};

function requireApiUrl() {
  if (!API_URL) {
    throw new Error("VITE_API_URL is not configured");
  }

  return API_URL.replace(/\/$/, "");
}

export function getApiUrl() {
  return requireApiUrl();
}

export function toChatMessage(message: BackendMessage): ChatMessage {
  const createdAt = new Date(message.timestamp).getTime();
  return {
    id: message._id,
    username: message.sender,
    text: message.content,
    createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
    ...(message.clientId ? { clientId: message.clientId } : {}),
  };
}

export function toChatUsers(usernames: string[]): ChatUser[] {
  return usernames.map((username) => ({ username, online: true }));
}

export async function fetchMessages(limit = 50): Promise<ChatMessage[]> {
  const baseUrl = requireApiUrl();
  const url = new URL(`${baseUrl}/api/messages`);
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url.toString(), {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }

  const payload = (await response.json()) as MessageEnvelope;
  const messages = Array.isArray(payload.data) ? payload.data : [payload.data];

  return messages.map(toChatMessage);
}

export async function sendMessage(input: SendMessageInput): Promise<ChatMessage> {
  const response = await fetch(`${requireApiUrl()}/api/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  const payload = (await response.json()) as { success: boolean; data: BackendMessage };
  return toChatMessage(payload.data);
}
