import { useState } from "react";
import { LoginScreen } from "./LoginScreen";
import { Sidebar } from "./Sidebar";
import { ChatWindow } from "./ChatWindow";
import { useChat } from "@/hooks/useChat";
import { NotificationBanner } from "./NotificationBanner.tsx";
import { useBackendWarmup } from "@/hooks/useBackendWarmup";
import { BackendWarmupBanner } from "./BackendWarmupBanner";
import { VideoBackground } from "./VideoBackground";
import { CreatorInfoDialog } from "./CreatorInfoDialog";
import { useTheme } from "@/lib/theme";

export function ChatApp() {
  const chat = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const warmup = useBackendWarmup();
  const { theme, toggle } = useTheme();

  if (!chat.username) {
    return (
      <LoginScreen
        showWarmupMessage={warmup.showWarmupMessage}
        warmupFailed={warmup.warmupFailed}
      />
    );
  }

  return (
    <div className="relative flex h-dvh w-full overflow-hidden text-foreground transition-colors duration-500">
      <VideoBackground theme={theme} />
      <div className="relative z-10 flex h-dvh w-full">
        <Sidebar
          me={chat.username}
          users={chat.users}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <ChatWindow
          me={chat.username}
          messages={chat.messages}
          loading={chat.loadingHistory}
          connected={chat.connected}
          theme={theme}
          onToggleTheme={toggle}
          onOpenInfo={() => setInfoOpen(true)}
          notificationBanner={
            <>
              {warmup.showWarmupMessage && <BackendWarmupBanner warmupFailed={warmup.warmupFailed} />}
              <NotificationBanner
                supported={chat.notificationSupported}
                permission={chat.notificationPermission}
              />
            </>
          }
          typingUser={chat.typingUser}
          onSend={chat.send}
          onTyping={chat.notifyTyping}
          onTypingStop={chat.stopTyping}
          onEdit={chat.editMessage}
          onDelete={chat.deleteMessage}
          onOpenSidebar={() => setSidebarOpen(true)}
          onlineCount={chat.users.filter((u) => u.online).length}
        />
      </div>
      <CreatorInfoDialog open={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  );
}
