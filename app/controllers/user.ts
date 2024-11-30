import { Context } from "@hono";
import { db } from "../db/config.ts";
import { eq } from "drizzle-orm/expressions";
import { users as userSchema } from "../schemas/users.ts";

async function root(ctx: Context) {
  const jwtPayload = ctx.get("jwtPayload");
  const userId = parseInt(jwtPayload.sub);

  const user = await db.select({
    id: userSchema.id,
    email: userSchema.email,
    username: userSchema.username,
  }).from(userSchema).where(
    eq(userSchema.id, userId),
  ).limit(1);

  return ctx.json(user);
}

export default { root };
