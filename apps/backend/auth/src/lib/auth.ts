/** biome-ignore-all lint/correctness/noUnusedFunctionParameters: "ignore" */
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { jwt, lastLoginMethod, openAPI } from "better-auth/plugins";
import { Pool } from "pg";
import sendEmail from "./send-email.ts";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),

  appName: "ScrapyChat",
  advanced: {
    useSecureCookies: true,
  },

  emailAndPassword: {
    enabled: true,
    revokeSessionsOnPasswordReset: true,
    requireEmailVerification: true,
  },

  emailVerification: {
    sendOnSignIn: true,
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${url} \n
				Token: ${token}`,
      });
    },
  },

  user: {
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url, token }, request) => {
        await sendEmail({
          to: user.email,
          subject: "Delete account",
          text: `Click the link to delete your account: ${url}`,
        });
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async (
        { user, newEmail, url, token },
        request
      ) => {
        await sendEmail({
          to: user.email,
          subject: "Approve email change",
          text: `Click the link to approve the change: ${url}`,
        });
      },
    },
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      redirectURI: process.env.GITHUB_REDIRECT_URI as string,
    },
  },

  plugins: [
    nextCookies(),
    lastLoginMethod(),
    jwt({
      jwks: {
        keyPairConfig: {
          alg: "EdDSA",
        },
        jwksPath: "/.well-known/jwks.json",
        rotationInterval: 86_400,
      },
      jwt: {
        expirationTime: "1d",
      },
    }),
    openAPI(),
  ],

  trustedOrigins: [
    "http://localhost:3000",
    "https://scrapy.local",
    "http://scrapy.local:3000",
  ],
});
