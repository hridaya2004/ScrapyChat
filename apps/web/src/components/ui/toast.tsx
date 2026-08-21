"use client";

import {
  CheckCircle2Icon,
  InfoIcon,
  MessageCircleWarningIcon,
} from "lucide-react";
import { useCallback } from "react";
import { toast as sonnerToast } from "sonner";
import { WebHaptics } from "web-haptics";
import type { HapticType } from "@/providers/haptics-provider";
import { Button } from "./button";
import { Spinner } from "./spinner";

interface ToastProps {
  button?: {
    label: string;
    onClick: () => void;
  };
  description?: string;
  id: string | number;
  status?: "error" | "info" | "success" | "warning" | "loading";
  title: string;
}

let haptics: WebHaptics | null = null;

function getHaptics() {
  if (typeof window === "undefined") {
    return null;
  }
  if (!haptics) {
    haptics = new WebHaptics({
      debug: getSoundEnabled(),
    });
  }
  return haptics;
}

function getHapticsEnabled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    const stored = window.localStorage.getItem("haptics-enabled");
    return stored === null ? true : JSON.parse(stored);
  } catch {
    return true;
  }
}

function getSoundEnabled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    const stored = window.localStorage.getItem("sound-enabled");
    return stored === null ? true : JSON.parse(stored);
  } catch {
    return true;
  }
}

function triggerToastHaptic(status?: ToastProps["status"]) {
  const h = getHaptics();
  if (!h) {
    return;
  }

  let updatedStatus: HapticType | undefined;
  if ((getHapticsEnabled() && WebHaptics.isSupported) || getSoundEnabled()) {
    // default to medium for unavailable status
    if (status === "loading" || status === "info") {
      updatedStatus = "medium";
    }
    h.trigger(updatedStatus ?? status);
  }
}

function Toast({ title, description, button, id, status }: ToastProps) {
  const handleButtonClick = useCallback(() => {
    button?.onClick();
    sonnerToast.dismiss(id);
  }, [button, id]);

  return (
    <div className="flex items-center overflow-hidden rounded-xl border border-input bg-popover p-4 font-sans shadow-xs backdrop-blur-xl">
      <div className="flex flex-1 items-center">
        {status === "error" ? (
          <MessageCircleWarningIcon className="mr-3 size-4 text-primary" />
        ) : null}
        {status === "info" ? (
          <InfoIcon className="mr-3 size-4 text-primary" />
        ) : null}
        {status === "success" ? (
          <CheckCircle2Icon className="mr-3 size-4 text-primary" />
        ) : null}
        {status === "loading" ? (
          <div className="mr-3">
            <Spinner className="text-primary" size="size-4" />
          </div>
        ) : null}
        <div className="w-full">
          <p className="font-medium text-foreground text-sm">{title}</p>
          {description && (
            <p className="mt-1 text-muted-foreground text-sm">{description}</p>
          )}
        </div>
      </div>
      {button ? (
        <div className="shrink-0">
          <Button
            onClick={handleButtonClick}
            size="sm"
            type="button"
            variant="secondary"
          >
            {button?.label}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function toast(options: Omit<ToastProps, "id">) {
  triggerToastHaptic(options.status);

  return sonnerToast.custom(
    (id) => (
      <Toast
        button={options.button}
        description={options.description}
        id={id}
        status={options.status}
        title={options.title}
      />
    ),
    {
      position: "top-center",
    }
  );
}

export { toast };
