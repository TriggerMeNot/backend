import { Hono } from "@hono";
import { describeRoute } from "@hono-openapi";
import { validator } from "@hono-openapi/zod";
import jwtMiddleware from "../middlewares/jwt.ts";
import playgroundController from "../controllers/playground.ts";
import PlaygroundSchema from "../interfaces/playground.ts";

const playgroundRouter = new Hono();

playgroundRouter.use(jwtMiddleware);

playgroundRouter.get(
  "/",
  describeRoute({
    tags: ["playground"],
    description: "Get all playgrounds",
    responses: {
      200: {
        description: "Successful playground response",
      },
    },
  }),
  playgroundController.list,
);

playgroundRouter.post(
  "/",
  describeRoute({
    tags: ["playground"],
    description: "Create a playground",
    responses: {
      201: {
        description: "Successful playground response",
      },
      400: {
        description: "Bad request",
      },
    },
  }),
  playgroundController.create,
);

playgroundRouter.get(
  "/:id",
  describeRoute({
    tags: ["playground"],
    description: "Get a playground by ID",
    responses: {
      200: {
        description: "Successful playground response",
      },
      404: {
        description: "Not found",
      },
    },
  }),
  validator("param", PlaygroundSchema.Get.Param),
  playgroundController.get,
);

playgroundRouter.post(
  "/:playgroundId/action/:actionId",
  describeRoute({
    tags: ["playground"],
    description: "Add an action to a playground",
    responses: {
      200: {
        description: "Successful action response",
      },
      400: {
        description: "Bad request",
      },
    },
  }),
  validator("param", PlaygroundSchema.AddAction.Param),
  validator("json", PlaygroundSchema.AddAction.Body),
  playgroundController.addAction,
);

playgroundRouter.post(
  "/:playgroundId/reaction/:reactionId",
  describeRoute({
    tags: ["playground"],
    description: "Add a reaction to a playground",
    responses: {
      200: {
        description: "Successful reaction response",
      },
      400: {
        description: "Bad request",
      },
    },
  }),
  validator("param", PlaygroundSchema.AddReaction.Param),
  playgroundController.addReaction,
);

playgroundRouter.post(
  "/link",
  describeRoute({
    tags: ["playground"],
    description: "Link reaction or action to a action",
    responses: {
      200: {
        description: "Successful link response",
      },
      400: {
        description: "Bad request",
      },
      404: {
        description: "Not found",
      },
    },
  }),
  validator("json", PlaygroundSchema.Link.Body),
  playgroundController.link,
);

export default playgroundRouter;
