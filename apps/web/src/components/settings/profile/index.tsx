import { authClient } from "@/lib/auth-client";
import EmailProfile from "./email-profile";
import OAuthProfile from "./oauth-profile";

export default function ProfileSettings() {
  const lastMethod = authClient.getLastUsedLoginMethod();

  if (lastMethod === "github" || lastMethod === "google") {
    return <OAuthProfile />;
  }

  if (lastMethod === "email" || lastMethod === null) {
    return <EmailProfile />;
  }

  return null;
}
