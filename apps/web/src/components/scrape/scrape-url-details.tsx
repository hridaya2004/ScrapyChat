"use client";

import { MoreHorizontal } from "lucide-react";
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

interface ScrapeUrlDetailsProps {
  baseUrl: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUrlSelect: (url: string) => void;
  selectedUrl: string | undefined;
  urls: string[];
}

export default function ScrapeUrlDetails({
  baseUrl,
  urls,
  isOpen,
  onOpenChange,
  selectedUrl,
  onUrlSelect,
}: ScrapeUrlDetailsProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={isOpen}>
      <DialogTrigger asChild>
        <Button
          className="h-6 rounded-full px-2 text-xs"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenChange(true);
          }}
          size="sm"
          variant="ghost"
        >
          <MoreHorizontal className="mr-1 h-3 w-3" />
          More ({urls.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto rounded-3xl">
        <DialogTitle>URLs for {baseUrl}</DialogTitle>
        <DialogDescription>
          Select a specific URL from this domain.
        </DialogDescription>
        <RadioGroup onValueChange={onUrlSelect} value={selectedUrl}>
          {urls.map((specificUrl) => (
            <FieldLabel
              className="hover:cursor-pointer"
              htmlFor={specificUrl}
              key={specificUrl}
            >
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle className="break-all font-mono text-sm">
                    {specificUrl}
                  </FieldTitle>
                </FieldContent>
                <RadioGroupItem
                  aria-label={specificUrl}
                  id={specificUrl}
                  value={specificUrl}
                />
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
      </DialogContent>
    </Dialog>
  );
}
