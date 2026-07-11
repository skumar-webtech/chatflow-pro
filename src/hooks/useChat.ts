import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ChatMessage,
  type ChatUser,
  getChatSocket,
} from "@/lib/chat-socket";
import { fetchMessages, toChatMessage, toChatUsers, type BackendMessage } from "@/services/api";
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
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingUsersRef = useRef<Set<string>>(new Set());

  const history = useQuery({
    queryKey: MESSAGES_KEY,
    queryFn: () => fetchMessages(50),
    enabled: !!username,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const mergeMessage = (message: ChatMessage) => {
    queryClient.setQueryData<ChatMessage[]>(MESSAGES_KEY, (prev = []) => {
      const index = prev.findIndex(
        (item) => item.id === message.id || (message.clientId && item.clientId === message.clientId),
      );

      if (index === -1) {
        return [...prev, message];
      }

      const next = [...prev];
      next[index] = { ...next[index], ...message, pending: false };
      return next;
    });
  };

  const updateTypingUser = () => {
    const next = Array.from(typingUsersRef.current)[0] ?? null;
    setTypingUser(next);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      typingUsersRef.current.clear();
      setTypingUser(null);
    }, 2500);
  };

  const sendMutation = useMutation({
    mutationFn: async ({ content, clientId }: { content: string; clientId: string }) => {
      const socket = getChatSocket();
      socket.sendMessage({ content, clientId });
      return { content, clientId };
    },
    onMutate: async ({ content, clientId }) => {
      await queryClient.cancelQueries({ queryKey: MESSAGES_KEY });
      const previous = queryClient.getQueryData<ChatMessage[]>(MESSAGES_KEY) ?? [];
      const optimistic: ChatMessage = {
        id: clientId,
        clientId,
        username: username ?? "",
        text: content,
        createdAt: Date.now(),
        pending: true,
      };

      queryClient.setQueryData<ChatMessage[]>(MESSAGES_KEY, [...previous, optimistic]);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(MESSAGES_KEY, context.previous);
      }
    },
  });

  // Wire socket lifecycle to the active username.
  useEffect(() => {
    if (!username) return;
    const socket = getChatSocket();

    const offConnect = socket.on("connect", () => setConnected(true));
    const offDisconnect = socket.on("disconnect", () => setConnected(false));
    const offUsers = socket.on<string[]>("users:online", (list) => setUsers(toChatUsers(list)));
    const offMessageReceived = socket.on<BackendMessage>("message:received", (msg) => {
      mergeMessage(toChatMessage(msg));
    });
    const offMessageSent = socket.on<BackendMessage>("message:sent", (msg) => {
      mergeMessage(toChatMessage(msg));
    });
    const offTypingStart = socket.on<{ username: string }>("typing:start", ({ username: who }) => {
      if (who === username) return;
      typingUsersRef.current.add(who);
      updateTypingUser();
    });
    const offTypingStop = socket.on<{ username: string }>("typing:stop", ({ username: who }) => {
      if (who === username) return;
      typingUsersRef.current.delete(who);
      if (typingUsersRef.current.size === 0) {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        setTypingUser(null);
        return;
      }
      updateTypingUser();
    });

    socket.connect(username);
    setConnected(socket.connected);

    return () => {
      offConnect();
      offDisconnect();
      offUsers();
      offMessageReceived();
      offMessageSent();
      offTypingStart();
      offTypingStop();
      socket.disconnect();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingUsersRef.current.clear();
    };
  }, [username, queryClient]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !username) return;
    const clientId = crypto.randomUUID();
    sendMutation.mutate({ content: trimmed, clientId });
  };

  const editMessage = (id: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    queryClient.setQueryData<ChatMessage[]>(MESSAGES_KEY, (prev = []) =>
      prev.map((message) =>
        message.id === id ? { ...message, text: trimmed, editedAt: Date.now() } : message,
      ),
    );
  };

  const deleteMessage = (id: string) => {
    queryClient.setQueryData<ChatMessage[]>(MESSAGES_KEY, (prev = []) =>
      prev.map((message) => (message.id === id ? { ...message, deleted: true, text: "" } : message)),
    );
  };

  const notifyTyping = () => getChatSocket().startTyping();
  const stopTyping = () => getChatSocket().stopTyping();

  return {
    username,
    messages: history.data ?? [],
    loadingHistory: history.isLoading,
    connected,
    users,
    typingUser,
    send,
    editMessage,
    deleteMessage,
    notifyTyping,
    stopTyping,
  };
}
