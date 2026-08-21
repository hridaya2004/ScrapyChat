import { SettingsIcon, XIcon } from "lucide-react";
import { useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDialog } from "@/providers/dialog-context-provider";
import { H4 } from "../typography";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import SettingsContent from "./settings-content";

interface SettingsTriggerProps {
  onOpenChange: (open: boolean) => void;
}

export default function SettingsTrigger({
  onOpenChange,
}: SettingsTriggerProps) {
  const { dialogState, setDialogState } = useDialog("settings-dialog");
  const isMobile = useIsMobile();

  const handleOpenChange = (isOpen: boolean) => {
    setDialogState(isOpen);
    onOpenChange(isOpen);
  };

  const handleTriggerSelect = useCallback((e: Event) => {
    e.preventDefault();
  }, []);

  const handleContentOpenAutoFocus = useCallback((e: Event) => {
    e.preventDefault();
  }, []);

  const trigger = (
    <DropdownMenuItem className="cursor-pointer" onSelect={handleTriggerSelect}>
      <SettingsIcon />
      <span>Settings</span>
    </DropdownMenuItem>
  );

  if (isMobile) {
    return (
      <Drawer onOpenChange={handleOpenChange} open={dialogState}>
        <DrawerTrigger asChild className="cursor-pointer">
          {trigger}
        </DrawerTrigger>
        <DrawerContent className="h-[85vh] max-h-[85vh]">
          <DrawerHeader className="flex flex-row items-center justify-between border-b pt-2">
            <DrawerTitle className="font-semibold text-xl tracking-tight">
              Settings
            </DrawerTitle>
            <DrawerClose>
              <XIcon className="size-4" />
            </DrawerClose>
          </DrawerHeader>
          <SettingsContent drawer />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={dialogState}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 max-md:min-h-[60vh] md:h-150 md:max-w-170 lg:max-w-200"
        onOpenAutoFocus={handleContentOpenAutoFocus}
        showCloseButton={isMobile}
      >
        <DialogHeader>
          <DialogTitle asChild>
            <div className="flex flex-row items-center justify-between border-b px-4 py-2">
              <H4>Settings</H4>
              <DialogClose asChild>
                <Button
                  className="rounded-full px-0! hover:bg-background dark:hover:bg-background"
                  variant="ghost"
                >
                  <XIcon />
                </Button>
              </DialogClose>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            You can change your preferences here.
          </DialogDescription>
        </DialogHeader>
        <SettingsContent />
      </DialogContent>
    </Dialog>
  );
}
