import { Hono } from "@hono";
import { describeRoute } from "@hono-openapi";
import { validator } from "@hono-openapi/zod";
import jwtMiddleware from "../middlewares/jwt.ts";
import GoogleSchema from "../interfaces/google.ts";
import GoogleController from "../controllers/google.ts";

const googleRouter = new Hono();

googleRouter.get(
  "/uri",
  describeRoute({
    tags: ["auth", "google"],
    description: "Get Google OAuth URIs",
    responses: {
      200: {
        description: "Successful response",
      },
    },
  }),
  GoogleController.getURI,
);

googleRouter.post(
  "/authenticate",
  describeRoute({
    tags: ["auth", "google"],
    description: "Login to authenticate with Google",
    responses: {
      200: {
        description: "Successful response",
      },
    },
  }),
  validator("json", GoogleSchema.Authenticate.Body),
  GoogleController.authenticate,
);

googleRouter.use(jwtMiddleware);

googleRouter.get(
  "/authorize",
  describeRoute({
    tags: ["auth", "google"],
    description: "Verify if authorized with Google",
    responses: {
      200: {
        description: "Successful response",
      },
    },
  }),
  GoogleController.isAuthorized,
);

googleRouter.post(
  "/authorize",
  describeRoute({
    tags: ["auth", "google"],
    description: "Authorize with Google",
    responses: {
      200: {
        description: "Successful response",
      },
    },
  }),
  validator("json", GoogleSchema.Authorize.Body),
  GoogleController.authorize,
);

export default googleRouter;
