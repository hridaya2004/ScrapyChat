"use client";

import { unauthorized } from "next/navigation";
import { Chat } from "@/components/chat";
import { Spinner } from "@/components/ui/spinner";
import { useAuthContext } from "@/providers/auth-context-provider";

export default function Page() {
  const { errorStatusCode, loading, user } = useAuthContext();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user || errorStatusCode === 401) {
    unauthorized();
  }

  return <Chat />;
}
