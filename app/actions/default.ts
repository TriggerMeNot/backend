import { Context } from "@hono";
import { db } from "../db/config.ts";
import { actionsPlayground as actionPlaygroundSchema } from "../schemas/actionsPlayground.ts";
import { crons as cronSchema } from "../schemas/crons.ts";
import { scheduler } from "./actions.ts";
import { parseCronExpression } from "cron-schedule";
import { actionTrigger } from "../utils/trigger.ts";

async function AtTime(
  _ctx: Context,
  actionPlayground: typeof actionPlaygroundSchema.$inferSelect,
  _playgroundId: number,
) {
  const cron = await db.insert(cronSchema).values({
    actionPlaygroundId: actionPlayground.id,
    cron: (actionPlayground.settings as { cron: string }).cron,
  }).returning();

  cronAtTime(cron[0]);
}

function cronAtTime(
  cron: typeof cronSchema.$inferSelect,
) {
  function task() {
    actionTrigger(cron.actionPlaygroundId, {});
  }

  scheduler.registerTask(parseCronExpression(cron.cron), task);
}

export default { AtTime, cronAtTime };
