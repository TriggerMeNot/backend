import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { users as userSchema } from "../schemas/users.ts";

const { Pool } = pg;

export const db = drizzle({
  client: new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
  }),
  schema: { userSchema },
});
