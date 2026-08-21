"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const systemMessageVariants = cva(
  "flex flex-row items-center gap-3 rounded-[12px] border py-2 pr-2 pl-3",
  {
    compoundVariants: [
      {
        class: "border-transparent bg-zinc-100 dark:bg-zinc-900",
        fill: true,
        variant: "action",
      },
      {
        class: "border-transparent bg-red-100 dark:bg-red-900/20",
        fill: true,
        variant: "error",
      },
      {
        class: "border-transparent bg-amber-100 dark:bg-amber-900/20",
        fill: true,
        variant: "warning",
      },
      {
        class: "border-zinc-200 dark:border-zinc-800",
        fill: false,
        variant: "action",
      },
      {
        class: "border-red-600 dark:border-red-900",
        fill: false,
        variant: "error",
      },
      {
        class: "border-amber-600 dark:border-amber-900",
        fill: false,
        variant: "warning",
      },
    ],
    defaultVariants: {
      fill: false,
      variant: "action",
    },
    variants: {
      fill: {
        false: "",
        true: "bg-background",
      },
      variant: {
        action: "text-zinc-700 dark:text-zinc-300",
        error: "text-red-700 dark:text-red-800",
        warning: "text-amber-700 dark:text-amber-700",
      },
    },
  }
);

export type SystemMessageProps = React.ComponentProps<"div"> &
  VariantProps<typeof systemMessageVariants> & {
    icon?: React.ReactNode;
    isIconHidden?: boolean;
    cta?: {
      label: string;
      onClick?: () => void;
      variant?: "solid" | "outline" | "ghost";
    };
  };

export function SystemMessage({
  children,
  variant = "action",
  fill = false,
  icon,
  isIconHidden = false,
  cta,
  className,
  ...props
}: SystemMessageProps) {
  const getDefaultIcon = () => {
    if (isIconHidden) {
      return null;
    }

    switch (variant) {
      case "error":
        return <AlertCircle className="size-4" />;
      case "warning":
        return <AlertTriangle className="size-4" />;
      default:
        return <Info className="size-4" />;
    }
  };

  const getIconToShow = () => {
    if (isIconHidden) {
      return null;
    }
    if (icon) {
      return icon;
    }
    return getDefaultIcon();
  };

  const shouldShowIcon = getIconToShow() !== null;

  return (
    <div
      className={cn(systemMessageVariants({ fill, variant }), className)}
      {...props}
    >
      <div className="flex flex-1 flex-row items-center gap-3 leading-normal">
        {shouldShowIcon && (
          <div className="flex h-lh shrink-0 items-center justify-center self-start">
            {getIconToShow()}
          </div>
        )}

        <div
          className={cn(
            "flex min-w-0 flex-1 items-center",
            shouldShowIcon ? "gap-3" : "gap-0"
          )}
        >
          <div className="text-sm">{children}</div>
        </div>
      </div>

      {cta && (
        <Button onClick={cta.onClick} size="sm" variant="default">
          {cta.label}
        </Button>
      )}
    </div>
  );
}
