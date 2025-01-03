import { Context } from "@hono";
import { db } from "../db/config.ts";
import { and, eq } from "drizzle-orm/expressions";
import { playgrounds as playgroundSchema } from "../schemas/playgrounds.ts";
import { actions as actionSchema } from "../schemas/actions.ts";
import { reactionsPlayground as reactionPlaygroundSchema } from "../schemas/reactionsPlayground.ts";
import { actionsPlayground as actionPlaygroundSchema } from "../schemas/actionsPlayground.ts";
import { reactionLinks as reactionLinkSchema } from "../schemas/reactionLinks.ts";
import { actionLinks as actionLinkSchema } from "../schemas/actionLinks.ts";
import actionController from "../actions/actions.ts";
import { actionTrigger } from "../utils/trigger.ts";

async function list(ctx: Context) {
  const userId = ctx.get("jwtPayload").sub;

  const playgrounds = await db.select().from(playgroundSchema).where(
    eq(playgroundSchema.userId, userId),
  );

  return ctx.json(playgrounds);
}

async function get(ctx: Context) {
  const { id: idString } = ctx.req.param();

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

  const actions = await db.select().from(actionPlaygroundSchema).where(
    eq(actionPlaygroundSchema.playgroundId, id),
  );

  const reactions = await db.select().from(reactionPlaygroundSchema).where(
    eq(reactionPlaygroundSchema.playgroundId, id),
  );

  const linksActions = [];
  for (const action of actions) {
    const linkedActions = await db.select().from(actionLinkSchema).where(
      eq(actionLinkSchema.triggerId, action.id),
    );
    linksActions.push(...linkedActions);
  }

  const linksReactions = [];
  for (const reaction of reactions) {
    const linkedReactions = await db.select().from(reactionLinkSchema).where(
      eq(reactionLinkSchema.triggerId, reaction.id),
    );
    linksReactions.push(...linkedReactions);
  }

  return ctx.json({
    ...playgrounds[0],
    actions,
    reactions,
    linksActions,
    linksReactions,
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

async function patch(ctx: Context) {
  const { id: idString } = ctx.req.param();
  const { name } = ctx.req.valid("json" as never);

  if (isNaN(parseInt(idString))) {
    return ctx.json({ error: "Invalid playground ID" }, 400);
  }

  const id = parseInt(idString);

  const playgrounds = await db.update(playgroundSchema).set({
    name,
  }).where(
    eq(playgroundSchema.id, id),
  ).returning();

  if (!playgrounds.length) {
    return ctx.json({ error: "Playground not found" }, 404);
  }

  return ctx.json(playgrounds[0]);
}

async function deletePlayground(ctx: Context) {
  const { id: idString } = ctx.req.param();

  if (isNaN(parseInt(idString))) {
    return ctx.json({ error: "Invalid playground ID" }, 400);
  }

  const id = parseInt(idString);

  const deleted = await db.delete(playgroundSchema).where(
    eq(playgroundSchema.id, id),
  );

  if (deleted.rowCount === 0) {
    return ctx.json({ error: "Playground not found" }, 404);
  }

  return ctx.json({ success: true });
}

async function addAction(ctx: Context) {
  const {
    playgroundId: playgroundIdString,
    actionId: actionIdString,
  } = ctx.req.param();
  const { x, y } = ctx.req.valid("json" as never);

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
    x,
    y,
  }).returning();

  const actions = await db.select().from(actionSchema).where(
    eq(actionSchema.id, actionId),
  ).limit(1);

  return await actionController.init(
    ctx,
    actions[0],
    actionsPlayground[0],
    playgroundId,
  );
}

async function patchAction(ctx: Context) {
  const {
    playgroundId: playgroundIdString,
    actionPlaygroundId: actionPlaygroundIdString,
  } = ctx.req.param();
  const { x, y } = ctx.req.valid("json" as never);

  if (isNaN(parseInt(playgroundIdString))) {
    return ctx.json({ error: "Invalid playground ID" }, 400);
  }
  if (isNaN(parseInt(actionPlaygroundIdString))) {
    return ctx.json({ error: "Invalid action ID" }, 400);
  }

  const playgroundId = parseInt(playgroundIdString);
  const actionId = parseInt(actionPlaygroundIdString);

  const actions = await db.update(actionPlaygroundSchema).set({
    x,
    y,
  }).where(
    and(
      eq(actionPlaygroundSchema.id, actionId),
      eq(actionPlaygroundSchema.playgroundId, playgroundId),
    ),
  ).returning();

  if (!actions.length) {
    return ctx.json({ error: "Action not found" }, 404);
  }

  return ctx.json(actions[0]);
}

async function deleteAction(ctx: Context) {
  const {
    playgroundId: playgroundIdString,
    actionPlaygroundId: actionPlaygroundIdString,
  } = ctx.req.param();

  if (isNaN(parseInt(playgroundIdString))) {
    return ctx.json({ error: "Invalid playground ID" }, 400);
  }
  if (isNaN(parseInt(actionPlaygroundIdString))) {
    return ctx.json({ error: "Invalid action ID" }, 400);
  }

  const playgroundId = parseInt(playgroundIdString);
  const actionId = parseInt(actionPlaygroundIdString);

  const deleted = await db.delete(actionPlaygroundSchema).where(
    and(
      eq(actionPlaygroundSchema.id, actionId),
      eq(actionPlaygroundSchema.playgroundId, playgroundId),
    ),
  );

  if (deleted.rowCount === 0) {
    return ctx.json({ error: "Action not found" }, 404);
  }

  return ctx.json({ success: true });
}

async function runAction(ctx: Context) {
  const {
    playgroundId: playgroundIdString,
    actionPlaygroundId: actionPlaygroundIdString,
  } = ctx.req.param();
  const {
    params,
  } = ctx.req.valid("json" as never);

  if (isNaN(parseInt(playgroundIdString))) {
    return ctx.json({ error: "Invalid playground ID" }, 400);
  }
  if (isNaN(parseInt(actionPlaygroundIdString))) {
    return ctx.json({ error: "Invalid action ID" }, 400);
  }

  const playgroundId = parseInt(playgroundIdString);
  const actionId = parseInt(actionPlaygroundIdString);

  const actions = await db.select().from(actionPlaygroundSchema).where(
    and(
      eq(actionPlaygroundSchema.id, actionId),
      eq(actionPlaygroundSchema.playgroundId, playgroundId),
    ),
  ).limit(1);

  if (!actions.length) {
    return ctx.json({ error: "Action not found" }, 404);
  }

  const action = actions[0];

  actionTrigger(action.id, params);
  return ctx.json({ success: true });
}

async function addReaction(ctx: Context) {
  const { playgroundId: playgroundIdString, reactionId: reactionIdString } = ctx
    .req.param();
  const { settings, x, y } = ctx.req.valid("json" as never);

  if (isNaN(parseInt(playgroundIdString))) {
    return ctx.json({ error: "Invalid playground ID" }, 400);
  }
  if (isNaN(parseInt(reactionIdString))) {
    return ctx.json({ error: "Invalid reaction ID" }, 400);
  }

  const playgroundId = parseInt(playgroundIdString);
  const reactionId = parseInt(reactionIdString);

  const reactions = await db.insert(reactionPlaygroundSchema).values({
    playgroundId,
    reactionId,
    settings,
    x,
    y,
  }).returning();

  return ctx.json(reactions[0], 201);
}

async function patchReaction(ctx: Context) {
  const {
    playgroundId: playgroundIdString,
    reactionPlaygroundId: reactionPlaygroundIdString,
  } = ctx.req.param();
  const { settings, x, y } = ctx.req.valid("json" as never);

  if (isNaN(parseInt(playgroundIdString))) {
    return ctx.json({ error: "Invalid playground ID" }, 400);
  }
  if (isNaN(parseInt(reactionPlaygroundIdString))) {
    return ctx.json({ error: "Invalid reaction ID" }, 400);
  }

  const playgroundId = parseInt(playgroundIdString);
  const reactionId = parseInt(reactionPlaygroundIdString);

  const reactions = await db.update(reactionPlaygroundSchema).set({
    settings,
    x,
    y,
  }).where(
    and(
      eq(reactionPlaygroundSchema.id, reactionId),
      eq(reactionPlaygroundSchema.playgroundId, playgroundId),
    ),
  ).returning();

  if (!reactions.length) {
    return ctx.json({ error: "Reaction not found" }, 404);
  }

  return ctx.json(reactions[0]);
}

async function deleteReaction(ctx: Context) {
  const {
    playgroundId: playgroundIdString,
    reactionPlaygroundId: reactionPlaygroundIdString,
  } = ctx.req.param();

  if (isNaN(parseInt(playgroundIdString))) {
    return ctx.json({ error: "Invalid playground ID" }, 400);
  }
  if (isNaN(parseInt(reactionPlaygroundIdString))) {
    return ctx.json({ error: "Invalid reaction ID" }, 400);
  }

  const playgroundId = parseInt(playgroundIdString);
  const reactionId = parseInt(reactionPlaygroundIdString);

  const deleted = await db.delete(reactionPlaygroundSchema).where(
    and(
      eq(reactionPlaygroundSchema.id, reactionId),
      eq(reactionPlaygroundSchema.playgroundId, playgroundId),
    ),
  );

  if (deleted.rowCount === 0) {
    return ctx.json({ error: "Reaction not found" }, 404);
  }

  return ctx.json({ success: true });
}

async function linkReaction(ctx: Context) {
  const {
    triggerId: triggerIdString,
    reactionPlaygroundId: reactionPlaygroundIdString,
  } = ctx.req.param();

  if (isNaN(parseInt(triggerIdString))) {
    return ctx.json({ error: "Invalid trigger ID" }, 400);
  }

  if (isNaN(parseInt(reactionPlaygroundIdString))) {
    return ctx.json({ error: "Invalid reaction ID" }, 400);
  }

  const triggerId = parseInt(triggerIdString);
  const reactionPlaygroundId = parseInt(reactionPlaygroundIdString);

  const reactions = await db.select().from(reactionPlaygroundSchema)
    .where(eq(reactionPlaygroundSchema.id, triggerId))
    .limit(1);

  if (!reactions.length) {
    return ctx.json({ error: "Trigger not found" }, 404);
  }

  const trigger = reactions[0];

  const targetReactions = await db.select().from(reactionPlaygroundSchema)
    .where(eq(reactionPlaygroundSchema.id, reactionPlaygroundId))
    .limit(1);

  if (!targetReactions.length) {
    return ctx.json({ error: "Reaction not found" }, 404);
  }

  const targetReaction = targetReactions[0];

  if (trigger.playgroundId !== targetReaction.playgroundId) {
    return ctx.json({
      error: "Trigger and reaction are not in the same playground",
    }, 400);
  }

  await db.insert(reactionLinkSchema).values({
    triggerId,
    reactionId: reactionPlaygroundId,
  });

  return ctx.json({ success: true }, 201);
}

async function deleteLinkReaction(ctx: Context) {
  const { linkId: linkIdString } = ctx.req.param();

  if (isNaN(parseInt(linkIdString))) {
    return ctx.json({ error: "Invalid link ID" }, 400);
  }

  const linkId = parseInt(linkIdString);

  const deleted = await db.delete(reactionLinkSchema).where(
    eq(reactionLinkSchema.id, linkId),
  );

  if (deleted.rowCount === 0) {
    return ctx.json({ error: "Link not found" }, 404);
  }

  return ctx.json({ success: true });
}

async function linkAction(ctx: Context) {
  const {
    triggerId: triggerIdString,
    reactionPlaygroundId: reactionPlaygroundIdString,
  } = ctx.req.param();

  if (isNaN(parseInt(triggerIdString))) {
    return ctx.json({ error: "Invalid trigger ID" }, 400);
  }

  if (isNaN(parseInt(reactionPlaygroundIdString))) {
    return ctx.json({ error: "Invalid reaction ID" }, 400);
  }

  const triggerId = parseInt(triggerIdString);
  const reactionPlaygroundId = parseInt(reactionPlaygroundIdString);

  const actions = await db.select().from(actionPlaygroundSchema)
    .where(eq(actionPlaygroundSchema.id, triggerId))
    .limit(1);

  if (!actions.length) {
    return ctx.json({ error: "Trigger not found" }, 404);
  }

  const trigger = actions[0];

  const targetReactions = await db.select().from(reactionPlaygroundSchema)
    .where(eq(reactionPlaygroundSchema.id, reactionPlaygroundId))
    .limit(1);

  if (!targetReactions.length) {
    return ctx.json({ error: "Reaction not found" }, 404);
  }

  const targetReaction = targetReactions[0];

  if (trigger.playgroundId !== targetReaction.playgroundId) {
    return ctx.json({
      error: "Trigger and reaction are not in the same playground",
    }, 400);
  }

  await db.insert(actionLinkSchema).values({
    triggerId,
    reactionId: reactionPlaygroundId,
  });

  return ctx.json({ success: true }, 201);
}

async function deleteLinkAction(ctx: Context) {
  const { linkId: linkIdString } = ctx.req.param();

  if (isNaN(parseInt(linkIdString))) {
    return ctx.json({ error: "Invalid link ID" }, 400);
  }

  const linkId = parseInt(linkIdString);

  const deleted = await db.delete(actionLinkSchema).where(
    eq(actionLinkSchema.id, linkId),
  );

  if (deleted.rowCount === 0) {
    return ctx.json({ error: "Link not found" }, 404);
  }

  return ctx.json({ success: true });
}

export default {
  list,
  create,
  get,
  addAction,
  addReaction,
  linkReaction,
  linkAction,
  deleteAction,
  deleteReaction,
  patch,
  deletePlayground,
  deleteLinkAction,
  deleteLinkReaction,
  patchReaction,
  patchAction,
  runAction,
};
