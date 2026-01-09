import { useEffect, useRef, useState } from "react";
import { isEmpty } from "@/lib/utils";
import type { ScrapeProgress as ScrapeProgressType } from "@/model/scrape/progress";
import { useAuthJWTProvider } from "@/providers/auth-jwt-provider";
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
  const [showDialog, setShowDialog] = useState(false);
  const [scrapeData, setScrapeData] = useState<ProgressItem[]>([]);
  const previousUrlsRef = useRef<Set<string>>(new Set());
  const hasStartedRef = useRef(false);
  const { token } = useAuthJWTProvider();

  useEffect(() => {
    if (!token?.trim() || hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;

    getScrapeProgress(token, (data: ScrapeProgressType) => {
      const next = Object.entries(data)
        .filter(([, progress]) => progress !== 1)
        .map(([url, progress]) => ({ url, progress }));

      setScrapeData(next);
    });
  }, [token]);

  useEffect(() => {
    if (isEmpty(scrapeData)) {
      return;
    }

    const currentUrls = new Set(scrapeData.map((d) => d.url));

    let hasNewUrl = false;
    for (const url of currentUrls) {
      if (!previousUrlsRef.current.has(url)) {
        hasNewUrl = true;
        break;
      }
    }

    if (hasNewUrl) {
      toast({
        title: "User defined website being scraped.",
        button: {
          label: "View",
          onClick: () => setShowDialog(true),
        },
      });
    }

    previousUrlsRef.current = currentUrls;
  }, [scrapeData]);

  if (isEmpty(scrapeData)) {
    return null;
  }

  return (
    <Dialog onOpenChange={setShowDialog} open={showDialog}>
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
