import { LogOutIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { DropdownMenuItem } from "../ui/dropdown-menu";

export default function LogOutButton() {
  const handleLogOut = async () => {
    const { data } = await authClient.signOut();
    if (data?.success) {
      toast.success("Signed out successfully.");
      redirect("/auth");
    } else {
      toast.error("Failed to sign out.");
    }
  };
  return (
    <DropdownMenuItem className="cursor-pointer" onClick={handleLogOut}>
      <LogOutIcon /> Log Out
    </DropdownMenuItem>
  );
}
