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

  return ctx.json(user[0]);
}

async function getUser(ctx: Context) {
  const { id: idString } = ctx.req.param();

  if (isNaN(parseInt(idString))) {
    return ctx.json({ error: "Invalid user ID" }, 400);
  }
  const id = parseInt(idString);

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

async function patchUser(ctx: Context) {
  const { id: idString } = ctx.req.param();
  const { username } = ctx.req.valid("json" as never);

  if (isNaN(parseInt(idString))) {
    return ctx.json({ error: "Invalid user ID" }, 400);
  }
  const id = parseInt(idString);

  const user = await db.update(userSchema).set({
    username,
  }).where(
    eq(userSchema.id, id),
  ).returning({
    id: userSchema.id,
    email: userSchema.email,
    username: userSchema.username,
  });

  if (!user) {
    return ctx.json({ error: "User not found" }, 404);
  }

  return ctx.json(user[0]);
}

export default { self, getUser, patchUser };
