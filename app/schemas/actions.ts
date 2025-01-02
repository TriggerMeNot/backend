import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  unique,
} from "drizzle-orm/pg-core";
import { services } from "./services.ts";

export const actions = pgTable(
  "actions",
  {
    id: serial("id").primaryKey().notNull(),
    serviceId: integer("service_id").notNull().references(
      () => services.id,
      { onDelete: "cascade" },
    ),
    name: text("name").notNull(),
    description: text("description").notNull(),
    settings: jsonb("settings"),
    params: jsonb("params"),
  },
  (table) => {
    return {
      unq: unique().on(table.serviceId, table.name),
    };
  },
);
