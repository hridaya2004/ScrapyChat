import { AnimatePresence, motion } from "motion/react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import { useDialog } from "@/providers/dialog-context-provider";
import { useModel } from "@/providers/model-provider";
import { useQueryPromptUrlProvider } from "@/providers/query-prompt-url-provider";
import { useChatSession } from "@/providers/session-provider";
import { ChatInput } from "../chat-input";
import { ScrapeProgress } from "../scrape/scrape-progress";
import { toast } from "../ui/toast";
import { Conversation } from "./conversation";
import { useChatCore } from "./use-chat-core";

export const Chat = () => {
  const { chatId } = useChatSession();
  const { url } = useQueryPromptUrlProvider();
  const {
    input,
    messages,
    setInput,
    setMessages: _setMessages,
    status,
    sendMessage: send,
  } = useChatCore();
  const { selectedModel, models } = useModel();

  const showOnboarding = !chatId && messages.length === 0;

  // const onDelete = (messageId: string) => {
  //   setMessages((prev) => prev.filter((message) => message.id !== messageId));
  // };

  const { dialogState, setDialogState } = useDialog("scrape-list");

  const { setItem } = useLocalStorage("selected-model");

  const sendMessage = () => {
    if (!input.trim()) {
      toast({
        title: "Invalid prompt",
        description: "Please provide a valid prompt.",
        status: "warning",
      });

      return;
    }

    if (!url.trim()) {
      if (!dialogState) {
        setDialogState(true);
      }

      return;
    }

    const model = models?.[selectedModel];

    // biome-ignore lint/complexity/useOptionalChain: Ignore
    if (!(model && model.apiKey?.trim())) {
      toast({
        title: "Empty API key",
        description:
          "The model that you selected have invalid API key. We have switched to free model for you.",
      });
      setItem("google-selfhost");
    }

    send({
      input,
      queryUrl: url,
      providerId:
        selectedModel === "google-selfhost" ? undefined : selectedModel,
      apiKey:
        selectedModel === "google-selfhost"
          ? undefined
          : models[selectedModel].apiKey,
      modelName:
        selectedModel === "google-selfhost"
          ? undefined
          : models[selectedModel].modelName,
    });

    setInput("");
  };

  const conversationProps = {
    messages,
    status,
    // onDelete,
  };

  const chatInputProps = {
    onSend: sendMessage,
    stop,
    status,
    hasMessages: messages.length > 0,
    value: input,
    isSubmitting: status === "submitted",
    onValueChange: setInput,
  };

  return (
    <div
      className={cn(
        "@container/main relative flex h-full max-h-[calc(100vh-(var(--spacing-app-header)))] flex-col items-center justify-end md:justify-center"
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
      <ScrapeProgress />
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
