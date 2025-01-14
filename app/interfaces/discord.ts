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
  channel_id: z.string(),
  cron: z.string(),
});

export { OnNewMessageSettings };
