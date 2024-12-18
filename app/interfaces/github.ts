import z from "zod";
import "zod-openapi/extend";

export default {
  Root: {
    Body: z.object({
      code: z.string(),
    }),
  },
};

const GithubIssueSettings = z.object({
  owner: z.string(),
  repo: z.string(),
  title: z.string(),
  body: z.string(),
});

export { GithubIssueSettings };
