import { Context } from "@hono";
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
      return await triggerMeNot.OnFetch(ctx, actionPlayground, playgroundId);
    default:
      break;
  }
  return ctx.json({ error: "Action not found" }, 404);
}

export default { init };
