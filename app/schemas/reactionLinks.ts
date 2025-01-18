import { integer, pgTable, serial, unique } from "drizzle-orm/pg-core";
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
}, (table) => {
  return {
    unq: unique().on(table.triggerId, table.reactionId),
  };
});
