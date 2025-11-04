import { SettingsIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { H3 } from "../typography";
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
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import SettingsContent from "./settings-content";

type SettingsTriggerProps = {
  onOpenChange: (open: boolean) => void;
};

export default function SettingsTrigger({
  onOpenChange,
}: SettingsTriggerProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    onOpenChange(isOpen);
  };

  const trigger = (
    <DropdownMenuItem
      className="cursor-pointer"
      onSelect={(e) => e.preventDefault()}
    >
      <SettingsIcon />
      <span>Settings</span>
    </DropdownMenuItem>
  );

  if (isMobile) {
    return (
      <Drawer onOpenChange={handleOpenChange} open={open}>
        <DrawerTrigger asChild className="cursor-pointer">
          {trigger}
        </DrawerTrigger>
        <DrawerContent>
          <SettingsContent drawer />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 max-md:min-h-[60vh] md:h-[600px] md:max-w-[680px] lg:max-w-[800px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
        showCloseButton={isMobile}
      >
        <DialogHeader>
          <DialogTitle asChild>
            <div className="flex flex-row items-center justify-between border-b px-4 py-2">
              <H3>Settings</H3>
              <DialogClose asChild>
                <Button className="rounded-full" size="icon-sm" variant="ghost">
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
