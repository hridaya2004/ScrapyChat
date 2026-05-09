"use client";

import { useQuery } from "@tanstack/react-query";
import { Globe, LinkIcon, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuthJWTProvider } from "@/providers/auth-jwt-provider";
import { useDialog } from "@/providers/dialog-context-provider";
import { useQueryPromptUrlProvider } from "@/providers/query-prompt-url-provider";
import { Muted } from "../typography";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Spinner } from "../ui/spinner";
import { toast } from "../ui/toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { deleteAllScrapeUrls, getScrapeList } from "./scrape-core";
import ScrapeListItem from "./scrape-list-item";
import ScrapeNew from "./scrape-new";

export default function ScrapeList() {
  const { token } = useAuthJWTProvider();
  const { setUrl, url, clearUrl, setSuperUrl } = useQueryPromptUrlProvider();
  const { dialogState, setDialogState } = useDialog("scrape-list");
  const [deletingAll, setDeletingAll] = useState(false);

  const { data, refetch } = useQuery({
    queryKey: ["scrapeList"],
    queryFn: () => getScrapeList(token?.trim() ? token : ""),
    enabled: !!token?.trim(),
  });

  const [debouncedRefetch, isRefreshing] = useDebounce(() => refetch(), 2000);

  const handleUrlDeleted = () => {
    refetch();
  };

  const handleDeleteAll = () => {
    if (!token?.trim()) {
      return;
    }
    setDeletingAll(true);
    deleteAllScrapeUrls(token, (success, loading) => {
      setDeletingAll(loading);
      if (success) {
        clearUrl();
        refetch();
      }
    });
  };

  const uniqueBaseUrls = Array.from(
    new Set(
      data?.ingestedUrls
        .map((item) => {
          try {
            const urlObj = new URL(item);
            return urlObj.origin;
          } catch {
            return item;
          }
        })
        .filter(Boolean) ?? []
    )
  );

  const getUrlsForBaseUrl = (baseUrl: string) =>
    data?.ingestedUrls.filter((item) => {
      try {
        const urlObj = new URL(item);
        return urlObj.origin === baseUrl;
      } catch {
        return item === baseUrl;
      }
    }) ?? [];

  const handleValueChange = (value: string) => {
    if (value === url) {
      return;
    }

    setUrl?.(value);
    setSuperUrl(true);
    toast({
      title: "Updated context URL",
      description: `${value}`,
      status: "info",
      button: {
        label: "Clear",
        onClick: clearUrl,
      },
    });
    setDialogState(false);
  };

  const handleMoreUrlSelect = (value: string) => {
    if (value === url) {
      return;
    }

    setUrl?.(value);
    setSuperUrl(false);
    toast({
      title: "Updated context URL",
      description: `${value}`,
      status: "info",
      button: {
        label: "Clear",
        onClick: clearUrl,
      },
    });
    setDialogState(false);
  };

  const getBaseUrl = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const trigger = (
    <DialogTrigger asChild>
      <Button className="rounded-full" size="icon" variant="outline">
        <LinkIcon />
      </Button>
    </DialogTrigger>
  );

  const totalUrls = data?.ingestedUrls.length ?? 0;

  if (!token?.trim()) {
    return null;
  }

  return (
    <Dialog onOpenChange={setDialogState} open={dialogState}>
      {trigger}
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden rounded-3xl p-0">
        <div className="flex flex-col gap-1 px-6 pt-6 pb-4">
          <DialogTitle>Scraped Websites</DialogTitle>
          <DialogDescription>
            {totalUrls > 0
              ? `${uniqueBaseUrls.length} ${uniqueBaseUrls.length === 1 ? "domain" : "domains"}, ${totalUrls} ${totalUrls === 1 ? "page" : "pages"} ingested`
              : "No websites have been scraped yet."}
          </DialogDescription>
        </div>

        <Separator />

        <div className="flex flex-row items-center gap-2 px-6 py-3">
          <ScrapeNew />
          <div className="flex-1" />
          {uniqueBaseUrls.length > 0 && (
            <AlertDialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="rounded-full"
                      disabled={deletingAll}
                      size="icon"
                      variant="ghost"
                    >
                      {deletingAll ? (
                        <Spinner size="size-4" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Delete all</TooltipContent>
              </Tooltip>
              <AlertDialogContent className="rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete all scraped URLs?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove all scraped websites. This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel asChild>
                    <Button className="rounded-3xl" variant="outline">
                      Cancel
                    </Button>
                  </AlertDialogCancel>
                  <Button
                    className="rounded-3xl"
                    disabled={deletingAll}
                    onClick={handleDeleteAll}
                    variant="destructive"
                  >
                    {deletingAll ? "Deleting..." : "Delete All"}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="rounded-full"
                disabled={isRefreshing}
                onClick={() => debouncedRefetch()}
                size="icon"
                variant="ghost"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>
        </div>

        <Separator />

        {uniqueBaseUrls.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Globe className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="font-medium text-sm">No websites ingested</p>
              <Muted className="max-w-60 text-xs">
                Add a website to start scraping and chatting with its content.
              </Muted>
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-2 px-4 py-3">
              {uniqueBaseUrls.map((baseUrl) => (
                <ScrapeListItem
                  baseUrl={baseUrl}
                  isSelected={getBaseUrl(url) === getBaseUrl(baseUrl)}
                  key={baseUrl}
                  onSelect={handleValueChange}
                  onUrlDeleted={handleUrlDeleted}
                  onUrlSelect={handleMoreUrlSelect}
                  selectedUrl={url}
                  urls={getUrlsForBaseUrl(baseUrl)}
                />
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
