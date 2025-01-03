import { integer, pgTable, serial } from "drizzle-orm/pg-core";
import { reactionsPlayground } from "./reactionsPlayground.ts";

export const reactionLinks = pgTable("reactionLinks", {
  id: serial("id").primaryKey().notNull(),
  triggerId: integer("trigger_id").notNull().references(
    () => reactionsPlayground.id,
    { onDelete: "cascade" },
  ),
  reactionId: integer("reaction_id").notNull().references(
    () => reactionsPlayground.id,
    { onDelete: "cascade" },
  ),
});
