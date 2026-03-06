"use client";

import { SmartphoneIcon } from "lucide-react";

import { H4 } from "@/components/typography";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useHaptics } from "@/providers/haptics-provider";

export default function PreferencesSettings() {
  const { enabled, setEnabled } = useHaptics();

  return (
    <section className="container px-4 py-2">
      <div className="flex flex-col gap-3">
        <H4>Preferences</H4>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Haptic Feedback</FieldLegend>
            <FieldDescription>
              Enable vibration feedback on supported mobile devices when
              interacting with buttons, toggles, and other controls.
            </FieldDescription>
            <div className="flex items-center gap-3 pt-1">
              <Switch
                checked={enabled}
                id="haptics-toggle"
                onCheckedChange={setEnabled}
              />
              <Label
                className="flex items-center gap-2"
                htmlFor="haptics-toggle"
              >
                <SmartphoneIcon className="size-4 text-muted-foreground" />
                {enabled ? "Haptics enabled" : "Haptics disabled"}
              </Label>
            </div>
          </FieldSet>
        </FieldGroup>
      </div>
    </section>
  );
}
