import z from "zod";
import "zod-openapi/extend";

export default {
  Github: {
    Body: z.object({
      token: z.string(),
      refreshToken: z.string(),
    }),
  },
};
