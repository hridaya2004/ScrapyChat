"use client";

import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import VerifyEmailDialog from "@/components/verify-email-dialog";
import { authClient } from "@/lib/auth-client";

export default function VerificationPage() {
  const { data } = authClient.useSession();

  const [open, setOpen] = useState(true);
  const handleOpenChange = () => {
    setOpen((open) => !open);
  };

  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const callbackUrl = searchParams.get("callbackURL");

  useEffect(() => {
    if (token && callbackUrl) {
      authClient.verifyEmail({
        query: {
          token: token,
          callbackURL: callbackUrl,
        },
      });
    }
  }, [token, callbackUrl]);

  useEffect(() => {
    if (data?.user.emailVerified) {
      toast.success("Session refreshed successfully.");
      redirect("/");
    }
  }, [data]);

  return (
    <VerifyEmailDialog onOpenChange={handleOpenChange} openDialog={open} />
  );
}
