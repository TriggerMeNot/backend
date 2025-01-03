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
    Response: z.object({
      id: z.number(),
      email: z.string().email(),
      username: z.string(),
    }),
    ResponseFailure: z.object({
      error: z.string(),
    }),
  },

  PatchUser: {
    Body: z.object({
      username: z.string().optional(),
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
