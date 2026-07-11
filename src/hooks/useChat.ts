import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ChatMessage,
  type ChatUser,
  fetchMessageHistory,
  getChatSocket,
} from "@/lib/chat-socket";
import { getUsername, subscribeUsername } from "@/lib/session";

const MESSAGES_KEY = ["messages"] as const;

export function useSession() {
  return useSyncExternalStore(
    subscribeUsername,
    () => getUsername(),
    () => null,
  );
}

export function useChat() {
  const username = useSession();
  const queryClient = useQueryClient();

  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typingClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const history = useQuery({
    queryKey: MESSAGES_KEY,
    queryFn: fetchMessageHistory,
    enabled: !!username,
    staleTime: Infinity,
  });

  // Wire socket lifecycle to the active username.
  useEffect(() => {
    if (!username) return;
    const socket = getChatSocket();

    const offConnect = socket.on("connect", () => setConnected(true));
    const offDisconnect = socket.on("disconnect", () => setConnected(false));
    const offUsers = socket.on<ChatUser[]>("users", (list) => setUsers(list));
    const offMessage = socket.on<ChatMessage>("message", (msg) => {
      queryClient.setQueryData<ChatMessage[]>(MESSAGES_KEY, (prev = []) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });
    const offTyping = socket.on<{ username: string }>("typing", ({ username: who }) => {
      if (who === username) return;
      setTypingUser(who);
      if (typingClearRef.current) clearTimeout(typingClearRef.current);
      typingClearRef.current = setTimeout(() => setTypingUser(null), 2500);
    });

    socket.connect(username);

    return () => {
      offConnect();
      offDisconnect();
      offUsers();
      offMessage();
      offTyping();
      socket.disconnect();
      if (typingClearRef.current) clearTimeout(typingClearRef.current);
    };
  }, [username, queryClient]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !username) return;
    // Optimistic append
    const optimistic: ChatMessage = {
      id: crypto.randomUUID(),
      username,
      text: trimmed,
      createdAt: Date.now(),
    };
    queryClient.setQueryData<ChatMessage[]>(MESSAGES_KEY, (prev = []) => [...prev, optimistic]);
    getChatSocket().send(trimmed);
  };

  const notifyTyping = () => getChatSocket().typing();

  return {
    username,
    messages: history.data ?? [],
    loadingHistory: history.isLoading,
    connected,
    users,
    typingUser,
    send,
    notifyTyping,
  };
}
