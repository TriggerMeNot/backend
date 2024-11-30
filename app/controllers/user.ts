import { Context } from "@hono";
import { db } from "../db/config.ts";
import { eq } from "drizzle-orm/expressions";
import { users as userSchema } from "../schemas/users.ts";

async function self(ctx: Context) {
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

async function getUser(ctx: Context) {
  // @ts-ignore - The `param` validator is added by the `validator` middleware
  const { id: stringId } = ctx.req.valid("param");

  if (isNaN(parseInt(stringId))) {
    return ctx.json({ error: "Invalid user ID" }, 400);
  }
  const id = parseInt(stringId);

  const user = await db.select({
    id: userSchema.id,
    email: userSchema.email,
    username: userSchema.username,
  }).from(userSchema).where(
    eq(userSchema.id, id),
  ).limit(1);

  if (!user.length) {
    return ctx.json({ error: "User not found" }, 404);
  }

  return ctx.json(user);
}

export default { self, getUser };
