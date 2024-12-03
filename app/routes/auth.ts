import { Hono } from "@hono";
import { describeRoute } from "@hono-openapi";
import { resolver, validator } from "@hono-openapi/zod";
import jwtMiddleware from "../middlewares/jwt.ts";
import AuthSchema from "../interfaces/auth.ts";
import authController from "../controllers/auth.ts";
import GithubSchema from "../interfaces/github.ts";
import GithubController from "../controllers/github.ts";

const authRouter = new Hono();

authRouter.post(
  "/login",
  describeRoute({
    tags: ["auth"],
    description: "Login to get a JWT token",
    externalDocs: {
      description: "JWT",
      url: "https://jwt.io",
    },
    responses: {
      200: {
        description: "Successful login response",
        content: {
          "application/json": {
            schema: resolver(AuthSchema.Login.Response),
          },
        },
      },
    },
  }),
  validator("form", AuthSchema.Login.Body),
  authController.login,
);

authRouter.post(
  "/register",
  describeRoute({
    tags: ["auth"],
    description: "Register a new user",
    externalDocs: {
      description: "JWT",
      url: "https://jwt.io",
    },
    responses: {
      200: {
        description: "Successful registration response",
        content: {
          "application/json": {
            schema: resolver(AuthSchema.Register.Response),
          },
        },
      },
    },
  }),
  validator("form", AuthSchema.Register.Body),
  authController.register,
);

authRouter.use(jwtMiddleware);

authRouter.post(
  "/github",
  describeRoute({
    tags: ["auth", "github"],
    description: "Login to get Github access",
    responses: {
      200: {
        description: "Successful response",
      },
    },
  }),
  validator("json", GithubSchema.Root.Body),
  GithubController.root,
);

export default authRouter;
