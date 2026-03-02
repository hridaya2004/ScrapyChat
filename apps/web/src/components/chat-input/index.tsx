"use client";

import { ArrowUpIcon, SquareIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { useQueryPromptUrlProvider } from "@/providers/query-prompt-url-provider";
import { HorizontalFadeWrapper } from "../fade-wrapper";
import ScrapeList from "../scrape/scrape-list";

interface ChatInputProps {
  hasMessages?: boolean;
  isSubmitting?: boolean;
  onSend: () => void;
  onValueChange: (value: string) => void;
  status?: "submitted" | "ready";
  stop: () => void;
  value: string;
}

const WHITESPACE_REGEX = /[^\s]/;

export function ChatInput({
  value,
  onValueChange,
  onSend,
  isSubmitting,
  stop,
  status,
}: ChatInputProps) {
  const isOnlyWhitespace = (text: string) => !WHITESPACE_REGEX.test(text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { url, clearUrl } = useQueryPromptUrlProvider();

  const clearContextUrl = () => {
    clearUrl();
  };

  const handleSend = useCallback(() => {
    if (status === "submitted") {
      stop();
      return;
    }

    onSend();
  }, [onSend, status, stop]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: ignore
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && status === "submitted") {
        e.preventDefault();
        return;
      }

      if (e.key === "Enter" && !e.shiftKey) {
        if (isOnlyWhitespace(value)) {
          return;
        }

        e.preventDefault();
        onSend();
      }
    },
    [isSubmitting, onSend, status, value]
  );

  return (
    <div className="relative flex w-full flex-col gap-4">
      {/** biome-ignore lint/a11y: ignore */}
      <div
        className="relative order-2 px-2 pb-3 sm:pb-4 md:order-1"
        onClick={() => textareaRef.current?.focus()}
      >
        <PromptInput
          className="relative z-10 overflow-hidden bg-popover p-0 pt-1 shadow-xs backdrop-blur-xl"
          maxHeight={200}
          onValueChange={onValueChange}
          value={value}
        >
          <PromptInputTextarea
            className="min-h-11 pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base dark:bg-popover"
            onKeyDown={handleKeyDown}
            placeholder="Ask anything"
            ref={textareaRef}
          />
          <PromptInputActions className="mt-3 w-full justify-between p-2">
            <PromptInputAction
              tooltip={url.trim() ? "Clear context URL" : "Select context URL"}
            >
              <AnimatePresence mode="popLayout">
                <ScrapeList />
                {url && (
                  // maybe that much width is enough
                  <HorizontalFadeWrapper
                    className="scrollbar-width-0 max-w-40 rounded-full border bg-background px-2 py-1.5 lg:max-w-72 dark:bg-input/30"
                    key={"layout-context-container"}
                  >
                    <motion.div
                      animate={{ opacity: 1, scale: 1 }}
                      className="cursor-pointer font-medium text-sm"
                      exit={{ opacity: 0, scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.95 }}
                      layout
                      onClick={clearContextUrl}
                      style={{ transformOrigin: "left" }}
                      transition={{
                        duration: 0.15,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                    >
                      {url}
                    </motion.div>
                  </HorizontalFadeWrapper>
                )}
              </AnimatePresence>
            </PromptInputAction>
            <PromptInputAction
              tooltip={status === "submitted" ? "Stop" : "Send"}
            >
              <Button
                aria-label={status === "submitted" ? "Stop" : "Send message"}
                className="ms-auto size-9 rounded-full transition-all duration-300 ease-out"
                disabled={!(value || isOnlyWhitespace(value))}
                onClick={handleSend}
                size="sm"
                type="button"
              >
                {status === "submitted" ? (
                  <SquareIcon className="size-4" />
                ) : (
                  <ArrowUpIcon className="size-4" />
                )}
              </Button>
            </PromptInputAction>
          </PromptInputActions>
        </PromptInput>
      </div>
    </div>
  );
}
