import { integer, json, pgTable, serial } from "drizzle-orm/pg-core";
import { actions } from "./actions.ts";
import { playgrounds } from "./playgrounds.ts";

export const actionsPlayground = pgTable("actionsPlayground", {
  id: serial("id").primaryKey().notNull(),
  playgroundId: integer("playground_id").notNull().references(() =>
    playgrounds.id
  ),
  actionId: integer("action_id").notNull().references(() => actions.id),
  settings: json("settings"),
});
