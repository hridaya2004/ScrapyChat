import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { apiConfig } from "@/config/global";
import { useAuthJWTProvider } from "@/providers/auth-jwt-provider";

export const useChatCore = () => {
  const { token } = useAuthJWTProvider();
  const [queryUrl, setQueryUrl] = useState("");
  const [input, setInput] = useState("");

  const { sendMessage, setMessages, messages, status, id, stop } = useChat({
    transport: new DefaultChatTransport({
      api: `${apiConfig.baseUrl}/chat/new`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  });

  const send = () => {
    sendMessage(
      {
        text: input,
      },
      {
        body: {
          query: queryUrl,
        },
      }
    );
  };

  return {
    sendMessage: send,
    setMessages,
    messages,
    status,
    stop,
    id,
    input,
    setInput,
    queryUrl,
    setQueryUrl,
  };
};
