import { Hono } from "@hono";
import { serveStatic } from "@hono/deno";
import { logger } from "@hono/logger";
import { prettyJSON } from "@hono/pretty-json";
import { cors } from "@hono/cors";
import { apiReference } from "@scalar/hono-api-reference";
import { jwt, sign } from "@hono/jwt";
import type { JwtVariables } from "@hono/jwt";
import { describeRoute, openAPISpecs } from "@hono-openapi";

if (!Deno.env.has("JWT_SECRET")) {
  console.error("JWT_SECRET is not set");
  Deno.exit(1);
}

const app = new Hono<{ Variables: JwtVariables }>();

app.use("*", logger());
app.use("*", prettyJSON());
app.use("/api/*", cors());

app.use("/static/*", serveStatic({ root: "./static" }));
app.use("/favicon.ico", serveStatic({ path: "./static/favicon.ico" }));

app.use("/auth/*", (c, next) => {
  const jwtMiddleware = jwt({
    secret: Deno.env.get("JWT_SECRET") || "",
  });
  return jwtMiddleware(c, next);
});

app.get(
  "/static/*",
  serveStatic({
    precompressed: true,
  }),
);

app.get(
  "/",
  describeRoute({
    description: "Say hello to the user",
    responses: {
      200: {
        description: "Successful greeting response",
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
  }),
  (c) => {
    return c.text("Hello Hono!");
  },
);

app.get(
  "/login",
  describeRoute({
    description: "Login to get a token",
    responses: {
      200: {
        description: "Successful login response",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                token: {
                  type: "string",
                },
              },
            },
          },
        },
      },
    },
  }),
  async (c) => {
    const payload = {
      sub: "user123",
      role: "admin",
      exp: Math.floor(Date.now() / 1000) + 60 * 5, // Token expires in 5 minutes
    };
    const token = await sign(payload, Deno.env.get("JWT_SECRET")!);
    return c.json({ token });
  },
);

app.get(
  "/auth/page",
  describeRoute({
    description: "Protected page",
    responses: {
      200: {
        description: "Successful greeting response",
        content: {
          "text/plain": {
            schema: {
              type: "string",
              example: "You are authorized",
            },
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "text/plain": {
            schema: {
              type: "string",
              example: "Unauthorized",
            },
          },
        },
      },
    },
  }),
  (c) => {
    return c.text("You are authorized");
  },
);

app.get(
  "/openapi",
  openAPISpecs(app as unknown as Hono, {
    documentation: {
      info: {
        title: "Hono",
        version: "1.0.0",
        description: "API for greeting users",
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
  "/docs",
  apiReference({
    theme: "saturn",
    spec: {
      url: "/openapi",
    },
  }),
);

export default app;
