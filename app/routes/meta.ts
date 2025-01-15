import { Hono } from "@hono";
import { describeRoute } from "@hono-openapi";
import { validator } from "@hono-openapi/zod";
import jwtMiddleware from "../middlewares/jwt.ts";
import MetaSchema from "../interfaces/meta.ts";
import MetaController from "../controllers/meta.ts";

const metaRouter = new Hono();

metaRouter.post(
  "/authenticate",
  describeRoute({
    tags: ["auth", "meta"],
    description: "Login to authenticate with Meta",
    responses: {
      200: {
        description: "Successful response",
      },
    },
  }),
  validator("json", MetaSchema.Authenticate.Body),
  MetaController.authenticate,
);

metaRouter.use(jwtMiddleware);

metaRouter.get(
  "/authorize",
  describeRoute({
    tags: ["auth", "meta"],
    description: "Verify if authorized with Meta",
    responses: {
      200: {
        description: "Successful response",
      },
    },
  }),
  MetaController.isAuthorized,
);

metaRouter.post(
  "/authorize",
  describeRoute({
    tags: ["auth", "meta"],
    description: "Authorize with Meta",
    responses: {
      200: {
        description: "Successful response",
      },
    },
  }),
  validator("json", MetaSchema.Authorize.Body),
  MetaController.authorize,
);

export default metaRouter;