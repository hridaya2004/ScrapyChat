"use client"

import { toast as sonnerToast } from "sonner"
import { Button } from "./button"
import { CheckCircle2Icon, InfoIcon, MessageCircleWarningIcon } from "lucide-react"
import { Spinner } from "./spinner"
import { WebHaptics } from "web-haptics"

type ToastProps = {
  id: string | number
  title: string
  description?: string
  button?: {
    label: string
    onClick: () => void
  }
  status?: "error" | "info" | "success" | "warning" | "loading"
}

let haptics: WebHaptics | null = null

function getHaptics() {
  if (typeof window === "undefined") return null
  if (!haptics) haptics = new WebHaptics({
    debug: getSoundEnabled()
  })
  return haptics
}

function getHapticsEnabled(): boolean {
  if (typeof window === "undefined") return false
  try {
    const stored = window.localStorage.getItem("haptics-enabled")
    return stored === null ? true : JSON.parse(stored)
  } catch {
    return true
  }
}

function getSoundEnabled(): boolean {
  if (typeof window === "undefined") return false
  try {
    const stored = window.localStorage.getItem("sound-enabled")
    return stored === null ? true : JSON.parse(stored)
  } catch {
    return true
  }
}

function triggerToastHaptic(status?: ToastProps["status"]) {
  const h = getHaptics()
  if (!h) return

  let updatedStatus
  if (getHapticsEnabled() && WebHaptics.isSupported || getSoundEnabled()) {
    // default to medium for unavailable status
    if (status === "loading" || status === "info") {
      updatedStatus = "medium"
    }
    h.trigger(updatedStatus ?? status)
  }
}

function Toast({ title, description, button, id, status }: ToastProps) {
  return (
    <div className="border-input bg-popover font-sans flex items-center overflow-hidden rounded-xl border p-4 shadow-xs backdrop-blur-xl">
      <div className="flex flex-1 items-center">
        {status === "error" ? (
          <MessageCircleWarningIcon className="text-primary mr-3 size-4" />
        ) : null}
        {status === "info" ? (
          <InfoIcon className="text-primary mr-3 size-4" />
        ) : null}
        {status === "success" ? (
          <CheckCircle2Icon className="text-primary mr-3 size-4" />
        ) : null}
        {
          status === "loading" ? (
            <div className="mr-3">
              <Spinner className="text-primary" size="size-4" />
            </div>
          ) : null
        }
        <div className="w-full">
          <p className="text-foreground text-sm font-medium">{title}</p>
          {description && (
            <p className="text-muted-foreground mt-1 text-sm">{description}</p>
          )}
        </div>
      </div>
      {button ? (
        <div className="shrink-0">
          <Button
            size="sm"
            onClick={() => {
              button?.onClick()
              sonnerToast.dismiss(id)
            }}
            type="button"
            variant="secondary"
          >
            {button?.label}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

function toast(toast: Omit<ToastProps, "id">) {
  triggerToastHaptic(toast.status)

  return sonnerToast.custom(
    (id) => (
      <Toast
        id={id}
        title={toast.title}
        description={toast?.description}
        button={toast?.button}
        status={toast?.status}
      />
    ),
    {
      position: "top-center",
    }
  )
}

export { toast }
