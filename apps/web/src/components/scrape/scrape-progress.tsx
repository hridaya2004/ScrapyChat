import { useEffect, useRef, useState } from "react";
import { Muted } from "@/components/typography";
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

  // Track all URLs we've ever seen in this session to avoid repeat toasts
  const seenUrlsRef = useRef<Set<string>>(new Set());
  const lastToastAtRef = useRef(0);
  const startedRef = useRef(false);
  const pendingToastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

        return Array.from(map, ([url, progress]) => ({ url, progress })).filter(
          ({ progress }) => progress < 1
        );
      });
    });
  }, [token]);

  // show toast only for truly new URLs we haven't seen before
  // with debouncing to prevent rapid-fire toasts
  useEffect(() => {
    if (isEmpty(scrapeData)) {
      return;
    }

    // Find URLs we've never seen before in this session
    const newUrls = scrapeData.filter((d) => !seenUrlsRef.current.has(d.url));

    if (newUrls.length === 0) {
      return;
    }

    // Mark these URLs as seen immediately to prevent duplicate detection
    for (const { url } of newUrls) {
      seenUrlsRef.current.add(url);
    }

    const now = Date.now();
    const timeSinceLastToast = now - lastToastAtRef.current;

    // Clear any pending toast
    if (pendingToastRef.current) {
      clearTimeout(pendingToastRef.current);
      pendingToastRef.current = null;
    }

    // If enough time has passed, show toast immediately
    if (timeSinceLastToast >= 5000) {
      lastToastAtRef.current = now;
      toast({
        title: "User defined website being scraped.",
        button: {
          label: "View",
          onClick: () => setDialogState(true),
        },
      });
    } else {
      // Otherwise, schedule a toast for when the cooldown expires
      const delay = 5000 - timeSinceLastToast;
      pendingToastRef.current = setTimeout(() => {
        lastToastAtRef.current = Date.now();
        toast({
          title: "User defined website being scraped.",
          button: {
            label: "View",
            onClick: () => setDialogState(true),
          },
        });
        pendingToastRef.current = null;
      }, delay);
    }
  }, [scrapeData, setDialogState]);

  // Cleanup pending toast on unmount
  useEffect(() => {
    return () => {
      if (pendingToastRef.current) {
        clearTimeout(pendingToastRef.current);
      }
    };
  }, []);

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
              className="flex items-center justify-between gap-4 border-b p-2 px-4 last:border-b-0"
              key={url}
            >
              <Muted className="break-all font-mono">{url}</Muted>
              <span className="font-semibold text-sm">
                {Math.round(progress * 100)}%
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
