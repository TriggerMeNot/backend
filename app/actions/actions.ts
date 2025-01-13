import { Context } from "@hono";
import { db } from "../db/config.ts";
import { eq } from "drizzle-orm/expressions";
import { actions as actionSchema } from "../schemas/actions.ts";
import { actionsPlayground as actionPlaygroundSchema } from "../schemas/actionsPlayground.ts";
import { IntervalBasedCronScheduler } from "cron-schedule/schedulers/interval-based";
import triggerMeNot from "./triggerMeNot.ts";
import google from "./google.ts";

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
    case "On New Email":
      await google.OnNewEmail(ctx, actionPlayground, playgroundId);
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

import { crons as cronSchema } from "../schemas/crons.ts";

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
    case "On New Email":
      google.cronOnNewEmail(cron.crons);
      break;
  }
}

export default { init };
export { scheduler };
