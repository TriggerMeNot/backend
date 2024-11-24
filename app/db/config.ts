import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { users as userSchema } from "../schemas/users.ts";
import { oauths as oauthSchema } from "../schemas/oauths.ts";

if (!Deno.env.get("DATABASE_URL")) {
  console.error("Please set DATABASE_URL in the environment variables");
  Deno.exit(1);
}

const { Pool } = pg;

export const db = drizzle({
  client: new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
  }),
  schema: { userSchema, oauthSchema },
});
