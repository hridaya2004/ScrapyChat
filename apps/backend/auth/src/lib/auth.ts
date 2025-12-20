/** biome-ignore-all lint/correctness/noUnusedFunctionParameters: "ignore" */
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { jwt, lastLoginMethod, openAPI } from "better-auth/plugins";
import { importPKCS8, type JWTPayload, SignJWT } from "jose";
import { Pool } from "pg";
import sendEmail from "./send-email.ts";

const privateKey = await importPKCS8(
  process.env.clientPrivateKey as string,
  "EdDSA"
);

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
        remoteUrl: process.env.REMOTE_URL,
        keyPairConfig: {
          alg: "EdDSA",
        },
      },
      jwt: {
        expirationTime: "1d",
        sign: async (jwtPayload: JWTPayload) =>
          await new SignJWT(jwtPayload)
            .setProtectedHeader({
              alg: "EdDSA",
              kid: process.env.currentKid,
              typ: "JWT",
            })
            .sign(privateKey),
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
