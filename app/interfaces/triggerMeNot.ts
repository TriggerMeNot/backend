import z from "zod";
import "zod-openapi/extend";

const OnFetchParams = z.object({
  url: z.string(),
});

const FetchSettings = z.object({
  url: z.string(),
  method: z.string(),
  headers: z.record(z.string()).optional(),
  body: z.string().optional(),
});

export { FetchSettings, OnFetchParams };
