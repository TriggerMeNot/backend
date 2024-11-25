import { Context } from "@hono";
import { sign } from "@hono/jwt";
import { db } from "../db/config.ts";
import { users as userSchema } from "../schemas/users.ts";
import { eq } from "drizzle-orm/expressions";
import bcrypt from "bcrypt";

if (!Deno.env.get("SALT_ROUNDS")) {
  console.error("Please set the SALT_ROUNDS environment variable");
  Deno.exit(1);
}

async function login(ctx: Context) {
  // @ts-ignore - The `form` validator is added by the `validator` middleware
  const { email, password } = ctx.req.valid("form");

  const users = await db.select().from(userSchema).where(
    eq(userSchema.email, email),
  ).limit(1);

  if (!users.length || !(await bcrypt.compare(password, users[0].password))) {
    return ctx.json({ message: "Invalid email or password" }, 401);
  }

  const user = users[0];

  const payload = {
    sub: user.id,
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

  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(Deno.env.get("SALT_ROUNDS")!),
  );

  await db.insert(userSchema).values({
    email,
    username,
    password: hashedPassword,
  });
  return ctx.json({ email, username });
}

export default {
  login,
  register,
};
