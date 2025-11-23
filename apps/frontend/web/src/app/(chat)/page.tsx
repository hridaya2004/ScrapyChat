"use client";

import { Chat } from "@/components/chat";
import { useAuthJWTProvider } from "@/providers/auth-jwt-provider";

export default function Page() {
  const data = useAuthJWTProvider();

  if (data.loading) {
    return null;
  }

  return <Chat />;
}
