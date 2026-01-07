import { jwtClient, lastLoginMethodClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    process.env.NODE_ENV === "development" ? "http://localhost:3001" : "",

  fetchOptions: {
    credentials: "include",
  },

  plugins: [
    jwtClient({
      jwks: {
        jwksPath:
          process.env.NODE_ENV === "development"
            ? "http://localhost:3001/api/auth/.well-known/jwks.json"
            : "/api/auth/.well-known/jwks.json",
      },
    }),
    lastLoginMethodClient(),
  ],
});

export type AuthContext = typeof authClient.$Infer;
export type Session = typeof authClient.$Infer.Session.session;
export type User = typeof authClient.$Infer.Session.user;
