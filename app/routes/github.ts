import { Hono } from "@hono";
import { describeRoute } from "@hono-openapi";
import { validator } from "@hono-openapi/zod";
import jwtMiddleware from "../middlewares/jwt.ts";
import GithubSchema from "../interfaces/github.ts";
import GithubController from "../controllers/github.ts";

const githubRouter = new Hono();

githubRouter.get(
  "/uri",
  describeRoute({
    tags: ["auth", "github"],
    description: "Get Github OAuth URIs",
    responses: {
      200: {
        description: "Successful response",
      },
    },
  }),
  GithubController.getURI,
);

githubRouter.post(
  "/webhook",
  describeRoute({
    tags: ["auth", "github"],
    description: "Webhook for Github",
    responses: {
      200: {
        description: "Successful response",
      },
    },
  }),
  GithubController.webhook,
);

githubRouter.post(
  "/authenticate",
  describeRoute({
    tags: ["auth", "github"],
    description: "Login to authenticate with Github",
    responses: {
      200: {
        description: "Successful response",
      },
    },
  }),
  validator("json", GithubSchema.Authenticate.Body),
  GithubController.authenticate,
);

githubRouter.use(jwtMiddleware);

githubRouter.get(
  "/authorize",
  describeRoute({
    tags: ["auth", "github"],
    description: "Authorize with Github",
    responses: {
      200: {
        description: "Successful response",
      },
    },
  }),
  GithubController.isAuthorized,
);

githubRouter.post(
  "/authorize",
  describeRoute({
    tags: ["auth", "github"],
    description: "Authorize with Github",
    responses: {
      200: {
        description: "Successful response",
      },
    },
  }),
  validator("json", GithubSchema.Authorize.Body),
  GithubController.authorize,
);

export default githubRouter;
