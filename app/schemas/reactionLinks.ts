import { integer, pgTable, serial } from "drizzle-orm/pg-core";
import { reactions } from "./reactions.ts";
import { actions } from "./actions.ts";

export const reactionLinks = pgTable("reactionLinks", {
  id: serial("id").primaryKey().notNull(),
  triggerId: integer("trigger_id").notNull().references(() => reactions.id),
  actionId: integer("action_id").notNull().references(() => actions.id),
});
