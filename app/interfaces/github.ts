import z from "zod";
import "zod-openapi/extend";

export default {
  Github: {
    Query: z.object({
      code: z.string(),
      state: z.string(),
    }),
    Response: z.object({
      token: z.string(),
      refreshToken: z.string(),
      user: z.object({}),
    }),
  },
};
