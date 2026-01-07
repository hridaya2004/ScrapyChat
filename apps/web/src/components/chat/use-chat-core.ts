import { useState } from "react";
import { apiConfig } from "@/config/global";
import type { Message } from "@/lib/types";
import { rawResponseMessageSchema } from "@/model/chat/new";
import { useAuthJWTProvider } from "@/providers/auth-jwt-provider";
import { toast } from "../ui/toast";

export const useChatCore = () => {
  const { token } = useAuthJWTProvider();

  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"submitted" | "ready">("ready");
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = async ({
    input,
    queryUrl,
  }: {
    input: string;
    queryUrl: string;
  }) => {
    try {
      setMessages([
        ...messages,
        {
          text: input,
          role: "user",
        },
      ]);
      setStatus("submitted");

      const response = await fetch(`${apiConfig.baseUrl}/chat/new`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: queryUrl,
          query: input,
        }),
      });

      if (response.ok) {
        const parsed = rawResponseMessageSchema.safeParse(
          await response.json()
        );

        if (parsed.error) {
          toast({
            title: "Failed to parse response message.",
            status: "error",
          });
        }

        if (parsed.data) {
          setMessages((prev) => [
            ...prev,
            {
              text: parsed.data.response,
              role: "assistant",
              references: parsed.data.references,
            },
          ]);
          setStatus("ready");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStatus("ready");
    }
  };

  return {
    input,
    setInput,
    messages,
    setMessages,
    status,
    setStatus,
    sendMessage,
  };
};
