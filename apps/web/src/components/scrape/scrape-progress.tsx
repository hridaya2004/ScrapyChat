import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { Muted } from "@/components/typography";
import type { ScrapeProgress as ScrapeProgressType } from "@/model/scrape/progress";
import { useAuthContext } from "@/providers/auth-context-provider";
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
  progress: number;
  url: string;
}

export const ScrapeProgress = () => {
  const { token } = useAuthContext();
  const { dialogState, setDialogState } = useDialog("scrape-progress");

  const [scrapeData, setScrapeData] = useState<ProgressItem[]>([]);

  const startedRef = useRef(false);
  const hasShownToastRef = useRef(false);
  const lastToastTimeRef = useRef(0);

  // Show toast only once per scrape batch, and never while dialog is open
  // Throttled to fire at most once every 10 seconds
  useEffect(() => {
    if (scrapeData.length === 0) {
      hasShownToastRef.current = false;
      return;
    }

    if (hasShownToastRef.current || dialogState) {
      return;
    }

    const now = Date.now();
    if (now - lastToastTimeRef.current < 10_000) {
      return;
    }

    hasShownToastRef.current = true;
    lastToastTimeRef.current = now;
    toast({
      title: "Website is being scraped",
      button: {
        label: "View progress",
        onClick: () => setDialogState(true),
      },
    });
  }, [scrapeData, dialogState, setDialogState]);

  useEffect(() => {
    if (!token?.trim() || startedRef.current) {
      return;
    }
    startedRef.current = true;

    getScrapeProgress(token, (data: ScrapeProgressType) => {
      setScrapeData((prev) => {
        const map = new Map(prev.map(({ url, progress }) => [url, progress]));

        for (const [url, progress] of Object.entries(data)) {
          if (progress >= 1) {
            map.delete(url);
          } else {
            map.set(url, progress);
          }
        }

        return Array.from(map, ([url, progress]) => ({ url, progress }));
      });
    });
  }, [token]);

  return (
    <Dialog onOpenChange={setDialogState} open={dialogState}>
      <DialogContent className="rounded-3xl">
        <DialogTitle>Scraping progress</DialogTitle>
        <DialogDescription>Websites currently being scraped</DialogDescription>

        {scrapeData.length > 0 ? (
          <div className="mt-2 flex flex-col overflow-hidden rounded-2xl border">
            {scrapeData.map(({ url, progress }) => (
              <div
                className="relative flex items-center justify-between gap-4 border-b p-2 px-4 last:border-b-0"
                key={url}
              >
                <motion.div
                  animate={{ width: `${Math.round(progress * 100)}%` }}
                  className="absolute inset-y-0 left-0 bg-primary/5"
                  initial={{ width: 0 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                />
                <Muted className="relative z-10 break-all font-mono text-xs">
                  {url}
                </Muted>
                <span className="relative z-10 font-semibold text-sm tabular-nums">
                  {Math.round(progress * 100)}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <Muted className="py-6 text-center">
            No websites are currently being scraped.
          </Muted>
        )}
      </DialogContent>
    </Dialog>
  );
};
