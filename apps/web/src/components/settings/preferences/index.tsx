"use client";

import { VibrateIcon, Volume2Icon } from "lucide-react";

import { H4 } from "@/components/typography";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHaptics } from "@/providers/haptics-provider";

export default function PreferencesSettings() {
  const {
    isSoundEnabled,
    setSoundEnabled,
    isHapticsEnabled,
    setHapticsEnabled,
  } = useHaptics();
  const isMobile = useIsMobile();

  return (
    <section className="container px-4 py-2">
      <div className="flex flex-col gap-3">
        <H4>Preferences</H4>
        <FieldGroup>
          {isMobile && (
            <FieldSet>
              <FieldLegend>Haptic Feedback</FieldLegend>
              <FieldDescription>
                Enable vibration feedback on supported mobile devices when
                interacting with buttons, toggles, and other controls.
              </FieldDescription>
              <div className="flex items-center gap-3 pt-1">
                <Switch
                  checked={isHapticsEnabled}
                  id="haptics-toggle"
                  onCheckedChange={setHapticsEnabled}
                />
                <Label
                  className="flex items-center gap-2"
                  htmlFor="haptics-toggle"
                >
                  <VibrateIcon className="size-4 text-muted-foreground" />
                  {isHapticsEnabled ? "Haptics enabled" : "Haptics disabled"}
                </Label>
              </div>
            </FieldSet>
          )}
          <FieldSet>
            <FieldLegend>Sound Feedback</FieldLegend>
            <FieldDescription>
              Enable sound feedback when interacting with buttons, toggles, and
              other controls.
            </FieldDescription>
            <div className="flex items-center gap-3 pt-1">
              <Switch
                checked={isSoundEnabled}
                id="sound-toggle"
                onCheckedChange={setSoundEnabled}
              />
              <Label className="flex items-center gap-2" htmlFor="sound-toggle">
                <Volume2Icon className="size-4 text-muted-foreground" />
                {isSoundEnabled ? "Sound enabled" : "Sound disabled"}
              </Label>
            </div>
          </FieldSet>
        </FieldGroup>
      </div>
    </section>
  );
}
