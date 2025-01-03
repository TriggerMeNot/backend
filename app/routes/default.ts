import { Hono } from "@hono";
import { describeRoute } from "@hono-openapi";
import DefaultController from "../controllers/default.ts";
import { resolver } from "@hono-openapi/zod";
import DefaultSchema from "../interfaces/default.ts";

const defaultRouter = new Hono();

defaultRouter.get(
  "/",
  describeRoute({
    tags: ["default"],
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

defaultRouter.get(
  "/about.json",
  describeRoute({
    tags: ["default"],
    description: "Get information about the server",
    responses: {
      200: {
        description: "Successful server information response",
        content: {
          "application/json": {
            schema: resolver(DefaultSchema.About.Response),
          },
        },
      },
    },
  }),
  DefaultController.about,
);

export default defaultRouter;
