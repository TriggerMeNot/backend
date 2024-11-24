import { Hono } from "@hono";
import { describeRoute } from "@hono-openapi";
import { resolver, validator } from "@hono-openapi/zod";
import jwtMiddleware from "../middlewares/jwt.ts";
import { githubAuth } from "@hono/oauth-providers/github";
import GithubSchema from "../interfaces/github.ts";
import GithubController from "../controllers/github.ts";

const githubRouter = new Hono();

if (!Deno.env.get("GITHUB_ID") || !Deno.env.get("GITHUB_SECRET")) {
  throw new Error(
    "Please set the GITHUB_ID and GITHUB_SECRET environment variables",
  );
}

githubRouter.use("*", jwtMiddleware);

githubRouter.use(
  "/",
  githubAuth({
    client_id: Deno.env.get("GITHUB_ID"),
    client_secret: Deno.env.get("GITHUB_SECRET"),
    scope: ["public_repo", "read:user", "user", "user:email", "user:follow"],
    oauthApp: true,
  }),
);

githubRouter.get(
  "/",
  describeRoute({
    tags: ["github"],
    description: "Callback for Github OAuth",
    responses: {
      200: {
        description: "Successful Github OAuth response",
        content: {
          "application/json": {
            schema: resolver(GithubSchema.Github.Response),
          },
        },
      },
    },
  }),
  validator("query", GithubSchema.Github.Query),
  GithubController.callback,
);

export default githubRouter;
