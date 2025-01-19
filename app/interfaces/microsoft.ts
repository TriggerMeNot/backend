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

const OnNewEmailUserOutlookSettings = z.object({
  cron: z.string(),
  user: z.string(),
});

const OnNewEmailTitleOutlookSettings = z.object({
  cron: z.string(),
  title: z.string(),
});

export { OnNewEmailOutlookSettings, SendEmailOutlookSettings, OnNewEmailUserOutlookSettings, OnNewEmailTitleOutlookSettings };