import z from 'zod';
import 'zod-openapi/extend';

export default {
  Connection: {
    Body:  z.object({
          token: z.string()
        }),
        Response: z.object({
            onMessage: z.string(),
            onClose: z.string(),
            onError: z.string(),
        }),
    }
};
