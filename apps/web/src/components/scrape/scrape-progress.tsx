import { useEffect, useRef, useState } from "react";
import { isEmpty } from "@/lib/utils";
import type { ScrapeProgress as ScrapeProgressType } from "@/model/scrape/progress";
import { useAuthJWTProvider } from "@/providers/auth-jwt-provider";
import { useDialog } from "@/providers/dialog-context-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import { toast } from "../ui/toast";
import { getScrapeProgress } from "./scrape-core";

interface ProgressItem {
  url: string;
  progress: number;
}

export const ScrapeProgress = () => {
  const { token } = useAuthJWTProvider();

  const { dialogState, setDialogState } = useDialog("scrape-progress");

  const [scrapeData, setScrapeData] = useState<ProgressItem[]>([]);

  const previousUrlsRef = useRef<Set<string>>(new Set());
  const lastToastAtRef = useRef(0);
  const startedRef = useRef(false);

  // send the request on mount
  useEffect(() => {
    if (!token?.trim() || startedRef.current) {
      return;
    }

    startedRef.current = true;

    getScrapeProgress(token, (data: ScrapeProgressType) => {
      setScrapeData((prev) => {
        const map = new Map(prev.map(({ url, progress }) => [url, progress]));

        for (const [url, progress] of Object.entries(data)) {
          progress === 1 ? map.delete(url) : map.set(url, progress);
        }

        return Array.from(map, ([url, progress]) => ({ url, progress }));
      });
    });
  }, [token]);

  // show toast only if new URL is shown and
  // 5sec have passed since last toast
  useEffect(() => {
    if (isEmpty(scrapeData)) {
      previousUrlsRef.current.clear();
      lastToastAtRef.current = 0;
      return;
    }

    const currentUrls = new Set(scrapeData.map((d) => d.url));
    const hasNewUrl = [...currentUrls].some(
      (url) => !previousUrlsRef.current.has(url)
    );

    const now = Date.now();
    if (hasNewUrl && now - lastToastAtRef.current >= 5000) {
      lastToastAtRef.current = now;

      toast({
        title: "User defined website being scraped.",
        button: {
          label: "View",
          onClick: () => setDialogState(true),
        },
      });
    }

    previousUrlsRef.current = currentUrls;
  }, [scrapeData, setDialogState]);

  if (isEmpty(scrapeData)) {
    return null;
  }

  return (
    <Dialog onOpenChange={setDialogState} open={dialogState}>
      <DialogContent className="rounded-3xl">
        <DialogTitle>Progress</DialogTitle>
        <DialogDescription>
          Currently being scraped websites' progress
        </DialogDescription>

        <div className="mt-2 flex flex-col rounded-3xl border">
          {scrapeData.map(({ url, progress }) => (
            <div
              className="flex items-center justify-between gap-4 border-b p-2 px-4 font-mono text-sm last:border-b-0"
              key={url}
            >
              <span className="break-all text-muted-foreground">{url}</span>
              <span className="font-semibold">
                {Math.round(progress * 100)}%
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
