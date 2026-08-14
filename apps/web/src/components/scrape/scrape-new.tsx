"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  type ScrapeNew as ScrapeNewType,
  scrapeNewSchema,
} from "@/model/scrape/new";
import { useAuthContext } from "@/providers/auth-context-provider";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../ui/field";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { postScrapeNewUrl } from "./scrape-core";

export default function ScrapeNew() {
  const { token } = useAuthContext();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const scrapeNewUrlForm = useForm<ScrapeNewType>({
    defaultValues: {
      deep_search: false,
      url: "",
    },
    resolver: zodResolver(scrapeNewSchema),
  });

  const htmlFormId = useId();
  const formUrlInputId = useId();
  const formDeepSearchId = useId();

  if (!token?.trim()) {
    return null;
  }

  const onSubmit = (data: ScrapeNewType) => {
    postScrapeNewUrl(
      data.url,
      data.deep_search,
      token,
      (success, updatedLoading) => {
        setLoading(updatedLoading);
        if (success) {
          setDialogOpen(false);
          // cleanup the form after use
          scrapeNewUrlForm.reset();
        }
      }
    );
  };

  return (
    <AlertDialog onOpenChange={setDialogOpen} open={dialogOpen}>
      <AlertDialogTrigger asChild>
        <Button className="rounded-full" variant="outline">
          Add new website
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Enter the website URL</AlertDialogTitle>
          <AlertDialogDescription>
            Enter the URL of the website you want the information from:
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div>
          <form
            id={htmlFormId}
            onSubmit={scrapeNewUrlForm.handleSubmit(onSubmit)}
          >
            <FieldGroup>
              <Controller
                control={scrapeNewUrlForm.control}
                name="url"
                // biome-ignore lint/performance/noJsxPropsBind: standard react-hook-form pattern
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
              <Controller
                control={scrapeNewUrlForm.control}
                name="deep_search"
                // biome-ignore lint/performance/noJsxPropsBind: standard react-hook-form pattern
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <Checkbox
                      checked={field.value}
                      id={formDeepSearchId}
                      onCheckedChange={field.onChange}
                    />
                    <FieldContent>
                      <FieldLabel htmlFor={formDeepSearchId}>
                        Deep Search
                      </FieldLabel>
                      <FieldDescription>
                        If selected, all the links within the page will be
                        ingested as well.
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button className="rounded-3xl" variant="outline">
              Cancel
            </Button>
          </AlertDialogCancel>
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
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
