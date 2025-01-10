import { integer, pgTable, serial, text, unique } from "drizzle-orm/pg-core";
import { users } from "./users.ts";
import { services } from "./services.ts";

export const oidcs = pgTable("oidcs", {
  id: serial("id").primaryKey().notNull(),
  userId: integer("user_id").notNull().references(
    () => users.id,
    { onDelete: "cascade" },
  ),
  serviceId: integer("service_id").notNull().references(
    () => services.id,
    { onDelete: "cascade" },
  ),
  serviceUserId: text("service_user_id").notNull(),
  token: text("token").notNull(),
  tokenExpiresAt: integer("token_expires_at").notNull(),
  refreshToken: text("refresh_token").notNull(),
  refreshTokenExpiresAt: integer("refresh_token_expires_at").notNull(),
}, (table) => {
  return {
    unq: unique().on(table.userId, table.serviceId),
  };
});
