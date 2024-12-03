import z from "zod";
import "zod-openapi/extend";

export default {
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
