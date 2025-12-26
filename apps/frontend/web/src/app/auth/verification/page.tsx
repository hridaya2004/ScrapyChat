"use client";

import { redirect, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "@/components/ui/toast";
import VerifyEmailDialog from "@/components/verify-email-dialog";
import { authClient } from "@/lib/auth-client";

function VerificationPageFunction() {
  const { data } = authClient.useSession();

  const [open, setOpen] = useState(true);
  const handleOpenChange = () => {
    setOpen((prev) => !prev);
  };

  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const callbackUrl = searchParams.get("callbackURL");

  useEffect(() => {
    if (token && callbackUrl) {
      authClient.verifyEmail({
        query: {
          token,
          callbackURL: callbackUrl,
        },
      });
    }
  }, [token, callbackUrl]);

  useEffect(() => {
    if (data?.user.emailVerified) {
      toast({
        title: "Session refreshed successfully.",
        status: "success",
      });
      redirect("/");
    }
  }, [data]);

  return (
    <VerifyEmailDialog onOpenChange={handleOpenChange} openDialog={open} />
  );
}

export default function VerificationPage() {
  return (
    <Suspense>
      <VerificationPageFunction />
    </Suspense>
  );
}
