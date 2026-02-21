import { useId, useRef, useState } from "react";
import { H4, Muted } from "@/components/typography";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { appVersion } from "@/config/version";
import { useLocalStorage } from "@/hooks/use-local-storage";

export default function VersionInfo() {
  const { setItem: setDevelopmentMode, getItem: getDevelopmentMode } =
    useLocalStorage("development-enabled");
  const { setItem: setDevelopmentUrl, getItem: getDevelopmentUrl } =
    useLocalStorage("development-url");

  const developmentModeEnabled = getDevelopmentMode() === "true";

  const developmentUrlId = useId();
  const [showDialog, setShowDialog] = useState(false);
  const [devUrl, setDevUrl] = useState(getDevelopmentUrl() || "");

  const buttonClickedTimes = useRef(0);

  const handleEnableDevelopment = () => {
    if (developmentModeEnabled) {
      toast({
        title: "You're already a developer.",
        description: "Stop clicking a lot.",
      });
      return;
    }

    buttonClickedTimes.current += 1;

    if (buttonClickedTimes.current >= 5) {
      setShowDialog(true);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const url = String(formData.get(developmentUrlId) || "");
    setDevelopmentUrl(url);
    setDevUrl(url);
    toast({
      title: "Development URL set.",
      description: `Development URL set to ${url}`,
    });
  };

  const handleEnableConfirm = () => {
    setDevelopmentMode("true");
    setShowDialog(false);
    window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  };

  return (
    <div className="flex flex-col gap-4">
      <H4>Version Information</H4>
      <div className="flex flex-wrap items-center gap-2">
        <Muted>Current version: </Muted>
        <Button onClick={handleEnableDevelopment} variant="ghost">
          v{appVersion}
        </Button>
      </div>
      {developmentModeEnabled && (
        <div className="flex flex-col gap-3">
          <Muted className="font-semibold">Backend development URL</Muted>
          <form
            className="flex max-w-sm flex-row items-center gap-2"
            onSubmit={handleFormSubmit}
          >
            <Input
              className="max-w-sm rounded-3xl"
              disabled={!developmentModeEnabled}
              id={developmentUrlId}
              name={developmentUrlId}
              onChange={(e) => setDevUrl(e.target.value)}
              placeholder="http://localhost:8080"
              value={devUrl}
            />
            <Button className="rounded-3xl">Set</Button>
          </form>
        </div>
      )}

      <AlertDialog onOpenChange={setShowDialog} open={showDialog}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Do you want to enable development mode?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Enabling development mode will allow you to access experimental
              features that are not yet stable. Are you sure you want to
              proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              className="rounded-3xl"
              onClick={() => setShowDialog(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button className="rounded-3xl" onClick={handleEnableConfirm}>
              Yes, enable
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
