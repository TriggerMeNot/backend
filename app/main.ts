import { Hono } from "hono";
import { cors, logger, prettyJSON } from "hono/middleware";
import type { MiddlewareHandler } from "hono";

const app = new Hono();

app.use("*", logger() as unknown as MiddlewareHandler);
app.use("*", prettyJSON() as unknown as MiddlewareHandler);
app.use("/api/*", cors() as unknown as MiddlewareHandler);

app.get("/", (c) => c.text("Hello Hono!"));

Deno.serve(
  { port: 8080 },
  app.fetch,
);
