import { Hono } from "@hono";
import { describeRoute } from "@hono-openapi";
import { validator } from "@hono-openapi/zod";
import jwtMiddleware from "../middlewares/jwt.ts";
import MicrosoftSchema from "../interfaces/microsoft.ts";
import MicrosoftController from "../controllers/microsoft.ts";

const microsoftRouter = new Hono();

microsoftRouter.post(
  "/authenticate",
  describeRoute({
    tags: ["auth", "microsoft"],
    description: "Login to authenticate with Microsoft",
    responses: {
      200: {
        description: "Successful response",
      },
    },
  }),
  validator("json", MicrosoftSchema.Authenticate.Body),
  MicrosoftController.authenticate,
);

microsoftRouter.use(jwtMiddleware);

microsoftRouter.get(
  "/authorize",
  describeRoute({
    tags: ["auth", "microsoft"],
    description: "Verify if authorized with Microsoft",
    responses: {
      200: {
        description: "Successful response",
      },
    },
  }),
  MicrosoftController.isAuthorized,
);

microsoftRouter.post(
  "/authorize",
  describeRoute({
    tags: ["auth", "microsoft"],
    description: "Authorize with Microsoft",
    responses: {
      200: {
        description: "Successful response",
      },
    },
  }),
  validator("json", MicrosoftSchema.Authorize.Body),
  MicrosoftController.authorize,
);

export default microsoftRouter;
