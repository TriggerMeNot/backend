import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial().primaryKey().notNull(),
  email: text().unique().notNull(),
  username: text().notNull(),
  password: text().notNull(),
});
