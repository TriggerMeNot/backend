import { Context } from "@hono";
import { db } from "../db/config.ts";
import { and, eq } from "drizzle-orm/expressions";
import { reactions as reactionSchema } from "../schemas/reactions.ts";
import { reactionTrigger } from "../utils/trigger.ts";
import { SERVICES } from "../db/seed.ts";

const SERVICE_NAME = "TriggerMeNot";

async function OnFetch(ctx: Context) {
  // @ts-ignore - The `json` validator is added by the `validator` middleware
  const { reactionId } = ctx.req.valid("json");

  const reaction = await db.select().from(reactionSchema).where(
    and(
      eq(reactionSchema.id, reactionId),
      eq(reactionSchema.serviceId, SERVICES[SERVICE_NAME].id!),
    ),
  ).limit(1);

  if (!reaction.length) {
    return ctx.json({ error: "Reaction not found" }, 404);
  }

  reactionTrigger(reactionId, {});
  return ctx.json({ success: true });
}

export default {
  OnFetch,
};
