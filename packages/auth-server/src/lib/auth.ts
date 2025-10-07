import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    connectionString: "postgres://postgres:example@localhost:5432/express_db"
  }),
  appName: "ScrapyChat",
  advanced: {
     useSecureCookies: true,
  },
  emailAndPassword: {
    enabled: true,
    revokeSessionsOnPasswordReset:true,
  },
  trustedOrigins: [
    "http://localhost:3000"
  ]
});
