import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { users } from "./users.ts";

export const oauths = pgTable("oauths", {
  id: serial("id").primaryKey().notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  serviceId: integer("service_id").notNull(),
  token: text("token").notNull(),
  refreshToken: text("refresh_token"),
});
