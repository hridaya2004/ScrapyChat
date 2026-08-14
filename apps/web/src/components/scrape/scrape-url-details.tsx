"use client";

import { ChevronRight, FileText, Trash2, XIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/providers/auth-context-provider";
import { useDialog } from "@/providers/dialog-context-provider";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Spinner } from "../ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { deleteScrapeUrl } from "./scrape-core";

interface ScrapeUrlDetailsProps {
  baseUrl: string;
  onUrlDeleted: () => void;
  onUrlSelect: (url: string) => void;
  selectedUrl: string | undefined;
  urls: string[];
}

export default function ScrapeUrlDetails({
  baseUrl,
  urls,
  selectedUrl,
  onUrlSelect,
  onUrlDeleted,
}: ScrapeUrlDetailsProps) {
  const { token } = useAuthContext();
  const { dialogState, setDialogState } = useDialog(
    `scrape-url-details${baseUrl}`
  );

  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

  let hostname = baseUrl;
  try {
    ({ hostname } = new URL(baseUrl));
  } catch {
    // keep as-is
  }

  const handleDialogOutside = useCallback(
    (e: Event) => {
      setDialogState(true);
      e.preventDefault();
    },
    [setDialogState]
  );

  const handleDelete = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    if (!token?.trim()) {
      return;
    }
    setDeletingUrl(url);
    deleteScrapeUrl(url, token, (success, loading) => {
      if (!loading) {
        setDeletingUrl(null);
      }
      if (success) {
        onUrlDeleted();
      }
    });
  };

  return (
    <Dialog onOpenChange={setDialogState} open={dialogState}>
      <DialogTrigger asChild>
        <Button
          className="h-7 w-7 rounded-full"
          // biome-ignore lint/performance/noJsxPropsBind: event delegation
          onClick={(e) => {
            e.stopPropagation();
          }}
          size="icon"
          variant="ghost"
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="flex max-h-[80vh] flex-col gap-0 overflow-hidden rounded-3xl p-0"
        onInteractOutside={handleDialogOutside}
        onPointerDownOutside={handleDialogOutside}
        showCloseButton={false}
      >
        <DialogHeader className="flex-row items-center justify-between px-6 pt-6 pb-4">
          <div className="flex flex-col gap-1">
            <DialogTitle className="truncate">{hostname}</DialogTitle>
            <DialogDescription>
              {urls.length} {urls.length === 1 ? "page" : "pages"} scraped from
              this domain.
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button size="icon-lg" variant="ghost">
              <XIcon className="size-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <Separator />

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-1.5 px-4 py-3">
            {urls.map((specificUrl) => {
              const isActive = selectedUrl === specificUrl;

              return (
                // biome-ignore lint/a11y: "this should actually be a button but hydration issue prevents it"
                <div
                  className={cn(
                    "group flex w-full cursor-pointer items-center gap-3 rounded-lg border-none bg-transparent px-3 py-2.5 text-left transition-colors",
                    isActive
                      ? "bg-primary/10 dark:bg-primary/15"
                      : "hover:bg-accent/50"
                  )}
                  key={specificUrl}
                  // biome-ignore lint/performance/noJsxPropsBind: event delegation
                  onClick={() => {
                    onUrlSelect(specificUrl);
                    setDialogState(false);
                  }}
                >
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="scrollbar-none min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm">
                    {specificUrl}
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="h-7 w-7 shrink-0 rounded-full"
                        disabled={deletingUrl === specificUrl}
                        // biome-ignore lint/performance/noJsxPropsBind: event delegation
                        onClick={(e) => handleDelete(e, specificUrl)}
                        size="icon"
                        variant="ghost"
                      >
                        {deletingUrl === specificUrl ? (
                          <Spinner size="size-3.5" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete page</TooltipContent>
                  </Tooltip>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
