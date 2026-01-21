"use client";

import { Field, FieldContent, FieldLabel, FieldTitle } from "../ui/field";
import { RadioGroupItem } from "../ui/radio-group";
import ScrapeUrlDetails from "./scrape-url-details";

interface ScrapeListItemProps {
  baseUrl: string;
  urls: string[];
  isMoreDialogOpen: boolean;
  onMoreDialogOpenChange: (open: boolean) => void;
  selectedUrl: string | undefined;
  onUrlSelect: (url: string) => void;
}

export default function ScrapeListItem({
  baseUrl,
  urls,
  isMoreDialogOpen,
  onMoreDialogOpenChange,
  selectedUrl,
  onUrlSelect,
}: ScrapeListItemProps) {
  const hasMultipleUrls = urls.length > 1;

  return (
    <FieldLabel className="hover:cursor-pointer" htmlFor={baseUrl}>
      <Field orientation="horizontal">
        <FieldContent className="flex flex-row items-center gap-2">
          <FieldTitle className="flex-1 break-all font-mono text-sm">
            {baseUrl}
          </FieldTitle>
          {hasMultipleUrls && (
            <ScrapeUrlDetails
              baseUrl={baseUrl}
              isOpen={isMoreDialogOpen}
              onOpenChange={onMoreDialogOpenChange}
              onUrlSelect={onUrlSelect}
              selectedUrl={selectedUrl}
              urls={urls}
            />
          )}
        </FieldContent>
        <RadioGroupItem aria-label={baseUrl} id={baseUrl} value={baseUrl} />
      </Field>
    </FieldLabel>
  );
}
