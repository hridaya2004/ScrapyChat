import Database from "bun:sqlite";
import { betterAuth } from "better-auth";
import { jwt, lastLoginMethod, openAPI } from "better-auth/plugins";
import MailSender from "../controller/mail-sender";
import { logger } from "./logger";

const mailSender = MailSender.getInstance();

const dbPath = process.env.DATABASE_PATH;

let db: Database;
try {
  db = new Database(dbPath);
  const { pageCount, pageSize } = db
    .query(
      "SELECT page_count AS pageCount, page_size AS pageSize FROM pragma_page_count, pragma_page_size;"
    )
    .get() as { pageCount: number; pageSize: number };
  const dbSizeKb = Number.parseFloat(
    (((pageCount as number) * (pageSize as number)) / 1024).toFixed(1)
  );
  logger.info({ dbPath, dbSizeKb }, "Database connection established");
} catch (err) {
  logger.error({ err, dbPath }, "Database connection failed");
  throw err;
}

export const auth = betterAuth({
  database: db,

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
