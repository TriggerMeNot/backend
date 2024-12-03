import z from "zod";
import "zod-openapi/extend";

export default {
  Link: {
    Body: z.object({
      triggerType: z.string(),
      triggerId: z.number(),
      actionId: z.number(),
    }),
  },
};
