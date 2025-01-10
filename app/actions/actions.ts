import { Context } from "@hono";
import { db } from "../db/config.ts";
import { eq } from "drizzle-orm/expressions";
import { actions as actionSchema } from "../schemas/actions.ts";
import { actionsPlayground as actionPlaygroundSchema } from "../schemas/actionsPlayground.ts";
import triggerMeNot from "./triggerMeNot.ts";

async function init(
  ctx: Context,
  action: typeof actionSchema.$inferSelect,
  actionPlayground: typeof actionPlaygroundSchema.$inferSelect,
  playgroundId: number,
) {
  switch (action.name) {
    case "On Fetch":
      await triggerMeNot.OnFetch(ctx, actionPlayground, playgroundId);
      break;
  }

  const actionPlaygrounds = await db.select().from(actionPlaygroundSchema)
    .where(
      eq(actionPlaygroundSchema.id, actionPlayground.id),
    );

  if (!actionPlaygrounds.length) {
    return ctx.json({ error: "Action not found" }, 404);
  }

  return ctx.json(actionPlaygrounds[0], 201);
}

export default { init };
