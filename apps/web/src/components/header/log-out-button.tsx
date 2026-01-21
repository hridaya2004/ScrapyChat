import { LogOutIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useAuthJWTProvider } from "@/providers/auth-jwt-provider";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { toast } from "../ui/toast";

export default function LogOutButton() {
  const { clearAuthState } = useAuthJWTProvider();
  const handleLogOut = async () => {
    const { data } = await authClient.signOut();

    if (data?.success) {
      toast({
        title: "Signed out successfully.",
        status: "success",
      });
      authClient.clearLastUsedLoginMethod();
      clearAuthState?.();
      redirect("/auth");
    } else {
      toast({
        title: "Failed to sign out.",
        status: "error",
      });
    }
  };
  return (
    <DropdownMenuItem className="cursor-pointer" onClick={handleLogOut}>
      <LogOutIcon /> Log Out
    </DropdownMenuItem>
  );
}
