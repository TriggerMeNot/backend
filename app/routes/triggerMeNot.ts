import { Hono } from "@hono";
import { describeRoute } from "@hono-openapi";
import triggerMeNotController from "../controllers/triggerMeNot.ts";

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
  triggerMeNotController.OnFetch,
);

export default triggerMeNotRouter;
