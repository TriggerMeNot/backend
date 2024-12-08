import { Context } from "@hono";
import { db } from "../db/config.ts";
import { eq } from "drizzle-orm/expressions";
import { playgrounds as playgroundSchema } from "../schemas/playgrounds.ts";
import { actionsPlayground as actionsPlaygroundSchema } from "../schemas/actionsPlayground.ts";
import { reactionsPlayground as reactionsPlaygroundSchema } from "../schemas/reactionsPlayground.ts";
import { actionLinks as actionLinkSchema } from "../schemas/actionLinks.ts";
import { reactionLinks as reactionLinkSchema } from "../schemas/reactionLinks.ts";

async function list(ctx: Context) {
  const userId = ctx.get("jwtPayload").sub;

  const playgrounds = await db.select().from(playgroundSchema).where(
    eq(playgroundSchema.userId, userId),
  );

  return ctx.json(playgrounds);
}

async function get(ctx: Context) {
  const { id: idString } = ctx.req.valid("param" as never);

  if (isNaN(parseInt(idString))) {
    return ctx.json({ error: "Invalid playground ID" }, 400);
  }

  const id = parseInt(idString);
  const playgrounds = await db.select().from(playgroundSchema).where(
    eq(playgroundSchema.id, id),
  ).limit(1);

  if (!playgrounds.length) {
    return ctx.json({ error: "Playground not found" }, 404);
  }

  const actions = await db.select().from(actionsPlaygroundSchema).where(
    eq(actionsPlaygroundSchema.playgroundId, id),
  );

  const reactions = await db.select().from(reactionsPlaygroundSchema).where(
    eq(reactionsPlaygroundSchema.playgroundId, id),
  );

  return ctx.json({
    ...playgrounds[0],
    actions,
    reactions,
  });
}

async function create(ctx: Context) {
  // @ts-ignore - The `json` validator is added by the `validator` middleware
  const { name } = ctx.req.valid("json");

  const userId = ctx.get("jwtPayload").sub;

  const playground = await db.insert(playgroundSchema).values({
    userId,
    name,
  }).returning();

  return ctx.json(playground[0], 201);
}

async function addReaction(ctx: Context) {
  // @ts-ignore - The `json` validator is added by the `validator` middleware
  const { playgroundId, reactionId } = ctx.req.valid("json");

  await db.insert(reactionsPlaygroundSchema).values({
    playgroundId,
    reactionId,
  });

  return ctx.json({ success: true }, 201);
}

async function addAction(ctx: Context) {
  // @ts-ignore - The `json` validator is added by the `validator` middleware
  const { playgroundId, actionId, settings } = ctx.req.valid("json");

  await db.insert(actionsPlaygroundSchema).values({
    playgroundId,
    actionId,
    settings,
  });

  return ctx.json({ success: true }, 201);
}

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

export default { list, create, get, addReaction, addAction, link };
