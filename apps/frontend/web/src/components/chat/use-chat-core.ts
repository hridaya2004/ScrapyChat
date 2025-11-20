import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { useAuthJWTProvider } from "@/providers/auth-jwt-provider";

export const useChatCore = () => {
  const { token } = useAuthJWTProvider();

  const { sendMessage, setMessages, messages, status, regenerate, id, stop } =
    useChat({
      transport: new DefaultChatTransport({
        api: "http://localhost:8080/api/chat",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    });

  const [input, setInput] = useState("");

  return {
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
