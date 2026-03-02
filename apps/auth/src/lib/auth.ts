import { betterAuth } from "better-auth";
import { jwt, lastLoginMethod, openAPI } from "better-auth/plugins";
import MailSender from "../controller/mail-sender";
import { dbAdapter } from "../db/adapter";

const mailSender = MailSender.getInstance();

export const auth = betterAuth({
  database: dbAdapter,

  appName: "ScrapyChat",
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },

  baseURL: process.env.BETTER_AUTH_BASE_URL,

  emailAndPassword: {
    enabled: true,
    revokeSessionsOnPasswordReset: true,
    requireEmailVerification: true,

    sendResetPassword: async ({ user, url }) => {
      await mailSender.sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await mailSender.sendEmail({
        to: user.email,
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${url}`,
      });
    },
  },

  user: {
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        await mailSender.sendEmail({
          to: user.email,
          subject: "Delete account",
          text: `Click the link to delete your account: ${url}`,
        });
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, url }) => {
        await mailSender.sendEmail({
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

  rateLimit: {
    enabled: process.env.NODE_ENV === "production",
  },

  plugins: [
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
        audience: process.env.ISSUER_URL,
      },
    }),
    openAPI(),
  ],

  trustedOrigins: process.env.TRUSTED_ORIGIN?.split("|"),
});
