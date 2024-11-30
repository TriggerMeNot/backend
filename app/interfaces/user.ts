import z from "zod";
import "zod-openapi/extend";

export default {
  Root: {
    Response: z.object({
      id: z.number(),
      email: z.string().email(),
      username: z.string(),
    }),
  },
};
