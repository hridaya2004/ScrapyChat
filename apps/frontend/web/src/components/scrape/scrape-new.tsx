import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  type ScrapeNew as ScrapeNewType,
  scrapeNewSchema,
} from "@/model/scrape/new";
import { useAuthJWTProvider } from "@/providers/auth-jwt-provider";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { scrapeNewUrl } from "./scrape-core";

export default function ScrapeNew() {
  const { token } = useAuthJWTProvider();

  const scrapeNewUrlForm = useForm<ScrapeNewType>({
    resolver: zodResolver(scrapeNewSchema),
    defaultValues: {
      url: "",
    },
  });

  const htmlFormId = useId();
  const formUrlInputId = useId();

  if (!token) {
    return null;
  }

  const onSubmit = (data: ScrapeNewType) => scrapeNewUrl(data.url, token);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new URL to scrape</DialogTitle>
          <DialogDescription>
            Paste the link you want to scrape below:
          </DialogDescription>
        </DialogHeader>
        <div>
          <form
            id={htmlFormId}
            onSubmit={scrapeNewUrlForm.handleSubmit(onSubmit)}
          >
            <FieldGroup>
              <Controller
                control={scrapeNewUrlForm.control}
                name="url"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={formUrlInputId}>URL</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      id={formUrlInputId}
                      placeholder="Add URL for scraping"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </div>
        <DialogFooter>
          <Button form={htmlFormId} type="submit">
            Scrape
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
