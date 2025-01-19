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

const OnNewMessageGroupSettings = z.object({
  cron: z.string(),
  groupId: z.string(),
});

const OnNewMessageHashtagSettings = z.object({
  cron: z.string(),
  hashtag: z.string(),
});

const OnNewPrivateMessageSettings = z.object({
  cron: z.string(),
});

const OnMessageLikeSettings = z.object({
  cron: z.string(),
});

export { OnNewEmailGmailSettings, SendEmailGmailSettings, OnEmailFromUserSettings, OnEmailWithTitleSettings, OnNewMessageGroupSettings, OnNewMessageHashtagSettings, OnNewPrivateMessageSettings, OnMessageLikeSettings };
