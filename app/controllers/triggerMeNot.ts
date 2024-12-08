import { Context } from "@hono";
import { db } from "../db/config.ts";
import { and, eq } from "drizzle-orm/expressions";
import { actions as actionSchema } from "../schemas/actions.ts";
import { actionTrigger } from "../utils/trigger.ts";
import { SERVICES } from "../db/seed.ts";

const SERVICE_NAME = "TriggerMeNot";

async function OnFetch(ctx: Context) {
  // @ts-ignore - The `json` validator is added by the `validator` middleware
  const { actionId } = ctx.req.valid("json");

  const action = await db.select().from(actionSchema).where(
    and(
      eq(actionSchema.id, actionId),
      eq(actionSchema.serviceId, SERVICES[SERVICE_NAME].id!),
    ),
  ).limit(1);

  if (!action.length) {
    return ctx.json({ error: "Action not found" }, 404);
  }

  actionTrigger(actionId, {});
  return ctx.json({ success: true });
}

export default {
  OnFetch,
};
