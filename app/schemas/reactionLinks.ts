import { integer, pgTable, serial } from "drizzle-orm/pg-core";
import { reactions } from "./reactions.ts";

export const reactionLinks = pgTable("reactionLinks", {
  id: serial("id").primaryKey().notNull(),
  triggerId: integer("trigger_id").notNull().references(() => reactions.id),
  reactionId: integer("reaction_id").notNull().references(() => reactions.id),
});
