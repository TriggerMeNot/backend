import { Context } from "@hono";
import { sign } from "@hono/jwt";
import { db } from "../db/config.ts";
import { users as userSchema } from "../schemas/users.ts";
import { and, eq } from "drizzle-orm/expressions";

async function login(ctx: Context) {
  // @ts-ignore - The `form` validator is added by the `validator` middleware
  const { email, password } = ctx.req.valid("form");

  const users = await db.select().from(userSchema).where(
    and(
      eq(userSchema.email, email),
      eq(userSchema.password, password),
    ),
  ).limit(1);

  if (!users.length) {
    return ctx.json({ message: "Invalid email or password" }, 401);
  }

  const user = users[0];

  const payload = {
    sub: `${user.username}:${user.email}`,
    role: "user",
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // Token expires in 24 hours
  };

  const token = await sign(payload, Deno.env.get("JWT_SECRET")!);
  return ctx.json({ token });
}

async function register(ctx: Context) {
  // @ts-ignore - The `form` validator is added by the `validator` middleware
  const { email, username, password } = ctx.req.valid("form");

  const users = await db.select().from(userSchema).where(
    eq(userSchema.email, email),
  ).limit(1);

  if (users.length) {
    return ctx.json({ message: "User already exists" }, 400);
  }

  await db.insert(userSchema).values({ email, username, password });
  return ctx.json({ email, username });
}

export default {
  login,
  register,
};
