import { LogOutIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useAuthContext } from "@/providers/auth-context-provider";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { toast } from "../ui/toast";

export default function LogOutButton() {
  const { clearAuthState } = useAuthContext();
  const handleLogOut = async () => {
    const { data } = await authClient.signOut();

    if (data?.success) {
      toast({
        status: "success",
        title: "Signed out successfully.",
      });
      authClient.clearLastUsedLoginMethod();
      clearAuthState?.();
      redirect("/auth");
    } else {
      toast({
        status: "error",
        title: "Failed to sign out.",
      });
    }
  };
  return (
    <DropdownMenuItem className="cursor-pointer" onClick={handleLogOut}>
      <LogOutIcon /> Log Out
    </DropdownMenuItem>
  );
}
