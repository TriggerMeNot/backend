import { integer, pgTable, serial } from "drizzle-orm/pg-core";
import { actions } from "./actions.ts";
import { reactions } from "./reactions.ts";

export const actionLinks = pgTable("actionLinks", {
  id: serial("id").primaryKey().notNull(),
  triggerId: integer("trigger_id").notNull().references(() => actions.id),
  reactionId: integer("reaction_id").notNull().references(() => reactions.id),
});
