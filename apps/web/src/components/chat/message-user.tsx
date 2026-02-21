"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useRef } from "react";
import {
  MessageAction,
  MessageActions,
  Message as MessageContainer,
  MessageContent,
} from "@/components/ui/message";
import { cn } from "@/lib/utils";

export interface MessageUserProps {
  children: string;
  className?: string;
  copied: boolean;
  copyToClipboard: () => void;
  hasScrollAnchor?: boolean;
}

export function MessageUser({
  hasScrollAnchor,
  children,
  copied,
  copyToClipboard,
  className,
}: MessageUserProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <MessageContainer
      className={cn(
        "group flex w-full max-w-3xl flex-col items-end gap-0.5 px-6 pb-2",
        hasScrollAnchor && "min-h-scroll-anchor",
        className
      )}
    >
      <MessageContent
        className="relative max-w-[70%] rounded-3xl bg-accent px-5 py-2.5"
        ref={contentRef}
      >
        {children}
      </MessageContent>
      <MessageActions className="flex gap-0 opacity-0 transition-opacity duration-0 group-hover:opacity-100">
        <MessageAction side="bottom" tooltip={copied ? "Copied!" : "Copy text"}>
          <button
            aria-label="Copy text"
            className="flex size-7.5 items-center justify-center rounded-full bg-transparent text-muted-foreground transition hover:bg-accent/60 hover:text-foreground"
            onClick={copyToClipboard}
            type="button"
          >
            {copied ? (
              <CheckIcon className="size-4" />
            ) : (
              <CopyIcon className="size-4" />
            )}
          </button>
        </MessageAction>
      </MessageActions>
    </MessageContainer>
  );
}
