"use client";

import {
  ArrowUpIcon,
  MessageCircleIcon,
  SquareIcon,
  XIcon,
} from "lucide-react";
import { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { useQueryPromptUrlProvider } from "@/providers/query-prompt-url-provider";
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
          className="relative z-10 overflow-hidden bg-popover p-0 shadow-xs backdrop-blur-xl"
          maxHeight={200}
          onValueChange={onValueChange}
          value={value}
        >
          {url && (
            <div className="flex w-full items-center justify-between rounded-t-3xl bg-secondary p-2 text-foreground/50">
              <div className="flex min-w-0 flex-1 items-center gap-1">
                <div className="inline-flex size-8 shrink-0 items-center justify-center">
                  <MessageCircleIcon className="size-5" />
                </div>
                <span className="scrollbar-none overflow-x-auto truncate whitespace-nowrap">
                  {url}
                </span>
              </div>
              <Button
                className="shrink-0 text-foreground"
                onClick={clearContextUrl}
                size="icon-sm"
                variant="ghost"
              >
                <XIcon />
              </Button>
            </div>
          )}
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
              <ScrapeList />
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
