import z from "zod";
import "zod-openapi/extend";

export default {
  OnFetch: {
    Body: z.object({
      actionId: z.number(),
    }),
  },
};
