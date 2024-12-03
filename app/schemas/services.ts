import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const services = pgTable("services", {
  id: serial("id").primaryKey().notNull(),
  name: text("name").unique().notNull(),
});
