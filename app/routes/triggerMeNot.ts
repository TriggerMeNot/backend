import { Hono } from "@hono";
import { describeRoute } from "@hono-openapi";
import { validator } from "@hono-openapi/zod";
import jwtMiddleware from "../middlewares/jwt.ts";
import triggerMeNotController from "../controllers/triggerMeNot.ts";
import triggerMeNotSchema from "../interfaces/triggerMeNot.ts";

const triggerMeNotRouter = new Hono();

triggerMeNotRouter.use(jwtMiddleware);

triggerMeNotRouter.post(
  "/on-fetch",
  describeRoute({
    tags: ["triggerMeNot"],
    description: "React to a fetch event",
    responses: {
      200: {
        description: "Successful action response",
      },
      400: {
        description: "Bad request",
      },
    },
  }),
  validator("json", triggerMeNotSchema.OnFetch.Body),
  triggerMeNotController.OnFetch,
);

export default triggerMeNotRouter;
