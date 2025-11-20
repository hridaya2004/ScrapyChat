import type { UIMessage as MessageType } from "@ai-sdk/react";
import { useState } from "react";
import { MessageAgent } from "./message-agent";
import { MessageUser } from "./message-user";

type MessageProps = {
  variant: MessageType["role"];
  children: string;
  isLast?: boolean;
  onDelete: (id: string) => void;
  hasScrollAnchor?: boolean;
  parts?: MessageType["parts"];
  status?: "streaming" | "ready" | "submitted" | "error";
  className?: string;
};

export function Message({
  variant,
  children,
  isLast,
  hasScrollAnchor,
  parts,
  status,
  className,
}: MessageProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 500);
  };

  if (variant === "user") {
    return (
      <MessageUser
        className={className}
        copied={copied}
        copyToClipboard={copyToClipboard}
        hasScrollAnchor={hasScrollAnchor}
      >
        {children}
      </MessageUser>
    );
  }

  if (variant === "assistant") {
    return (
      <MessageAgent
        className={className}
        copied={copied}
        copyToClipboard={copyToClipboard}
        hasScrollAnchor={hasScrollAnchor}
        isLast={isLast}
        parts={parts}
        status={status}
      >
        {children}
      </MessageAgent>
    );
  }

  return null;
}
