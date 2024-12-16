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

playgroundRouter.patch(
  "/:id",
  describeRoute({
    tags: ["playground"],
    description: "Update a playground",
    responses: {
      200: {
        description: "Successful playground response",
      },
      400: {
        description: "Bad request",
      },
    },
  }),
  validator("param", PlaygroundSchema.Patch.Param),
  validator("json", PlaygroundSchema.Patch.Body),
  playgroundController.patch,
);

playgroundRouter.delete(
  "/:id",
  describeRoute({
    tags: ["playground"],
    description: "Delete a playground",
    responses: {
      200: {
        description: "Successful delete response",
      },
      400: {
        description: "Bad request",
      },
    },
  }),
  validator("param", PlaygroundSchema.Delete.Param),
  playgroundController.deletePlayground,
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
  "/:playgroundId/reaction/:reactionId",
  describeRoute({
    tags: ["playground"],
    description: "Add an reaction to a playground",
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
  validator("json", PlaygroundSchema.AddReaction.Body),
  playgroundController.addReaction,
);

playgroundRouter.patch(
  "/:playgroundId/reaction/:reactionPlaygroundId",
  describeRoute({
    tags: ["playground"],
    description: "Update a reaction in a playground",
    responses: {
      200: {
        description: "Successful reaction response",
      },
      400: {
        description: "Bad request",
      },
    },
  }),
  validator("param", PlaygroundSchema.PatchReaction.Param),
  validator("json", PlaygroundSchema.PatchReaction.Body),
  playgroundController.patchReaction,
);

playgroundRouter.delete(
  "/:playgroundId/reaction/:reactionPlaygroundId",
  describeRoute({
    tags: ["playground"],
    description: "Delete a reaction from a playground",
    responses: {
      200: {
        description: "Successful delete response",
      },
      400: {
        description: "Bad request",
      },
    },
  }),
  validator("param", PlaygroundSchema.DeleteReaction.Param),
  playgroundController.deleteReaction,
);

playgroundRouter.post(
  "/:playgroundId/action/:actionId",
  describeRoute({
    tags: ["playground"],
    description: "Add a action to a playground",
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
  playgroundController.addAction,
);

playgroundRouter.patch(
  "/:playgroundId/action/:actionPlaygroundId",
  describeRoute({
    tags: ["playground"],
    description: "Update an action in a playground",
    responses: {
      200: {
        description: "Successful action response",
      },
      400: {
        description: "Bad request",
      },
    },
  }),
  validator("param", PlaygroundSchema.PatchAction.Param),
  validator("json", PlaygroundSchema.PatchAction.Body),
  playgroundController.patchAction,
);

playgroundRouter.delete(
  "/:playgroundId/action/:actionPlaygroundId",
  describeRoute({
    tags: ["playground"],
    description: "Delete an action from a playground",
    responses: {
      200: {
        description: "Successful delete response",
      },
      400: {
        description: "Bad request",
      },
    },
  }),
  validator("param", PlaygroundSchema.deleteAction.Param),
  playgroundController.deleteAction,
);

playgroundRouter.post(
  "/link/action/:triggerId/reaction/:reactionPlaygroundId",
  describeRoute({
    tags: ["playground"],
    description: "Link an action to a reaction",
    responses: {
      200: {
        description: "Successful link response",
      },
      400: {
        description: "Bad request",
      },
    },
  }),
  validator("param", PlaygroundSchema.LinkAction.Param),
  playgroundController.linkAction,
);

playgroundRouter.delete(
  "/link/action/:linkId",
  describeRoute({
    tags: ["playground"],
    description: "Delete a link",
    responses: {
      200: {
        description: "Successful delete response",
      },
      400: {
        description: "Bad request",
      },
    },
  }),
  validator("param", PlaygroundSchema.DeleteLinkAction.Param),
  playgroundController.deleteLinkAction,
);

playgroundRouter.post(
  "/link/reaction/:triggerId/reaction/:reactionPlaygroundId",
  describeRoute({
    tags: ["playground"],
    description: "Link a reaction to an reaction",
    responses: {
      200: {
        description: "Successful link response",
      },
      400: {
        description: "Bad request",
      },
    },
  }),
  validator("param", PlaygroundSchema.LinkReaction.Param),
  playgroundController.linkReaction,
);

playgroundRouter.delete(
  "/link/reaction/:linkId",
  describeRoute({
    tags: ["playground"],
    description: "Delete a link",
    responses: {
      200: {
        description: "Successful delete response",
      },
      400: {
        description: "Bad request",
      },
    },
  }),
  validator("param", PlaygroundSchema.DeleteLinkReaction.Param),
  playgroundController.deleteLinkReaction,
);

export default playgroundRouter;
