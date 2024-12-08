import z from "zod";
import "zod-openapi/extend";

export default {
  About: {
    Response: z.object({
      client: z.object({
        host: z.string(),
      }),
      server: z.object({
        current_time: z.number().int(),
        services: z.array(
          z.object({
            name: z.string(),
            actions: z.array(
              z.object({
                id: z.number().int(),
                name: z.string(),
                description: z.string(),
              }),
            ),
            reactions: z.array(
              z.object({
                id: z.number().int(),
                name: z.string(),
                description: z.string(),
              }),
            ),
          }),
        ),
      }),
    }),
  },
};
