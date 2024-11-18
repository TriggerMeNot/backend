import { OpenAPIHono } from "@hono/zod-openapi";
import { serveStatic } from "@hono/deno";
import { logger } from "@hono/logger";
import { prettyJSON } from "@hono/pretty-json";
import { cors } from "@hono/cors";
import { apiReference } from "@scalar/hono-api-reference";

const app = new OpenAPIHono();

app.use("*", logger());
app.use("*", prettyJSON());
app.use("/api/*", cors());

app.use("/static/*", serveStatic({ root: "./static" }));
app.use("/favicon.ico", serveStatic({ path: "./static/favicon.ico" }));
app.use("/docs", apiReference({ spec: { url: "/openapi.json" } }));

app.doc(
  "/openapi.json",
  () => ({
    openapi: "3.1.1",
    info: {
      version: "1.0.0",
      title: "Insert Name Here",
    },
  }),
);

app.get(
  "/static/*",
  serveStatic({
    precompressed: true,
  }),
);

app.openapi({
  method: "get",
  path: "/",
  responses: {
    200: {
      description: "OK",
      content: {
        "text/plain": {
          schema: {
            type: "string",
            example: "Hello Hono!",
          },
        },
      },
    },
  },
}, (c) => {
  return c.text("Hello Hono!");
});

export default app;
