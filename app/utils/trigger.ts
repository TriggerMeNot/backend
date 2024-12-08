// import { Context } from "@hono";
import { db } from "../db/config.ts";
import { eq } from "drizzle-orm/expressions";
import { reactions as reactionsSchema } from "../schemas/reactions.ts";
import { reactionsPlayground as reactionsPlaygroundSchema } from "../schemas/reactionsPlayground.ts";
import { reactionLinks as reactionLinkSchema } from "../schemas/reactionLinks.ts";
import { actionLinks as actionLinkSchema } from "../schemas/actionLinks.ts";
import Reaction from "../reactions/reaction.ts";
import { type InferSelectModel } from "drizzle-orm";

async function trigger(
  reactionPlayground: InferSelectModel<typeof reactionsPlaygroundSchema>,
  param: unknown,
) {
  const reactions = await db.select().from(reactionsSchema)
    .where(
      eq(reactionsSchema.id, reactionPlayground.reactionId),
    ).limit(1);

  if (!reactions.length) {
    return;
  }
  const reaction = reactions[0];

  Reaction.run({
    id: reactionPlayground.id,
    name: reaction.name,
    settings: reactionPlayground.settings,
    param: param,
  });
}

async function actionTrigger(triggerId: number, param: unknown) {
  const triggeredReactions = await db.select().from(actionLinkSchema).where(
    eq(actionLinkSchema.triggerId, triggerId),
  );

  for (const triggeredReaction of triggeredReactions) {
    const reactionPlaygrounds = await db.select().from(
      reactionsPlaygroundSchema,
    )
      .where(
        eq(reactionsPlaygroundSchema.id, triggeredReaction.reactionId),
      ).limit(1);

    if (!reactionPlaygrounds.length) {
      continue;
    }
    const reactionPlayground = reactionPlaygrounds[0];

    trigger(reactionPlayground, param);
  }
}

async function reactionTrigger(triggerId: number, param: unknown) {
  const triggeredReactions = await db.select().from(reactionLinkSchema).where(
    eq(reactionLinkSchema.triggerId, triggerId),
  );

  for (const triggeredReaction of triggeredReactions) {
    const reactionPlaygrounds = await db.select().from(
      reactionsPlaygroundSchema,
    )
      .where(
        eq(reactionsPlaygroundSchema.id, triggeredReaction.reactionId),
      ).limit(1);

    if (!reactionPlaygrounds.length) {
      continue;
    }
    const reactionPlayground = reactionPlaygrounds[0];

    trigger(reactionPlayground, param);
  }
}

export { actionTrigger, reactionTrigger };
