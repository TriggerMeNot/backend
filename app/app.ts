import { Hono } from "@hono";
import { serveStatic } from "@hono/deno";
import { logger } from "@hono/logger";
import { prettyJSON } from "@hono/pretty-json";
import { cors } from "@hono/cors";
import { swaggerUI } from "@hono/swagger-ui";
import { apiReference } from "@scalar/hono-api-reference";
import { openAPISpecs } from "@hono-openapi";
import { prometheus } from "@hono/prometheus";
import defaultRouter from "./routes/default.ts";
import authRouter from "./routes/auth.ts";
import userRouter from "./routes/user.ts";
import playgroundRouter from "./routes/playground.ts";
import triggerMeNotRouter from "./routes/triggerMeNot.ts";
import githubRouter from "./routes/github.ts";
import googleRouter from "./routes/google.ts";
import discordRouter from "./routes/discord.ts";
import microsoftRouter from "./routes/microsoft.ts";
import { seedDatabase } from "./db/seed.ts";

await seedDatabase();

const app = new Hono();
const apiRouter = new Hono();

app.use(logger());
app.use(prettyJSON());
app.use(cors());

app.get("/static/*", serveStatic({ precompressed: true }));
app.use("/static/*", serveStatic({ root: "./static" }));
app.use("/favicon.ico", serveStatic({ path: "./static/favicon.ico" }));

app.route("/", defaultRouter);

{
  const { printMetrics, registerMetrics } = prometheus();

  apiRouter.use(registerMetrics);
  apiRouter.get("/metrics", printMetrics);
}

apiRouter.route("/auth", authRouter);
apiRouter.route("/user", userRouter);
apiRouter.route("/playground", playgroundRouter);
apiRouter.route("/trigger-me-not", triggerMeNotRouter);
apiRouter.route("/github", githubRouter);
apiRouter.route("/google", googleRouter);
apiRouter.route("/discord", discordRouter);
apiRouter.route("/microsoft", microsoftRouter);

app.route("/api", apiRouter);

app.get(
  "/api/openapi",
  openAPISpecs(app as never, {
    documentation: {
      info: {
        title: "TriggerMeNot API",
        version: "1.0.0",
        description: "API for TriggerMeNot",
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
  "/api/doc",
  swaggerUI({
    url: "/api/openapi",
  }),
);
app.get(
  "/api/reference",
  apiReference({
    theme: "saturn",
    spec: {
      url: "/api/openapi",
    },
  }),
);

export default app;
