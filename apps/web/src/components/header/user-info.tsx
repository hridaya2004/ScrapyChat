import { useCallback } from "react";
import type { User } from "@/lib/auth-client";
import { DropdownMenuItem } from "../ui/dropdown-menu";

export default function UserInfo({ data }: { data: User }) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <DropdownMenuItem className="flex flex-row gap-2" onClick={handleClick}>
      <div className="flex flex-col items-start gap-1">
        <span className="font-medium text-sm">{data?.name}</span>
        <span className="text-muted-foreground text-xs">{data?.email}</span>
      </div>
    </DropdownMenuItem>
  );
}
