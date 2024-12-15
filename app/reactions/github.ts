import ReactionTrigger from "../types/ReactionTrigger.ts";
import { db } from "../db/config.ts";
import { and, eq } from "drizzle-orm/expressions";
import { SERVICES } from "../db/seed.ts";
import { oauths as oauthSchema } from "../schemas/oauths.ts";

interface GitHubIssueSettings {
  owner: string;
  repo: string;
  title: string;
  body: string;
}

async function createIssue(reaction: ReactionTrigger) {
  const settings = reaction.settings as GitHubIssueSettings;

  const oauths = await db.select().from(oauthSchema).where(
    and(
      eq(oauthSchema.serviceId, SERVICES.GitHub.id!),
      eq(oauthSchema.userId, reaction.userId),
    ),
  ).limit(1);

  if (!oauths.length) {
    throw new Error("GitHub OAuth not found");
  }
  const oauth = oauths[0];

  const fetchOptions: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `token ${oauth.token}`,
    },
    body: JSON.stringify({
      title: settings.title,
      body: settings.body,
    }),
  };

  const url =
    `https://api.github.com/repos/${settings.owner}/${settings.repo}/issues`;
  const response = await fetch(url, fetchOptions);

  const json = await response.json();
  return json;
}

export default {
  createIssue,
};
