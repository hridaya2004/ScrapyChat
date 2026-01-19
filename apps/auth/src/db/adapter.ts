import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/node-postgres";
// biome-ignore lint/performance/noNamespaceImport: Required for drizzle
import * as authSchema from "@/src/db/schema";

const db = drizzle(process.env.DATABASE_URL as string);

const dbAdapter = drizzleAdapter(db, {
  provider: "pg",
  schema: {
    ...authSchema,
  },
});

export { dbAdapter };
