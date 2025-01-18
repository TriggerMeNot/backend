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

const OnNewEmailGmailSettings = z.object({
  cron: z.string(),
});

const SendEmailGmailSettings = z.object({
  to: z.string(),
  subject: z.string(),
  body: z.string(),
});

const OnEmailFromUserSettings = z.object({
  cron: z.string(),
  email: z.string(),
});

const OnEmailWithTitleSettings = z.object({
  cron: z.string(),
  subject: z.string(),
});

export { OnNewEmailGmailSettings, SendEmailGmailSettings, OnEmailFromUserSettings, OnEmailWithTitleSettings };
