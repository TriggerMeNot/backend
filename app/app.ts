import { Hono } from "@hono";
import { serveStatic } from "@hono/deno";
import { logger } from "@hono/logger";
import { prettyJSON } from "@hono/pretty-json";
import { cors } from "@hono/cors";
import { swaggerUI } from "@hono/swagger-ui";
import { apiReference } from "@scalar/hono-api-reference";
import { describeRoute, openAPISpecs } from "@hono-openapi";
import { prometheus } from "@hono/prometheus";
import { jwt } from "@hono/jwt";
import defaultRouter from "./routes/default.ts";
import authRouter from "./routes/auth.ts";
import githubRouter from "./routes/github.ts";

if (!Deno.env.has("JWT_SECRET") || !Deno.env.has("DATABASE_URL")) {
  throw new Error(
    "Please set the JWT_SECRET and DATABASE_URL environment variables",
  );
}

const app = new Hono();

const { printMetrics, registerMetrics } = prometheus();

app.use("*", logger());
app.use("*", prettyJSON());
app.use("*", registerMetrics);

app.use("/api/*", cors());

app.get("/static/*", serveStatic({ precompressed: true }));
app.use("/static/*", serveStatic({ root: "./static" }));
app.use("/favicon.ico", serveStatic({ path: "./static/favicon.ico" }));

app.route("/", defaultRouter);
app.route("/auth", authRouter);

app.get(
  "/openapi",
  openAPISpecs(app as unknown as Hono, {
    documentation: {
      info: {
        title: "AREA API",
        version: "1.0.0",
        description: "API for Actions, REActions",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
      servers: [
        {
          url: `http://localhost:${Deno.env.get("PORT") || 8080}`,
          description: "Local server",
        },
      ],
    },
  }),
);

app.get(
  "doc",
  swaggerUI({
    url: "/openapi",
  }),
);
app.get(
  "/reference",
  apiReference({
    theme: "saturn",
    spec: {
      url: "/openapi",
    },
  }),
);

app.get("/metrics", printMetrics);

app.use(
  "/*",
  jwt({
    secret: Deno.env.get("JWT_SECRET")!,
  }),
);
app.route("/github", githubRouter);

export default app;
