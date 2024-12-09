import z from "zod";
import "zod-openapi/extend";

export default {
  Patch: {
    Param: z.object({
      id: z.string(),
    }),
    Body: z.object({
      name: z.string(),
    }),
    Response: z.object({
      id: z.number(),
      name: z.string(),
    }),
  },

  Delete: {
    Param: z.object({
      id: z.string(),
    }),
  },

  List: {
    Response: z.object({
      id: z.number(),
      name: z.string(),
      actions: z.array(z.number()),
      reactions: z.array(z.number()),
    }),
  },

  Get: {
    Param: z.object({
      id: z.string(),
    }),
    Response: z.object({
      id: z.number(),
      name: z.string(),
      actions: z.array(z.number()),
      reactions: z.array(z.number()),
    }),
  },

  AddAction: {
    Param: z.object({
      playgroundId: z.string(),
      actionId: z.string(),
    }),
  },

  deleteAction: {
    Param: z.object({
      playgroundId: z.string(),
      actionId: z.string(),
    }),
  },

  AddReaction: {
    Param: z.object({
      playgroundId: z.string(),
      reactionId: z.string(),
    }),
    Body: z.object({
      settings: z.record(z.any()),
    }),
  },

  deleteReaction: {
    Param: z.object({
      playgroundId: z.string(),
      reactionId: z.string(),
    }),
  },

  LinkAction: {
    Param: z.object({
      triggerId: z.string(),
      reactionId: z.string(),
    }),
  },

  LinkReaction: {
    Param: z.object({
      triggerId: z.string(),
      actionId: z.string(),
    }),
  },
};
