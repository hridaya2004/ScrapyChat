import { useRef, useState } from "react";
import { apiConfig } from "@/config/global";
import type { Message } from "@/lib/types";
import { rawResponseMessageSchema } from "@/model/chat/new";
import { useAuthJWTProvider } from "@/providers/auth-jwt-provider";
import { useHaptics } from "@/providers/haptics-provider";
import { toast } from "../ui/toast";

interface SendMessageParams {
  apiKey: string;
  input: string;
  modelName: string;
  providerId: string;
  queryUrl: string;
  superUrl: boolean;
}

export const useChatCore = () => {
  const { token } = useAuthJWTProvider();
  const abortControllerRef = useRef<AbortController | null>(null);

  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"submitted" | "ready">("ready");
  const [messages, setMessages] = useState<Message[]>([]);

  const { trigger } = useHaptics();

  const sendMessage = async ({
    input,
    queryUrl,
    providerId,
    modelName,
    apiKey,
    superUrl,
  }: SendMessageParams) => {
    try {
      setMessages([
        ...messages,
        {
          text: input,
          role: "user",
        },
      ]);
      setStatus("submitted");

      abortControllerRef.current = new AbortController();

      const response = await fetch(`${apiConfig.baseUrl}/chat/new`, {
        credentials: "include",
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: queryUrl,
          query: input,
          llm: {
            provider: providerId,
            model: modelName,
            api_key: apiKey,
          },
          match_subpaths: superUrl,
        }),
        signal: abortControllerRef.current.signal,
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
          trigger("success");
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
      } else {
        toast({
          title: "Failed to send message",
          description: "Unable to process your request. Please try again.",
          status: "error",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "An error occurred while sending your message.",
        status: "error",
      });
    } finally {
      setStatus("ready");
      abortControllerRef.current = null;
    }
  };

  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
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
    stop,
  };
};
