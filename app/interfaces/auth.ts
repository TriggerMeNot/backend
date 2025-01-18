import z from "zod";
import "zod-openapi/extend";

export default {
  Login: {
    Body: z.object({
      email: z.string().email(),
      password: z.string(),
    }),
    Response: z.object({
      token: z.string(),
    }),
  },

  Register: {
    Body: z.object({
      email: z.string().email(),
      username: z.string(),
      password: z.string(),
    }),
    Response: z.object({
      token: z.string(),
    }),
  },

  ForgotPassword: {
    Body: z.object({
      email: z.string().email(),
    }),
  },

  ResetPassword: {
    Body: z.object({
      token: z.string(),
      password: z.string(),
    }),
  },
};
