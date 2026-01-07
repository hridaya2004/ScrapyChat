import { jwtClient, lastLoginMethodClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { apiConfig } from "@/config/global";

export const authClient = createAuthClient({
  baseURL: apiConfig.authUrl.replace("/api", ""),

  fetchOptions: {
    credentials: "include",
  },

  plugins: [
    jwtClient({
      jwks: {
        jwksPath: `${apiConfig.authUrl}/auth/.well-known/jwks.json`,
      },
    }),
    lastLoginMethodClient(),
  ],
});

export type AuthContext = typeof authClient.$Infer;
export type Session = typeof authClient.$Infer.Session.session;
export type User = typeof authClient.$Infer.Session.user;
