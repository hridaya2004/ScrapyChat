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

export const ScrapeProgress = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [scrapeData, setScrapeData] = useState<ScrapeProgressType[]>([]);
  const persistentDataRef = useRef<ScrapeProgressType[]>([]);
  const previousLengthRef = useRef(0);
  const { token } = useAuthJWTProvider();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!token || hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;

    getScrapeProgress(token, (data: ScrapeProgressType) => {
      setScrapeData((prev) => {
        // this float ranges from 0 to 1.0
        const isComplete = data.progress === 1.0;
        const filtered = prev.filter((item) => item.url !== data.url);
        return isComplete ? filtered : [...filtered, data];
      });
    });
  }, [token]);

  useEffect(() => {
    // no use of checking scrapeData's length as
    // SSE would always send an empty object, hence making the
    // length of it be more than 0
    if (!isEmpty(scrapeData)) {
      const hasValidDataIncreased =
        scrapeData.length > previousLengthRef.current;
      const hasDataChanged = !Object.is(persistentDataRef.current, scrapeData);

      if (hasValidDataIncreased && hasDataChanged) {
        toast({
          title: "User defined website being scraped.",
          button: {
            label: "View",
            onClick: () => setShowDialog(true),
          },
        });
      }

      persistentDataRef.current = scrapeData;
      previousLengthRef.current = scrapeData.length;
    }
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
        <div className="mt-4 flex flex-col rounded-3xl border">
          {scrapeData.map((item) => (
            <div
              className="flex items-center justify-between gap-4 border-b p-2 px-4 last:border-b-0"
              key={item.url}
            >
              <span className="font-mono text-muted-foreground text-sm">
                {item.url}
              </span>
              <span className="font-semibold">
                {Math.round(item.progress * 100)}%
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
