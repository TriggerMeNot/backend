import { Context } from "@hono";
import { db } from "../db/config.ts";
import { eq } from "drizzle-orm/expressions";
import { playgrounds as playgroundSchema } from "../schemas/playgrounds.ts";
import { actions as actionSchema } from "../schemas/actions.ts";
import { reactionsPlayground as reactionPlaygroundSchema } from "../schemas/reactionsPlayground.ts";
import { actionsPlayground as actionPlaygroundSchema } from "../schemas/actionsPlayground.ts";
import { reactionLinks as reactionLinkSchema } from "../schemas/reactionLinks.ts";
import { actionLinks as actionLinkSchema } from "../schemas/actionLinks.ts";
import actionController from "../actions/actions.ts";

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

  const reactions = await db.select().from(reactionPlaygroundSchema).where(
    eq(reactionPlaygroundSchema.playgroundId, id),
  );

  const actions = await db.select().from(actionPlaygroundSchema).where(
    eq(actionPlaygroundSchema.playgroundId, id),
  );

  return ctx.json({
    ...playgrounds[0],
    reactions,
    actions,
  });
}

async function create(ctx: Context) {
  const userId = ctx.get("jwtPayload").sub;

  const existingPlaygrounds = await db
    .select({ name: playgroundSchema.name })
    .from(playgroundSchema)
    .where(eq(playgroundSchema.userId, userId));

  const baseName = "New Playground";
  let name = baseName;
  let counter = 1;

  const existingNames = existingPlaygrounds.map((p) => p.name);
  while (existingNames.includes(name)) {
    name = `${baseName} (${counter++})`;
  }

  const playground = await db
    .insert(playgroundSchema)
    .values({
      userId,
      name,
    })
    .returning();

  return ctx.json(playground[0], 201);
}

async function addAction(ctx: Context) {
  const { playgroundId: playgroundIdString, actionId: actionIdString } = ctx
    .req.valid("param" as never);

  if (isNaN(parseInt(playgroundIdString))) {
    return ctx.json({ error: "Invalid playground ID" }, 400);
  }
  if (isNaN(parseInt(actionIdString))) {
    return ctx.json({ error: "Invalid action ID" }, 400);
  }

  const playgroundId = parseInt(playgroundIdString);
  const actionId = parseInt(actionIdString);

  const actionsPlayground = await db.insert(actionPlaygroundSchema).values({
    playgroundId,
    actionId,
  }).returning();

  const actions = await db.select().from(actionSchema).where(
    eq(actionSchema.id, actionId),
  ).limit(1);

  const action = actions[0];

  return await actionController.init(
    action.name,
    ctx,
    actionsPlayground[0],
    playgroundId,
  );
}

async function addReaction(ctx: Context) {
  const { playgroundId: playgroundIdString, reactionId: reactionIdString } = ctx
    .req
    .valid("param" as never);
  const { settings } = ctx.req.valid("json" as never);

  if (isNaN(parseInt(playgroundIdString))) {
    return ctx.json({ error: "Invalid playground ID" }, 400);
  }
  if (isNaN(parseInt(reactionIdString))) {
    return ctx.json({ error: "Invalid reaction ID" }, 400);
  }

  const playgroundId = parseInt(playgroundIdString);
  const reactionId = parseInt(reactionIdString);

  await db.insert(reactionPlaygroundSchema).values({
    playgroundId,
    reactionId,
    settings,
  });

  return ctx.json({ success: true }, 201);
}

async function link(ctx: Context) {
  const { triggerType, triggerId, reactionId } = ctx.req.valid("json" as never);

  const reactions = await db.select().from(reactionPlaygroundSchema).where(
    eq(reactionPlaygroundSchema.id, reactionId),
  ).limit(1);

  if (!reactions.length) {
    return ctx.json({ error: "Reaction not found" }, 404);
  }

  const reaction = reactions[0];
  const playgroundId = reaction.playgroundId;

  if (triggerType === "reaction") {
    const triggers = await db.select().from(reactionPlaygroundSchema).where(
      eq(reactionPlaygroundSchema.id, triggerId),
    ).limit(1);

    if (!triggers.length) {
      return ctx.json({ error: "Trigger not found" }, 404);
    }

    const trigger = triggers[0];
    if (trigger.playgroundId !== playgroundId) {
      return ctx.json({
        error: "Trigger and reaction are not in the same playground",
      }, 400);
    }

    await db.insert(reactionLinkSchema).values({
      triggerId,
      reactionId,
    });
  } else {
    const triggers = await db.select().from(actionPlaygroundSchema).where(
      eq(actionPlaygroundSchema.id, triggerId),
    ).limit(1);

    if (!triggers.length) {
      return ctx.json({ error: "Trigger not found" }, 404);
    }

    const trigger = triggers[0];
    if (trigger.playgroundId !== playgroundId) {
      return ctx.json({
        error: "Trigger and reaction are not in the same playground",
      }, 400);
    }

    await db.insert(actionLinkSchema).values({
      triggerId,
      reactionId,
    });
  }

  return ctx.json({ success: true }, 201);
}

export default { list, create, get, addAction, addReaction, link };
