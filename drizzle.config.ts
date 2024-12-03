import { defineConfig } from "drizzle-kit";

if (!Deno.env.get("DATABASE_URL")) {
  throw new Error("DATABASE_URL is required");
}

export default defineConfig({
  out: "./drizzle",
  schema: "./app/schemas",
  dialect: "postgresql",
  dbCredentials: {
    url: Deno.env.get("DATABASE_URL")!,
  },
});
