import { useState } from "react";
import type { Message as MessageType } from "@/lib/types";
import { MessageAgent } from "./message-agent";
import { MessageUser } from "./message-user";

interface MessageProps {
  variant: MessageType["role"];
  children: string;
  isLast?: boolean;
  // onDelete: (id: string) => void;
  hasScrollAnchor?: boolean;
  status?: "ready" | "submitted";
  className?: string;
}

export function Message({
  variant,
  children,
  isLast,
  hasScrollAnchor,
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
        status={status}
      >
        {children}
      </MessageAgent>
    );
  }

  return null;
}
