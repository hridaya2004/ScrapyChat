"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
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

  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  const handleSettingsOpenChange = (isOpen: boolean) => {
    setSettingsOpen(isOpen);
    if (!isOpen) {
      setMenuOpen(false);
    }
  };

  if (data?.session) {
    return (
      <DropdownMenu modal={false} onOpenChange={setMenuOpen} open={isMenuOpen}>
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
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            if (isSettingsOpen) {
              e.preventDefault();
              return;
            }
            setMenuOpen(false);
          }}
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
