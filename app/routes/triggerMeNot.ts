import { Hono } from "@hono";
import { describeRoute } from "@hono-openapi";
import { validator } from "@hono-openapi/zod";
import triggerMeNotController from "../controllers/triggerMeNot.ts";
import triggerMeNotSchema from "../interfaces/triggerMeNot.ts";

const triggerMeNotRouter = new Hono();

triggerMeNotRouter.post(
  "/on-fetch/:token",
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
  validator("param", triggerMeNotSchema.OnFetch.Param),
  triggerMeNotController.OnFetch,
);

export default triggerMeNotRouter;
