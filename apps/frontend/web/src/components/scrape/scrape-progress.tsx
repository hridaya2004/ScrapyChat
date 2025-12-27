import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
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
  const hasToastedRef = useRef(false);
  const persistentDataRef = useRef<ScrapeProgressType>([]);

  const [showDialog, setShowDialog] = useState(false);

  const { token } = useAuthJWTProvider();
  const { data } = useQuery({
    queryKey: ["scrapeStatus"],
    queryFn: () => getScrapeProgress(token ?? ""),
  });

  const handleDialog = (value: boolean) => {
    setShowDialog(value);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: ignore
  useEffect(() => {
    if (
      !hasToastedRef.current &&
      data?.length &&
      persistentDataRef.current !== data
    ) {
      hasToastedRef.current = true;
      persistentDataRef.current = data;

      toast({
        title: "User defined website being scraped.",
        button: handleDialog(!showDialog) ?? undefined,
      });
    }
  }, [data]);

  if (!data) {
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
          {data.map((item) => (
            <div
              className="flex items-center justify-between border-b p-2 px-4 last:border-b-0"
              key={item.url}
            >
              <span className="font-mono text-muted-foreground">
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
