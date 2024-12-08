import z from "zod";
import "zod-openapi/extend";

export default {
  List: {
    Response: z.object({
      id: z.number(),
      name: z.string(),
      reactions: z.array(z.number()),
      actions: z.array(z.number()),
    }),
  },
  Get: {
    Param: z.object({
      id: z.string(),
    }),
    Response: z.object({
      id: z.number(),
      name: z.string(),
      reactions: z.array(z.number()),
      actions: z.array(z.number()),
    }),
  },
  AddReaction: {
    Body: z.object({
      playgroundId: z.number(),
      reactionId: z.number(),
    }),
  },
  AddAction: {
    Body: z.object({
      playgroundId: z.number(),
      actionId: z.number(),
      settings: z.record(z.any()),
    }),
  },
  Link: {
    Body: z.object({
      triggerType: z.string(),
      triggerId: z.number(),
      actionId: z.number(),
    }),
  },
};
