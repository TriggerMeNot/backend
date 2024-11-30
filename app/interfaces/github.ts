import z from "zod";
import "zod-openapi/extend";

export default {
  Root: {
    Body: z.object({
      code: z.string(),
    }),
  },
};
