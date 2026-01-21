"use client";

import { useQuery } from "@tanstack/react-query";
import { LinkIcon } from "lucide-react";
import { useState } from "react";
import { useAuthJWTProvider } from "@/providers/auth-jwt-provider";
import { useDialog } from "@/providers/dialog-context-provider";
import { useQueryPromptUrlProvider } from "@/providers/query-prompt-url-provider";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { RadioGroup } from "../ui/radio-group";
import { toast } from "../ui/toast";
import { getScrapeList } from "./scrape-core";
import ScrapeListItem from "./scrape-list-item";
import ScrapeNew from "./scrape-new";

export default function ScrapeList() {
  const { token } = useAuthJWTProvider();
  const { setUrl, url, clearUrl, setSuperUrl } = useQueryPromptUrlProvider();
  const { dialogState, setDialogState } = useDialog("scrape-list");
  const [moreDialogOpen, setMoreDialogOpen] = useState<string | null>(null);

  const { data, refetch } = useQuery({
    queryKey: ["scrapeList"],
    queryFn: () => getScrapeList(token?.trim() ? token : ""),
    enabled: !!token?.trim(),
  });

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

  const getUrlsForBaseUrl = (baseUrl: string) => {
    return (
      data?.ingestedUrls.filter((item) => {
        try {
          const urlObj = new URL(item);
          return urlObj.origin === baseUrl;
        } catch {
          return item === baseUrl;
        }
      }) ?? []
    );
  };

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
    setMoreDialogOpen(null);
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
    setMoreDialogOpen(null);
    setDialogState(false);
  };

  const trigger = (
    <DialogTrigger asChild>
      <Button className="rounded-full" size="icon" variant="outline">
        <LinkIcon />
      </Button>
    </DialogTrigger>
  );

  if (!token?.trim()) {
    return null;
  }

  return (
    <Dialog onOpenChange={setDialogState} open={dialogState}>
      {trigger}
      <DialogContent className="rounded-3xl">
        <DialogTitle>List of scraped websites</DialogTitle>
        <DialogDescription>
          This is a list of websites that have been scraped.
        </DialogDescription>
        <div className="flex w-full max-w-md flex-col gap-4">
          <div className="flex flex-row items-center justify-end gap-2">
            <ScrapeNew />
            <Button
              className="rounded-3xl"
              onClick={() => refetch()}
              variant="outline"
            >
              Refresh
            </Button>
          </div>
          <RadioGroup onValueChange={handleValueChange} value={url}>
            {uniqueBaseUrls.map((baseUrl) => (
              <ScrapeListItem
                baseUrl={baseUrl}
                isMoreDialogOpen={moreDialogOpen === baseUrl}
                key={baseUrl}
                onMoreDialogOpenChange={(open) =>
                  setMoreDialogOpen(open ? baseUrl : null)
                }
                onUrlSelect={handleMoreUrlSelect}
                selectedUrl={url}
                urls={getUrlsForBaseUrl(baseUrl)}
              />
            ))}
          </RadioGroup>
        </div>
      </DialogContent>
    </Dialog>
  );
}
