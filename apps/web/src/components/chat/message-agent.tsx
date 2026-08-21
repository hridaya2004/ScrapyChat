import { CheckIcon, CopyIcon } from "lucide-react";
import { useRef } from "react";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
} from "@/components/ui/message";
import { cn } from "@/lib/utils";

interface MessageAgentProps {
  children: string;
  className?: string;
  copied?: boolean;
  copyToClipboard?: () => void;
  hasScrollAnchor?: boolean;
  isLast?: boolean;
  status?: "ready" | "submitted";
}

export function MessageAgent({
  children,
  isLast,
  hasScrollAnchor,
  copied,
  copyToClipboard,
  status,
  className,
}: MessageAgentProps) {
  // const reasoningParts = parts?.find((part) => part.type === "reasoning");
  const contentNullOrEmpty = children === "";
  const isLastStreaming = status !== "ready" && isLast;

  const messageRef = useRef<HTMLDivElement>(null);

  return (
    <Message
      className={cn(
        "group flex w-full max-w-3xl flex-1 items-start gap-4 px-6 pb-2",
        hasScrollAnchor && "min-h-scroll-anchor",
        className
      )}
    >
      <div
        className={cn(
          "relative flex min-w-full flex-col gap-2",
          isLast && "pb-8"
        )}
        ref={messageRef}
      >
        {/*{!!reasoningParts?.text && (
          <Reasoning isStreaming={status === "streaming"}>
            {reasoningParts.text}
          </Reasoning>
        )}*/}

        {contentNullOrEmpty ? null : (
          <MessageContent
            className={cn(
              "prose dark:prose-invert relative min-w-full bg-transparent p-0",
              "prose-h2:mt-8 prose-h2:mb-3 prose-table:block prose-h1:scroll-m-20 prose-h2:scroll-m-20 prose-h3:scroll-m-20 prose-h4:scroll-m-20 prose-h5:scroll-m-20 prose-h6:scroll-m-20 prose-table:overflow-y-auto prose-h1:font-semibold prose-h2:font-semibold prose-h3:font-semibold prose-strong:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg"
            )}
          >
            {children}
          </MessageContent>
        )}

        {isLastStreaming || contentNullOrEmpty ? null : (
          <MessageActions
            className={cn(
              "-ml-2 flex gap-0 opacity-0 transition-opacity group-hover:opacity-100"
            )}
          >
            <MessageAction
              side="bottom"
              tooltip={copied ? "Copied!" : "Copy text"}
            >
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
        )}
      </div>
    </Message>
  );
}
