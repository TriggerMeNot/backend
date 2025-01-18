import { Context } from "@hono";
import { db } from "../db/config.ts";
import { eq } from "drizzle-orm/expressions";
import { actions as actionSchema } from "../schemas/actions.ts";
import { actionsPlayground as actionPlaygroundSchema } from "../schemas/actionsPlayground.ts";
import { IntervalBasedCronScheduler } from "cron-schedule/schedulers/interval-based";
import { crons as cronSchema } from "../schemas/crons.ts";
import triggerMeNot from "./triggerMeNot.ts";
import google from "./google.ts";
import discord from "./discord.ts";
import microsoft from "./microsoft.ts";
import defaultActions from "./default.ts";

async function init(
  ctx: Context,
  action: typeof actionSchema.$inferSelect,
  actionPlayground: typeof actionPlaygroundSchema.$inferSelect,
  playgroundId: number,
) {
  switch (action.name) {
    case "On Fetch":
      await triggerMeNot.OnFetch(ctx, actionPlayground, playgroundId);
      break;
    case "On New Email (Gmail)":
      await google.OnNewEmail(ctx, actionPlayground, playgroundId);
      break;
    case "On New Email (Outlook)":
      await microsoft.OnNewEmail(ctx, actionPlayground, playgroundId);
      break;
    case "On New Message":
      await discord.OnNewMessage(ctx, actionPlayground, playgroundId);
      break;
    case "At Time":
      await defaultActions.AtTime(ctx, actionPlayground, playgroundId);
      break;
  }

  const actionPlaygrounds = await db.select().from(actionPlaygroundSchema)
    .where(
      eq(actionPlaygroundSchema.id, actionPlayground.id),
    );

  if (!actionPlaygrounds.length) {
    return ctx.json({ error: "Action not found" }, 404);
  }

  return ctx.json(actionPlaygrounds[0], 201);
}

const scheduler = new IntervalBasedCronScheduler(60 * 1000);

for (
  const cron of await db.select().from(cronSchema).innerJoin(
    actionPlaygroundSchema,
    eq(actionPlaygroundSchema.id, cronSchema.actionPlaygroundId),
  ).innerJoin(
    actionSchema,
    eq(actionSchema.id, actionPlaygroundSchema.actionId),
  )
) {
  switch (cron.actions.name) {
    case "On New Email (Gmail)":
      google.cronOnNewEmail(cron.crons);
      break;
    case "On New Email (Outlook)":
      microsoft.cronOnNewEmail(cron.crons);
      break;
    case "On New Message":
      discord.cronOnNewMessage(cron.crons);
      break;
    case "At Time":
      defaultActions.cronAtTime(cron.crons);
      break;
  }
}

export default { init };
export { scheduler };
