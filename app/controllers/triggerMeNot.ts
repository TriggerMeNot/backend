import { Context } from "@hono";
import { db } from "../db/config.ts";
import { and, eq } from "drizzle-orm/expressions";
import { actions as actionSchema } from "../schemas/actions.ts";
import { actionsPlayground as actionPlaygroundSchema } from "../schemas/actionsPlayground.ts";
import { actionTrigger } from "../utils/trigger.ts";
import { SERVICES } from "../db/seed.ts";

const SERVICE_NAME = "TriggerMeNot";

function base64Decode(token: string) {
  // Decode the base64 token
  const decoded = atob(token);

  // Split the token into the two padded numbers
  const paddedNum1 = decoded.slice(0, 10);
  const paddedNum2 = decoded.slice(10);

  // Parse the padded numbers
  const actionId = parseInt(paddedNum1, 10);
  const playgroundId = parseInt(paddedNum2, 10);

  return { actionId, playgroundId };
}

async function OnFetch(ctx: Context) {
  const { token } = ctx.req.valid("param" as never);
  const { actionId, playgroundId } = base64Decode(token);

  const actions = await db.select().from(actionSchema).where(
    and(
      eq(actionSchema.id, actionId),
      eq(actionSchema.serviceId, SERVICES[SERVICE_NAME].id!),
    ),
  ).limit(1);

  if (!actions.length) {
    return ctx.json({ error: "Action not found" }, 404);
  }

  const actionsPlayground = await db.select().from(actionPlaygroundSchema)
    .where(
      and(
        eq(actionPlaygroundSchema.actionId, actionId),
        eq(actionPlaygroundSchema.playgroundId, playgroundId),
      ),
    ).limit(1);

  if (!actionsPlayground.length) {
    return ctx.json({ error: "Action not found in playground" }, 404);
  }

  actionTrigger(actionId, {});
  return ctx.json({ success: true });
}

export default {
  OnFetch,
};
