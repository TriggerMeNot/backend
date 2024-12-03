import { Context } from "@hono";
import { db } from "../db/config.ts";
import { eq } from "drizzle-orm/expressions";
import { actionsPlayground as actionsPlaygroundSchema } from "../schemas/actionsPlayground.ts";
import { reactionsPlayground as reactionsPlaygroundSchema } from "../schemas/reactionsPlayground.ts";
import { actionLinks as actionLinkSchema } from "../schemas/actionLinks.ts";
import { reactionLinks as reactionLinkSchema } from "../schemas/reactionLinks.ts";

async function link(ctx: Context) {
  // @ts-ignore - The `json` validator is added by the `validator` middleware
  const { triggerType, triggerId, actionId } = ctx.req.valid("json");

  const actions = await db.select().from(actionsPlaygroundSchema).where(
    eq(actionsPlaygroundSchema.id, actionId),
  ).limit(1);

  if (!actions.length) {
    return ctx.json({ error: "Action not found" }, 404);
  }

  const action = actions[0];
  const playgroundId = action.playgroundId;

  if (triggerType === "action") {
    const triggers = await db.select().from(actionsPlaygroundSchema).where(
      eq(actionsPlaygroundSchema.id, triggerId),
    ).limit(1);

    if (!triggers.length) {
      return ctx.json({ error: "Trigger not found" }, 404);
    }

    const trigger = triggers[0];
    if (trigger.playgroundId !== playgroundId) {
      return ctx.json({
        error: "Trigger and action are not in the same playground",
      }, 400);
    }

    await db.insert(actionLinkSchema).values({
      triggerId,
      actionId,
    });
  } else {
    const triggers = await db.select().from(reactionsPlaygroundSchema).where(
      eq(reactionsPlaygroundSchema.id, triggerId),
    ).limit(1);

    if (!triggers.length) {
      return ctx.json({ error: "Trigger not found" }, 404);
    }

    const trigger = triggers[0];
    if (trigger.playgroundId !== playgroundId) {
      return ctx.json({
        error: "Trigger and action are not in the same playground",
      }, 400);
    }

    await db.insert(reactionLinkSchema).values({
      triggerId,
      actionId,
    });
  }

  return ctx.json({ success: true }, 201);
}

export default { link };
