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
  logger.error({ dbPath, err }, "Database connection failed");
  throw err;
}

export const auth = betterAuth({
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },

  appName: "ScrapyChat",

  baseURL: process.env.BETTER_AUTH_BASE_URL,
  database: db,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,

    sendResetPassword: async ({ user, url }) => {
      await mailSender.sendEmail({
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
        to: user.email,
      });
    },
  },

  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await mailSender.sendEmail({
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${url}`,
        to: user.email,
      });
    },
  },

  plugins: [
    lastLoginMethod(),
    jwt({
      jwks: {
        jwksPath: "/.well-known/jwks.json",
        keyPairConfig: {
          alg: "EdDSA",
        },
        rotationInterval: 86_400,
      },
    }),
    openAPI(),
  ],

  rateLimit: {
    enabled: process.env.NODE_ENV === "production",
  },

  session: {
    cookieCache: {
      enabled: process.env.NODE_ENV === "production",
    },
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      redirectURI: process.env.GITHUB_REDIRECT_URI as string,
    },

    google: {
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      prompt: "select_account consent",
      redirectURI: process.env.GOOGLE_REDIRECT_URI as string,
    },
  },

  trustedOrigins: process.env.TRUSTED_ORIGIN?.split("|"),

  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, url }) => {
        await mailSender.sendEmail({
          subject: "Approve email change",
          text: `Click the link to approve the change: ${url}`,
          to: user.email,
        });
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        await mailSender.sendEmail({
          subject: "Delete account",
          text: `Click the link to delete your account: ${url}`,
          to: user.email,
        });
      },
    },
  },
});
