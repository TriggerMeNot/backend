import { Hono } from "@hono";
import { describeRoute } from "@hono-openapi";
import { validator } from "@hono-openapi/zod";
import GithubSchema from "../interfaces/github.ts";
import GithubController from "../controllers/github.ts";

const githubRouter = new Hono();

githubRouter.post(
  "/",
  describeRoute({
    tags: ["github"],
    description: "Save github token for the user.",
    responses: {
      200: {
        description: "Successful response",
      },
    },
  }),
  validator("form", GithubSchema.Github.Body),
  GithubController.setToken,
);

export default githubRouter;
