import { Context } from "@hono";
import { db } from "../db/config.ts";
import { and, eq } from "drizzle-orm/expressions";
import { services as serviceSchema } from "../schemas/services.ts";
import { reactions as reactionSchema } from "../schemas/reactions.ts";
import { reactionTrigger } from "../utils/trigger.ts";

const SERVICE_NAME = "TriggerMeNot";

await db.insert(serviceSchema).values({
  name: SERVICE_NAME,
}).onConflictDoNothing();

const service = (await db.select().from(serviceSchema).where(
  eq(serviceSchema.name, SERVICE_NAME),
).limit(1))[0];

await db.insert(reactionSchema).values({
  serviceId: service.id,
  name: "On Fetch",
  description: "When it fetches",
}).onConflictDoNothing();

async function OnFetch(ctx: Context) {
  // @ts-ignore - The `json` validator is added by the `validator` middleware
  const { reactionId } = ctx.req.valid("json");

  const reaction = await db.select().from(reactionSchema).where(
    and(
      eq(reactionSchema.id, reactionId),
      eq(reactionSchema.serviceId, service.id),
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
