import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { actionsPlayground } from "./actionsPlayground.ts";

export const crons = pgTable("crons", {
  id: serial("id").primaryKey().notNull(),
  actionPlaygroundId: integer("action_playground_id").notNull().references(
    () => actionsPlayground.id,
    { onDelete: "cascade" },
  ),
  cron: text("cron").notNull(),
});
