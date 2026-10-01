import { Database } from "bun:sqlite";
import { logger } from "../lib/logger";

/**
 * Better Auth 1.7.0 through 1.7.2 required `account.issuer` (NOT NULL, plus a
 * unique index on `issuer` + `accountId`). 1.7.3 removed the requirement and
 * stopped writing the column, which makes every insert into `account` fail and
 * makes `auth migrate` refuse to run at all.
 *
 * See https://www.better-auth.com/docs/guides/1-7-upgrade-guide
 *
 * SQLite has no `ALTER COLUMN`, so the column is dropped instead of relaxed.
 * The index goes first: SQLite refuses to drop an indexed column.
 */
const dropLegacyAccountIssuer = (sqlite: Database): void => {
  const accountExists = sqlite
    .query<{ name: string }, []>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'account';"
    )
    .get();
  if (!accountExists) {
    return;
  }

  for (const { name } of sqlite
    .query<{ name: string }, []>('PRAGMA index_list("account");')
    .all()) {
    const columns = sqlite
      .query<{ name: string }, [string, string]>(
        "SELECT name FROM pragma_index_info(?) WHERE name = ?;"
      )
      .all(name, "issuer");
    if (columns.length === 0) {
      continue;
    }
    logger.warn({ index: name }, "Dropping legacy account index");
    sqlite.run(`DROP INDEX "${name.replaceAll('"', '""')}";`);
  }

  const issuer = sqlite
    .query<{ name: string }, [string]>(
      'SELECT name FROM pragma_table_info("account") WHERE name = ?;'
    )
    .get("issuer");
  if (!issuer) {
    return;
  }

  logger.warn({ column: "issuer", table: "account" }, "Dropping legacy column");
  sqlite.run('ALTER TABLE "account" DROP COLUMN "issuer";');
};

const dbPath = process.env.DATABASE_PATH;
if (!dbPath) {
  logger.warn("DATABASE_PATH is not set, skipping schema repair");
  process.exit(0);
}

const db = new Database(dbPath);
db.transaction(() => dropLegacyAccountIssuer(db))();
db.close();
