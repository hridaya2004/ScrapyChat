"use client";

import { ArrowUpIcon, SquareIcon } from "lucide-react";
import { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";

type ChatInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  onSend: () => void;
  isSubmitting?: boolean;
  hasMessages?: boolean;
  stop: () => void;
  status?: "submitted" | "streaming" | "ready" | "error";
};

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

  const handleSend = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    if (status === "streaming") {
      stop();
      return;
    }

    onSend();
  }, [isSubmitting, onSend, status, stop]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: ignore
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isSubmitting) {
        e.preventDefault();
        return;
      }

      if (e.key === "Enter" && status === "streaming") {
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
          className="relative z-10 bg-popover p-0 pt-1 shadow-xs backdrop-blur-xl"
          maxHeight={200}
          onValueChange={onValueChange}
          value={value}
        >
          <PromptInputTextarea
            className="min-h-11 pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
            onKeyDown={handleKeyDown}
            placeholder="Ask anything"
            ref={textareaRef}
          />
          <PromptInputActions className="mt-3 w-full justify-between p-2">
            <PromptInputAction
              tooltip={status === "streaming" ? "Stop" : "Send"}
            >
              <Button
                aria-label={status === "streaming" ? "Stop" : "Send message"}
                className="ms-auto size-9 rounded-full transition-all duration-300 ease-out"
                disabled={!value || isSubmitting || isOnlyWhitespace(value)}
                onClick={handleSend}
                size="sm"
                type="button"
              >
                {status === "streaming" ? (
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
