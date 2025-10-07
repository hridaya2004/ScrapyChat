"use client";

import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import LogOutButton from "./log-out-button";

export default function UserToggle() {
  const { data } = authClient.useSession();

  if (data?.session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer">
          <Avatar>
            <AvatarFallback>{data?.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <LogOutButton />
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return null;
}
