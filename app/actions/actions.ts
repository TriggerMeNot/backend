import { Context } from "@hono";
import { db } from "../db/config.ts";
import { eq } from "drizzle-orm/expressions";
import { actionsPlayground as actionPlaygroundSchema } from "../schemas/actionsPlayground.ts";
import triggerMeNot from "./triggerMeNot.ts";

async function init(
  name: string,
  ctx: Context,
  actionPlayground: typeof actionPlaygroundSchema.$inferSelect,
  playgroundId: number,
) {
  switch (name) {
    case "On Fetch":
      await triggerMeNot.OnFetch(ctx, actionPlayground, playgroundId);
      break;
    default:
      return ctx.json({ error: "Action not found" }, 404);
  }

  const actions = await db.select().from(actionPlaygroundSchema).where(
    eq(actionPlaygroundSchema.id, actionPlayground.id),
  );

  if (!actions.length) {
    return ctx.json({ error: "Action not found" }, 404);
  }

  return ctx.json(actions[0], 201);
}

export default { init };
