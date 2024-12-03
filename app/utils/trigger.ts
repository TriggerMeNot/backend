// import { Context } from "@hono";
import { db } from "../db/config.ts";
import { eq } from "drizzle-orm/expressions";
import { actions as actionsSchema } from "../schemas/actions.ts";
import { actionsPlayground as actionsPlaygroundSchema } from "../schemas/actionsPlayground.ts";
import { actionLinks as actionLinkSchema } from "../schemas/actionLinks.ts";
import { reactionLinks as reactionLinkSchema } from "../schemas/reactionLinks.ts";
import Action from "../actions/action.ts";
import { type InferSelectModel } from "drizzle-orm";

async function trigger(
  actionPlayground: InferSelectModel<typeof actionsPlaygroundSchema>,
  param: unknown,
) {
  const actions = await db.select().from(actionsSchema)
    .where(
      eq(actionsSchema.id, actionPlayground.actionId),
    ).limit(1);

  if (!actions.length) {
    return;
  }
  const action = actions[0];

  Action.run({
    id: actionPlayground.id,
    name: action.name,
    settings: actionPlayground.settings,
    param: param,
  });
}

async function reactionTrigger(triggerId: number, param: unknown) {
  const triggeredActions = await db.select().from(reactionLinkSchema).where(
    eq(reactionLinkSchema.triggerId, triggerId),
  );

  for (const triggeredAction of triggeredActions) {
    const actionPlaygrounds = await db.select().from(actionsPlaygroundSchema)
      .where(
        eq(actionsPlaygroundSchema.id, triggeredAction.actionId),
      ).limit(1);

    if (!actionPlaygrounds.length) {
      continue;
    }
    const actionPlayground = actionPlaygrounds[0];

    trigger(actionPlayground, param);
  }
}

async function actionTrigger(triggerId: number, param: unknown) {
  const triggeredActions = await db.select().from(actionLinkSchema).where(
    eq(actionLinkSchema.triggerId, triggerId),
  );

  for (const triggeredAction of triggeredActions) {
    const actionPlaygrounds = await db.select().from(actionsPlaygroundSchema)
      .where(
        eq(actionsPlaygroundSchema.id, triggeredAction.actionId),
      ).limit(1);

    if (!actionPlaygrounds.length) {
      continue;
    }
    const actionPlayground = actionPlaygrounds[0];

    trigger(actionPlayground, param);
  }
}

export { actionTrigger, reactionTrigger };
