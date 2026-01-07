import { ChatSessionProvider } from "@/providers/session-provider";
import { Chat } from ".";

export default function ChatContainer() {
  return (
    <ChatSessionProvider>
      <Chat />
    </ChatSessionProvider>
  );
}
