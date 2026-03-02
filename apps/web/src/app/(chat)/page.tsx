"use client";

import { unauthorized } from "next/navigation";
import { Chat } from "@/components/chat";
import { Spinner } from "@/components/ui/spinner";
import { useAuthJWTProvider } from "@/providers/auth-jwt-provider";

export default function Page() {
  const { errorStatusCode, loading } = useAuthJWTProvider();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (errorStatusCode === 401) {
    unauthorized();
  }

  return <Chat />;
}
