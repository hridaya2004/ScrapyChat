"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  type ScrapeNew as ScrapeNewType,
  scrapeNewSchema,
} from "@/model/scrape/new";
import { useAuthJWTProvider } from "@/providers/auth-jwt-provider";
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
import { Field, FieldError, FieldGroup } from "../ui/field";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { scrapeNewUrl } from "./scrape-core";

export default function ScrapeNew() {
  const { token } = useAuthJWTProvider();

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
        setDialogOpen(false);
      }
    });
  };

  return (
    <AlertDialog onOpenChange={setDialogOpen} open={dialogOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <PlusIcon />
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
