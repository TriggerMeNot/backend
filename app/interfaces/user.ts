import z from "zod";
import "zod-openapi/extend";

export default {
  Self: {
    Response: z.object({
      id: z.number(),
      email: z.string().email(),
      username: z.string(),
    }),
  },
  GetUser: {
    Param: z.object({
      id: z.string(),
    }),
    Response: z.object({
      id: z.number(),
      email: z.string().email(),
      username: z.string(),
    }),
    ResponseFailure: z.object({
      error: z.string(),
    }),
  },
};
