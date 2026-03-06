import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useAuthJWTProvider } from "@/providers/auth-jwt-provider";
import { useDialog } from "@/providers/dialog-context-provider";
import { useModel } from "@/providers/model-provider";
import { useQueryPromptUrlProvider } from "@/providers/query-prompt-url-provider";
import { useChatSession } from "@/providers/session-provider";
import { ChatInput } from "../chat-input";
import { getScrapeList } from "../scrape/scrape-core";
import { ScrapeProgress } from "../scrape/scrape-progress";
import { H2 } from "../typography";
import { toast } from "../ui/toast";
import { Conversation } from "./conversation";
import { useChatCore } from "./use-chat-core";

const WWW_PREFIX_REGEX = /^www\./;

export const Chat = () => {
  const { chatId } = useChatSession();
  const { url, superUrl } = useQueryPromptUrlProvider();
  const { token } = useAuthJWTProvider();
  const {
    input,
    messages,
    setInput,
    setMessages: _setMessages,
    status,
    sendMessage: send,
    stop,
  } = useChatCore();
  const { selectedModel, models } = useModel();

  const { data: scrapeData } = useQuery({
    queryKey: ["scrapeList"],
    queryFn: () => getScrapeList(token?.trim() ? token : ""),
    enabled: !!token?.trim(),
  });

  const headline = useMemo(() => {
    if (url) {
      try {
        const hostname = new URL(url).hostname.replace(WWW_PREFIX_REGEX, "");
        return `Ask anything about ${hostname}`;
      } catch {
        return "Ask anything about your data";
      }
    }

    if (scrapeData?.ingestedUrls && scrapeData.ingestedUrls.length > 0) {
      return "Pick a website to start querying";
    }

    return "Scrape a website to get started";
  }, [url, scrapeData?.ingestedUrls]);

  const showOnboarding = !chatId && messages.length === 0;

  // const onDelete = (messageId: string) => {
  //   setMessages((prev) => prev.filter((message) => message.id !== messageId));
  // };

  const { dialogState, setDialogState } = useDialog("scrape-list");

  // both user menu and settings have to be opened, as settings dialog
  // is nested within user menu
  const { setDialogState: setSettingsDialogState } =
    useDialog("settings-dialog");
  const { setDialogState: setUserMenuState } = useDialog("user-menu");

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

    if (
      !models?.[selectedModel]?.apiKey?.trim() &&
      selectedModel !== "google-selfhost"
    ) {
      toast({
        title: "Empty API key",
        description:
          "Please go to the API Keys section to add API key for the selected model.",
        status: "error",
      });
      setUserMenuState(true);
      setSettingsDialogState(true);

      return;
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
      superUrl,
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
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            className="absolute bottom-[60%] mx-auto max-w-200 md:relative md:bottom-auto"
            exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
            initial={{ opacity: 0 }}
            key="onboarding"
            layout="position"
            layoutId="onboarding"
            transition={{
              duration: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94],
              layout: { duration: 0 },
            }}
          >
            <H2 className="mb-6">{headline}</H2>
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
            duration: messages.length === 1 ? 0.25 : 0,
            ease: [0.23, 1, 0.32, 1],
          },
        }}
      >
        <ChatInput {...chatInputProps} />
      </motion.div>
    </div>
  );
};
