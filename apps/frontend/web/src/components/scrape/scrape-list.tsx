import { useQuery } from "@tanstack/react-query";
import { ShoppingBagIcon } from "lucide-react";
import { useAuthJWTProvider } from "@/providers/auth-jwt-provider";
import { P } from "../typography";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { getScrapeList } from "./scrape-core";

export default function ScrapeList() {
  const { token } = useAuthJWTProvider();

  const { data, error } = useQuery({
    queryKey: ["scrapeList"],
    queryFn: () => getScrapeList(token ?? ""),
  });

  const trigger = (
    <DialogTrigger asChild>
      <Button variant="outline">
        <ShoppingBagIcon />
      </Button>
    </DialogTrigger>
  );

  return (
    <Dialog>
      {trigger}
      <DialogContent>
        <DialogTitle>List of scraped websites</DialogTitle>
        <DialogDescription>
          This is a list of websites that have been scraped.
        </DialogDescription>
        <div>
          {!!error && (
            <P className="text-destructive">Failed to load scraped websites</P>
          )}

          {data?.ingestedUrls.map((item) => (
            <Card key={item}>
              <CardContent className="break-all font-mono text-sm">
                {item}
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
