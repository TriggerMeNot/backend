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

const OnNewMessageSettings = z.object({
  channelId: z.string(),
  cron: z.string(),
});

const SendMessageSettings = z.object({
  channelId: z.string(),
  message: z.string(),
});

const SendTTSMessageSettings = z.object({
  channelId: z.string(),
  message: z.string(),
});

const OnNewMentionSettings = z.object({
  channelId: z.string(),
  cron: z.string(),
});

const OnMessageReactionSettings = z.object({
  channelId: z.string(),
  cron: z.string(),
});

const OnUserJoinSettings = z.object({
  channelId: z.string(),
  cron: z.string(),
});

export { OnNewMessageSettings, SendMessageSettings, SendTTSMessageSettings, OnNewMentionSettings, OnMessageReactionSettings, OnUserJoinSettings };
