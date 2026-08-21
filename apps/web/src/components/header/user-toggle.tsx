"use client";

import { useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { useDialog } from "@/providers/dialog-context-provider";
import SettingsTrigger from "../settings/settings-trigger";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import LogOutButton from "./log-out-button";
import UserInfo from "./user-info";

export default function UserToggle() {
  const { data } = authClient.useSession();

  const { dialogState: userMenuState, setDialogState: setUserMenuState } =
    useDialog("user-menu");
  const {
    dialogState: settingsDialogState,
    setDialogState: setSettingsDialogState,
  } = useDialog("settings-dialog");

  const handleSettingsOpenChange = (isOpen: boolean) => {
    setSettingsDialogState(isOpen);
    if (!isOpen) {
      setUserMenuState(false);
    }
  };

  const handleCloseAutoFocus = useCallback((e: Event) => {
    e.preventDefault();
  }, []);

  const handleInteractOutside = useCallback(
    (e: Event) => {
      if (settingsDialogState) {
        e.preventDefault();
        return;
      }
      setUserMenuState(false);
    },
    [settingsDialogState, setUserMenuState]
  );

  if (data?.session) {
    return (
      <DropdownMenu
        modal={false}
        onOpenChange={setUserMenuState}
        open={userMenuState}
      >
        <DropdownMenuTrigger className="cursor-pointer">
          <Avatar>
            <AvatarImage
              alt={`${data?.user.name}'s Profile Picture`}
              src={data?.user.image as unknown as string | Blob | undefined}
            />
            <AvatarFallback>{data?.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          forceMount
          onCloseAutoFocus={handleCloseAutoFocus}
          onInteractOutside={handleInteractOutside}
          sideOffset={4}
        >
          <UserInfo data={data.user} />
          <DropdownMenuSeparator />
          <SettingsTrigger onOpenChange={handleSettingsOpenChange} />
          <LogOutButton />
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return null;
}
