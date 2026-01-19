"use client"

import { toast as sonnerToast } from "sonner"
import { Button } from "./button"
import { CheckCircle2Icon, InfoIcon, MessageCircleWarningIcon } from "lucide-react"
import { Spinner } from "./spinner"

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
