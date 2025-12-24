import { useQuery } from "@tanstack/react-query";
import { ShoppingBagIcon } from "lucide-react";
import { useAuthJWTProvider } from "@/providers/auth-jwt-provider";
import { useChatCore } from "../chat/use-chat-core";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Field, FieldContent, FieldLabel, FieldTitle } from "../ui/field";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { toast } from "../ui/toast";
import { getScrapeList } from "./scrape-core";

export default function ScrapeList() {
  const { token } = useAuthJWTProvider();
  const { queryUrl, setQueryUrl } = useChatCore();

  const { data, refetch } = useQuery({
    queryKey: ["scrapeList"],
    queryFn: () => getScrapeList(token?.trim() ? token : ""),
  });

  const handleValueChange = (value: string) => {
    setQueryUrl?.(value);

    if (value !== queryUrl) {
      toast({
        title: "Updated context URL",
        description: `${value}`,
        status: "info",
        button: {
          label: "Clear",
          onClick: () => setQueryUrl(""),
        },
      });
    }
  };

  const trigger = (
    <DialogTrigger asChild>
      <Button variant="outline">
        <ShoppingBagIcon />
      </Button>
    </DialogTrigger>
  );

  if (!token?.trim()) {
    return null;
  }

  return (
    <Dialog>
      {trigger}
      <DialogContent>
        <DialogTitle>List of scraped websites</DialogTitle>
        <DialogDescription>
          This is a list of websites that have been scraped.
        </DialogDescription>
        <div className="flex w-full max-w-md flex-col gap-4">
          <Button
            className="ms-auto"
            onClick={() => refetch()}
            size="sm"
            variant="outline"
          >
            Refresh
          </Button>
          <RadioGroup onValueChange={handleValueChange} value={queryUrl}>
            {data?.ingestedUrls.map((item) => (
              <FieldLabel
                className="hover:cursor-pointer"
                htmlFor={item}
                key={item}
              >
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle className="break-all font-mono text-sm">
                      {item}
                    </FieldTitle>
                  </FieldContent>
                  <RadioGroupItem aria-label={item} id={item} value={item} />
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
        </div>
      </DialogContent>
    </Dialog>
  );
}
