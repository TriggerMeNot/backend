import { Context } from "@hono";
import { db } from "../db/config.ts";
import { and, eq } from "drizzle-orm/expressions";
import { actionsPlayground as actionPlaygroundSchema } from "../schemas/actionsPlayground.ts";

function base64Encode(actionId: number, playgroundId: number) {
  // Pad both numbers to 10 digits to ensure consistent length
  const paddedNum1 = actionId.toString().padStart(10, "0");
  const paddedNum2 = playgroundId.toString().padStart(10, "0");

  // Combine the padded numbers
  const numberString = `${paddedNum1}${paddedNum2}`;

  // Convert to base64
  const encoder = new TextEncoder();
  const data = encoder.encode(numberString);
  return btoa(String.fromCharCode(...data));
}

async function OnFetch(
  ctx: Context,
  actionPlayground: typeof actionPlaygroundSchema.$inferSelect,
  playgroundId: number,
) {
  const settings = { token: base64Encode(actionPlayground.id, playgroundId) };

  await db.update(actionPlaygroundSchema).set({
    settings,
  }).where(
    and(
      eq(actionPlaygroundSchema.id, actionPlayground.id),
    ),
  );

  return ctx.json(settings, 301);
}

export default { OnFetch };
