import { Hono } from "@hono";
import { describeRoute } from "@hono-openapi";
import DefaultController from "../controllers/default.ts";

const defaultRouter = new Hono();

defaultRouter.get(
  "/",
  describeRoute({
    description: "Say hello to the user",
    responses: {
      200: {
        description: "Successful greeting response",
        content: {
          "text/plain": {
            schema: {
              type: "string",
              example: "Hello Hono!",
            },
          },
        },
      },
    },
  }),
  DefaultController.root,
);

export default defaultRouter;
