import { betterAuth } from "better-auth/minimal";
import { jwt, lastLoginMethod, openAPI } from "better-auth/plugins";
import MailSender from "../controller/mail-sender";
import { dbAdapter } from "../db/adapter";

const mailSender = MailSender.getInstance();

export const auth = betterAuth({
  database: dbAdapter,

  appName: "ScrapyChat",
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: process.env.NODE_ENV === "production",
      domain: "hridaya.tech",
    },
  },

  session: {
    cookieCache: {
      enabled: process.env.NODE_ENV === "production",
      refreshCache: true,
    },
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
      sendChangeEmailConfirmation: async ({ user, url }) => {
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

    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirectURI: process.env.GOOGLE_REDIRECT_URI as string,
      accessType: "offline",
      prompt: "select_account consent",
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
    }),
    openAPI(),
  ],

  trustedOrigins: process.env.TRUSTED_ORIGIN?.split("|"),
});
