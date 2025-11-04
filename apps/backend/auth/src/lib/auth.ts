/** biome-ignore-all lint/correctness/noUnusedFunctionParameters: "ignore" */
import { betterAuth } from "better-auth";
import { jwt, lastLoginMethod } from "better-auth/plugins";
import { importPKCS8, type JWTPayload, SignJWT } from "jose";
import { Pool } from "pg";
import sendEmail from "./send-email";

const privateKey = await importPKCS8(
  process.env.clientPrivateKey as string,
  "EdDSA"
);

export const auth = betterAuth({
  database: new Pool({
    connectionString: "postgres://postgres:example@localhost:5432/express_db",
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
      // plans for sending email verification later
      // for now just use token and password
      // sendDeleteAccountVerification: async ({ user, url, token }, request) => {
      //   await sendEmail({
      //     to: user.email,
      //     subject: "Delete account",
      //     text: `Click the link to delete your account: ${url}`,
      //   });
      // },
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
    },
  },

  plugins: [
    lastLoginMethod(),
    jwt({
      jwks: {
        remoteUrl: "http://localhost:3000/.well-known/jwks.json",
        keyPairConfig: {
          alg: "EdDSA",
        },
      },
      jwt: {
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
  ],

  trustedOrigins: ["http://localhost:3000"],
});
