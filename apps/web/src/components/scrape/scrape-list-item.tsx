"use client";

import { ChevronRight, Globe, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthJWTProvider } from "@/providers/auth-jwt-provider";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { deleteScrapeUrl } from "./scrape-core";
import ScrapeUrlDetails from "./scrape-url-details";

interface ScrapeListItemProps {
  baseUrl: string;
  isMoreDialogOpen: boolean;
  isSelected: boolean;
  onMoreDialogOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
  onUrlDeleted: () => void;
  onUrlSelect: (url: string) => void;
  selectedUrl: string | undefined;
  urls: string[];
}

export default function ScrapeListItem({
  baseUrl,
  urls,
  isMoreDialogOpen,
  isSelected,
  onMoreDialogOpenChange,
  onSelect,
  selectedUrl,
  onUrlSelect,
  onUrlDeleted,
}: ScrapeListItemProps) {
  const { token } = useAuthJWTProvider();
  const [deleting, setDeleting] = useState(false);
  const hasMultipleUrls = urls.length > 1;

  let hostname = baseUrl;
  try {
    hostname = new URL(baseUrl).hostname;
  } catch {
    // keep as-is
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token?.trim()) {
      return;
    }
    setDeleting(true);

    const deleteNext = (index: number) => {
      if (index >= urls.length) {
        setDeleting(false);
        onUrlDeleted();
        return;
      }
      deleteScrapeUrl(urls[index], token, (success, loading) => {
        if (!loading) {
          if (success) {
            deleteNext(index + 1);
          } else {
            setDeleting(false);
            onUrlDeleted();
          }
        }
      });
    };

    deleteNext(0);
  };

  return (
    <button
      className={cn(
        "group relative flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-colors",
        isSelected
          ? "border-primary bg-primary/5 dark:bg-primary/10"
          : "border-border hover:bg-accent/50"
      )}
      onClick={() => {
        if (!isMoreDialogOpen) {
          onSelect(baseUrl);
        }
      }}
      type="button"
    >
      {/* Favicon / icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Globe className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-medium text-sm">{hostname}</span>
        <span className="truncate text-muted-foreground text-xs">
          {baseUrl}
        </span>
      </div>

      {/* Right side: badge + actions */}
      <div className="flex shrink-0 items-center gap-1">
        {hasMultipleUrls && (
          <Badge className="tabular-nums" variant="secondary">
            {urls.length}
          </Badge>
        )}

        {/* Delete */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="h-7 w-7 rounded-full"
              disabled={deleting}
              onClick={handleDelete}
              size="icon"
              variant="ghost"
            >
              {deleting ? (
                <Spinner size="size-3.5" />
              ) : (
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Delete {hasMultipleUrls ? "all pages" : "page"}
          </TooltipContent>
        </Tooltip>

        {/* Expand sub-URLs */}
        {hasMultipleUrls ? (
          <ScrapeUrlDetails
            baseUrl={baseUrl}
            isOpen={isMoreDialogOpen}
            onOpenChange={onMoreDialogOpenChange}
            onUrlDeleted={onUrlDeleted}
            onUrlSelect={onUrlSelect}
            selectedUrl={selectedUrl}
            urls={urls}
          />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </button>
  );
}
