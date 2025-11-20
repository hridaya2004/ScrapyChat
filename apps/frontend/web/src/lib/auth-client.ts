import { jwtClient, lastLoginMethodClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "",
  plugins: [jwtClient(), lastLoginMethodClient()],
});

export type AuthContext = typeof authClient.$Infer;
export type Session = typeof authClient.$Infer.Session.session;
export type User = typeof authClient.$Infer.Session.user;
