import { integer, jsonb, pgTable, serial } from "drizzle-orm/pg-core";
import { reactions } from "./reactions.ts";
import { playgrounds } from "./playgrounds.ts";

export const reactionsPlayground = pgTable("reactionsPlayground", {
  id: serial("id").primaryKey().notNull(),
  playgroundId: integer("playground_id").notNull().references(
    () => playgrounds.id,
    { onDelete: "cascade" },
  ),
  reactionId: integer("reaction_id").notNull().references(
    () => reactions.id,
    { onDelete: "cascade" },
  ),
  settings: jsonb("settings"),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
});
