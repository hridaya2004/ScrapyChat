import { useRef, useState } from "react";
import { apiConfig } from "@/config/global";
import type { Message } from "@/lib/types";
import { rawResponseMessageSchema } from "@/model/chat/new";
import { useAuthContext } from "@/providers/auth-context-provider";
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
  const { token } = useAuthContext();
  const abortControllerRef = useRef<AbortController | null>(null);

  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"submitted" | "ready">("ready");
  const [messages, setMessages] = useState<Message[]>([]);

  const { trigger } = useHaptics();

  const sendMessage = async ({
    input: userInput,
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
          role: "user",
          text: userInput,
        },
      ]);
      setStatus("submitted");

      abortControllerRef.current = new AbortController();

      const response = await fetch(`${apiConfig.baseUrl}/chat/new`, {
        body: JSON.stringify({
          llm: {
            api_key: apiKey,
            model: modelName,
            provider: providerId,
          },
          match_subpaths: superUrl,
          query: input,
          url: queryUrl,
        }),
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        signal: abortControllerRef.current.signal,
      });

      if (response.ok) {
        const parsed = rawResponseMessageSchema.safeParse(
          await response.json()
        );

        if (parsed.error) {
          toast({
            status: "error",
            title: "Failed to parse response message.",
          });
        }

        if (parsed.data) {
          trigger("success");
          setMessages((prev) => [
            ...prev,
            {
              references: parsed.data.references,
              role: "assistant",
              text: parsed.data.response,
            },
          ]);
          setStatus("ready");
        }
      } else {
        toast({
          description: "Unable to process your request. Please try again.",
          status: "error",
          title: "Failed to send message",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        description: "An error occurred while sending your message.",
        status: "error",
        title: "Error",
      });
    } finally {
      setStatus("ready");
      abortControllerRef.current = null;
    }
  };

  const stop = () => {
    const controller = abortControllerRef.current;
    if (controller !== null) {
      controller.abort();
      abortControllerRef.current = null;
      setStatus("ready");
    }
  };

  return {
    input,
    messages,
    sendMessage,
    setInput,
    setMessages,
    setStatus,
    status,
    stop,
  };
};
