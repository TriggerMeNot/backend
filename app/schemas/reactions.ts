import { integer, pgTable, serial, text, unique } from "drizzle-orm/pg-core";
import { services } from "./services.ts";

export const reactions = pgTable(
  "reactions",
  {
    id: serial("id").primaryKey().notNull(),
    serviceId: integer("service_id")
      .notNull()
      .references(() => services.id),
    name: text("name").notNull(),
    description: text("description").notNull(),
  },
  (table) => {
    return {
      unq: unique().on(table.serviceId, table.name),
    };
  },
);
