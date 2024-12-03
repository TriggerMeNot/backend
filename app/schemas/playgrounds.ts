import { integer, pgTable, serial } from "drizzle-orm/pg-core";
import { users } from "./users.ts";

export const playgrounds = pgTable("playgrounds", {
  id: serial("id").primaryKey().notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
});
