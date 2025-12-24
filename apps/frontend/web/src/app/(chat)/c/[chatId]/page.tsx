import { unauthorized } from "next/navigation";
import { Chat } from "@/components/chat";
import { useAuthJWTProvider } from "@/providers/auth-jwt-provider";

export default function Page() {
  const { errorStatusCode, loading } = useAuthJWTProvider();

  if (loading) {
    return null;
  }

  if (errorStatusCode === 401) {
    unauthorized();
  }

  return <Chat />;
}
