import z from "zod";
import "zod-openapi/extend";

export default {
  OnFetch: {
    Param: z.object({
      token: z.string(),
    }),
  },
};
