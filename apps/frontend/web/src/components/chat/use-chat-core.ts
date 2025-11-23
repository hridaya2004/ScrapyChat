import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { apiConfig } from "@/config/global";
import { useAuthJWTProvider } from "@/providers/auth-jwt-provider";

export const useChatCore = () => {
  const { token } = useAuthJWTProvider();
  const [input, setInput] = useState("");

  const {
    sendMessage,
    setMessages,
    error,
    resumeStream,
    messages,
    status,
    regenerate,
    id,
    stop,
  } = useChat({
    transport: new DefaultChatTransport({
      api: `${apiConfig.baseUrl}/chat/new`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  });

  return {
    error,
    resumeStream,
    sendMessage,
    setMessages,
    messages,
    status,
    regenerate,
    stop,
    id,
    input,
    setInput,
  };
};
