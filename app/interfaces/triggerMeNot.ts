import z from "zod";
import "zod-openapi/extend";

const FetchSettings = z.object({
  url: z.string(),
  method: z.string(),
  headers: z.record(z.string()),
  body: z.string(),
});

export { FetchSettings };
