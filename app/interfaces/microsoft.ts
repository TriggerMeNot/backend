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

const OnNewEmailOutlookSettings = z.object({
  cron: z.string(),
});

const SendEmailOutlookSettings = z.object({
  to: z.string(),
  subject: z.string(),
  body: z.string(),
});

export { OnNewEmailOutlookSettings, SendEmailOutlookSettings };
