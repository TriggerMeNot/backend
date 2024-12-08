import { integer, pgTable, serial } from "drizzle-orm/pg-core";
import { actionsPlayground } from "./actionsPlayground.ts";
import { reactionsPlayground } from "./reactionsPlayground.ts";

export const actionLinks = pgTable("actionLinks", {
  id: serial("id").primaryKey().notNull(),
  triggerId: integer("trigger_id").notNull().references(
    () => actionsPlayground.id,
    { onDelete: "cascade" },
  ),
  reactionId: integer("reaction_id").notNull().references(
    () => reactionsPlayground.id,
    { onDelete: "cascade" },
  ),
});
