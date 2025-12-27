"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  type ScrapeNew as ScrapeNewType,
  scrapeNewSchema,
} from "@/model/scrape/new";
import { useAuthJWTProvider } from "@/providers/auth-jwt-provider";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Field, FieldError, FieldGroup } from "../ui/field";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { getScrapeProgress, scrapeNewUrl } from "./scrape-core";

export default function ScrapeNew() {
  const { token } = useAuthJWTProvider();

  const { refetch: fetchScrapeProgress } = useQuery({
    queryKey: ["scrapeStatus"],
    queryFn: () => getScrapeProgress(token ?? ""),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const scrapeNewUrlForm = useForm<ScrapeNewType>({
    resolver: zodResolver(scrapeNewSchema),
    defaultValues: {
      url: "",
    },
  });

  const htmlFormId = useId();
  const formUrlInputId = useId();

  if (!token?.trim()) {
    return null;
  }

  const onSubmit = (data: ScrapeNewType) => {
    scrapeNewUrl(data.url, token, (success, updatedLoading) => {
      setLoading(updatedLoading);
      if (success) {
        console.log("Scrape started");
        setDialogOpen(false);
        fetchScrapeProgress();
      } else {
        console.log("Scrape failed");
      }
    });
  };

  return (
    <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Enter the website URL</DialogTitle>
          <DialogDescription>
            Enter the URL of the website you want the information from:
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
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      className="rounded-3xl"
                      id={formUrlInputId}
                      placeholder="https://example.com"
                    />
                    {!!fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button className="rounded-3xl" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            className="rounded-3xl"
            disabled={loading}
            form={htmlFormId}
            type="submit"
          >
            {!!loading && (
              <Spinner className="bg-primary-foreground" size="size-4" />
            )}
            {loading ? "Scraping" : "Scrape"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
