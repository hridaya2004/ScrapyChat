import { Loader } from "lucide-react";
import { useRef } from "react";
import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/components/ui/chat-container";
import { ScrollButton } from "@/components/ui/scroll-button";
import type { Message as MessageType } from "@/lib/types";
import { Message } from "./message";

interface ConversationProps {
  messages: MessageType[];
  status?: "ready" | "submitted";
  // onDelete: (id: string) => void;
}

export function Conversation({
  messages,
  status = "ready",
  // onDelete,
}: ConversationProps) {
  const initialMessageCount = useRef(messages.length);

  if (!messages || messages.length === 0) {
    return <div className="h-full w-full" />;
  }

  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-y-auto overflow-x-hidden">
      <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 mx-auto flex w-full flex-col justify-center">
        <div className="flex h-app-header w-full bg-background lg:hidden lg:h-0" />
        <div className="mask-b-from-4% mask-b-to-100% flex h-app-header w-full bg-background lg:hidden" />
      </div>
      <ChatContainerRoot className="relative w-full">
        <ChatContainerContent
          className="flex w-full flex-col items-center pt-20 pb-4"
          style={{
            scrollbarGutter: "stable both-edges",
            scrollbarWidth: "none",
          }}
        >
          {messages?.map((message, index) => {
            const isLast =
              index === messages.length - 1 && status !== "submitted";
            const hasScrollAnchor =
              isLast && messages.length > initialMessageCount.current;

            return (
              <Message
                hasScrollAnchor={hasScrollAnchor}
                isLast={isLast}
                key={message.text}
                // onDelete={onDelete}
                status={status}
                variant={message.role}
              >
                {message.text}
              </Message>
            );
          })}
          {status === "submitted" &&
            messages.length > 0 &&
            // biome-ignore lint/style/useAtIndex: ignore
            messages[messages.length - 1].role === "user" && (
              <div className="group flex min-h-scroll-anchor w-full max-w-3xl flex-col items-start gap-2 px-6 pb-2">
                <Loader />
              </div>
            )}
          <div className="absolute bottom-0 flex w-full max-w-3xl flex-1 items-end justify-end gap-4 px-6 pb-2">
            <ScrollButton className="absolute -top-12.5 right-7.5" />
          </div>
        </ChatContainerContent>
      </ChatContainerRoot>
    </div>
  );
}
