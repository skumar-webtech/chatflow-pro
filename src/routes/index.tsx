import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { ChatApp } from "@/components/chat/ChatApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pulse Chat — Real-time conversations" },
      {
        name: "description",
        content:
          "A polished real-time chat experience with live typing indicators, online presence, and instant messaging.",
      },
      { property: "og:title", content: "Pulse Chat — Real-time conversations" },
      {
        property: "og:description",
        content: "Instant messaging with live typing indicators and online presence.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ClientOnly fallback={<div className="min-h-dvh bg-background" />}>
      <ChatApp />
    </ClientOnly>
  );
}
