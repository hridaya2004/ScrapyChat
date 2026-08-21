"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface PromptInputContextType {
  disabled?: boolean;
  isLoading: boolean;
  maxHeight: number | string;
  onSubmit?: () => void;
  setValue: (value: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
}

const PromptInputContext = createContext<PromptInputContextType>({
  disabled: false,
  isLoading: false,
  maxHeight: 240,
  onSubmit: undefined,
  setValue: () => {
    // noop
  },
  textareaRef: React.createRef<HTMLTextAreaElement>(),
  value: "",
});

function usePromptInput() {
  const context = useContext(PromptInputContext);
  if (!context) {
    throw new Error("usePromptInput must be used within a PromptInput");
  }
  return context;
}

interface PromptInputProps {
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  maxHeight?: number | string;
  onSubmit?: () => void;
  onValueChange?: (value: string) => void;
  value?: string;
}

function PromptInput({
  className,
  isLoading = false,
  maxHeight = 240,
  value,
  onValueChange,
  onSubmit,
  children,
}: PromptInputProps) {
  const [internalValue, setInternalValue] = useState(value || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleContainerClick = useCallback(() => {
    textareaRef.current?.focus();
  }, []);

  const handleChange = (newValue: string) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <PromptInputContext.Provider
      value={{
        isLoading,
        maxHeight,
        onSubmit,
        setValue: onValueChange ?? handleChange,
        textareaRef,
        value: value ?? internalValue,
      }}
    >
      {/** biome-ignore lint/a11y: If user clicks anywhere in input box, it should focus to it */}
      <div
        className={cn(
          "cursor-text rounded-3xl border border-input bg-background p-2 shadow-xs",
          className
        )}
        onClick={handleContainerClick}
      >
        {children}
      </div>
    </PromptInputContext.Provider>
  );
}

export type PromptInputTextareaProps = {
  disableAutosize?: boolean;
} & React.ComponentProps<typeof Textarea>;

function PromptInputTextarea({
  className,
  onKeyDown,
  disableAutosize = false,
  ...props
}: PromptInputTextareaProps) {
  const { value, setValue, maxHeight, onSubmit, disabled, textareaRef } =
    usePromptInput();

  useEffect(() => {
    if (disableAutosize) {
      return;
    }

    if (!textareaRef.current) {
      return;
    }

    if (textareaRef.current.scrollTop === 0) {
      textareaRef.current.style.height = "auto";
    }

    textareaRef.current.style.height =
      typeof maxHeight === "number"
        ? `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`
        : `min(${textareaRef.current.scrollHeight}px, ${maxHeight})`;
  }, [value, maxHeight, disableAutosize]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSubmit?.();
      }
      onKeyDown?.(e);
    },
    [onKeyDown, onSubmit]
  );

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
    },
    [setValue]
  );

  return (
    <Textarea
      className={cn(
        "min-h-11 w-full resize-none border-none bg-transparent text-primary shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
        className
      )}
      disabled={disabled}
      onChange={handleTextareaChange}
      onKeyDown={handleKeyDown}
      ref={textareaRef}
      rows={1}
      value={value}
      {...props}
    />
  );
}

type PromptInputActionsProps = React.HTMLAttributes<HTMLDivElement>;

function PromptInputActions({
  children,
  className,
  ...props
}: PromptInputActionsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
}

type PromptInputActionProps = {
  className?: string;
  tooltip: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
} & React.ComponentProps<typeof Tooltip>;

function PromptInputAction({
  tooltip,
  children,
  className,
  side = "top",
  ...props
}: PromptInputActionProps) {
  const { disabled } = usePromptInput();

  const handleTriggerClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  return (
    <Tooltip {...props}>
      <TooltipTrigger asChild disabled={disabled} onClick={handleTriggerClick}>
        {children}
      </TooltipTrigger>
      <TooltipContent className={className} side={side}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

export {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
};
