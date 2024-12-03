import { integer, pgTable, serial } from "drizzle-orm/pg-core";
import { actions } from "./actions.ts";

export const actionLinks = pgTable("actionLinks", {
  id: serial("id").primaryKey().notNull(),
  triggerId: integer("trigger_id").notNull().references(() => actions.id),
  actionId: integer("action_id").notNull().references(() => actions.id),
});
