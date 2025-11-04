import { UserCircleIcon } from "lucide-react";
import type { User } from "@/lib/auth-client";
import { DropdownMenuItem } from "../ui/dropdown-menu";

export default function UserInfo({ data }: { data: User }) {
  return (
    <DropdownMenuItem
      onClick={(e) => e.preventDefault()}
      className="flex flex-row gap-2"
    >
      <UserCircleIcon />
      <div className="flex flex-col gap-1 items-start">
        <span className="text-sm font-medium">{data?.name}</span>
        <span className="text-xs text-muted-foreground">{data?.email}</span>
      </div>
    </DropdownMenuItem>
  );
}
