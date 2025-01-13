import z from "zod";
import "zod-openapi/extend";

export default {
  Authenticate: {
    Body: z.object({
      code: z.string(),
    }),
  },

  Authorize: {
    Body: z.object({
      code: z.string(),
    }),
  },
};

const OnNewEmailSettings = z.object({
  cron: z.string(),
});

const SendEmailSettings = z.object({
  to: z.string(),
  subject: z.string(),
  body: z.string(),
});

export { OnNewEmailSettings, SendEmailSettings };
