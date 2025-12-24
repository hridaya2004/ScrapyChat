"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useChatSession } from "@/providers/session-provider";
import { ChatInput } from "../chat-input";
import { Conversation } from "./conversation";
import { useChatCore } from "./use-chat-core";

export const Chat = () => {
  const {
    id,
    input,
    messages,
    sendMessage,
    setInput,
    setMessages,
    status,
    stop,
  } = useChatCore();

  const { chatId } = useChatSession();

  const showOnboarding = !chatId && messages.length === 0;

  const onDelete = (messageId: string) => {
    setMessages((prev) => prev.filter((message) => message.id !== messageId));
  };

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  const conversationProps = {
    messages,
    status,
    onDelete,
  };

  const chatInputProps = {
    onSend: sendMessage,
    stop,
    status,
    hasMessages: messages.length > 0,
    value: input,
    isSubmitting: status === "submitted" || status === "streaming",
    onValueChange: setInput,
  };

  return (
    <div
      className={cn(
        "@container/main relative flex h-full flex-col items-center justify-end md:justify-center"
      )}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {showOnboarding ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="absolute bottom-[60%] mx-auto max-w-200 md:relative md:bottom-auto"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            key="onboarding"
            layout="position"
            layoutId="onboarding"
            transition={{
              layout: {
                duration: 0,
              },
            }}
          >
            <h1 className="mb-6 font-medium text-3xl tracking-tight">
              What&apos;s on your mind?
            </h1>
          </motion.div>
        ) : (
          <Conversation key="conversation" {...conversationProps} />
        )}
      </AnimatePresence>
      <motion.div
        className={cn(
          "relative inset-x-0 bottom-0 z-50 mx-auto w-full max-w-3xl"
        )}
        layout="position"
        layoutId="chat-input-container"
        transition={{
          layout: {
            duration: messages.length === 1 ? 0.3 : 0,
          },
        }}
      >
        <ChatInput {...chatInputProps} />
      </motion.div>
    </div>
  );
};
