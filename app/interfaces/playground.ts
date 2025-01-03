import z from "zod";
import "zod-openapi/extend";

export default {
  Patch: {
    Body: z.object({
      name: z.string().optional(),
    }),
    Response: z.object({
      id: z.number(),
      name: z.string(),
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
    Response: z.object({
      id: z.number(),
      name: z.string(),
      actions: z.array(z.object({})),
      reactions: z.array(z.object({})),
      linksActions: z.array(z.object({})),
      linksReactions: z.array(z.object({})),
    }),
  },

  AddAction: {
    Body: z.object({
      x: z.number(),
      y: z.number(),
    }),
  },

  PatchAction: {
    Body: z.object({
      x: z.number().optional(),
      y: z.number().optional(),
    }),
  },

  RunAction: {
    Body: z.object({
      params: z.record(z.any()),
    }),
  },

  AddReaction: {
    Body: z.object({
      settings: z.record(z.any()),
      x: z.number(),
      y: z.number(),
    }),
  },

  PatchReaction: {
    Body: z.object({
      settings: z.record(z.any()),
      x: z.number().optional(),
      y: z.number().optional(),
    }),
  },
};
