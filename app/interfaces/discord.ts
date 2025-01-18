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

export { OnNewMessageSettings, SendMessageSettings, SendTTSMessageSettings };
