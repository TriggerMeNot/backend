import { Context } from "@hono";
import { sign, verify } from "@hono/jwt";
import { db } from "../db/config.ts";
import { eq } from "drizzle-orm/expressions";
import { users as userSchema } from "../schemas/users.ts";
import { oauths as oauthSchema } from "../schemas/oauths.ts";
import { services as serviceSchema } from "../schemas/services.ts";

const SERVICE_NAME = "GitHub";

await db.insert(serviceSchema).values({
  name: SERVICE_NAME,
}).onConflictDoNothing();

async function callback(ctx: Context) {
  const token = ctx.get("token") as unknown;
  const refreshToken = ctx.get("refresh-token") as unknown;
  const user = ctx.get("user-github");

  let payload;
  const authHeader = ctx.req.raw.headers.get("Authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const jwtToken = authHeader.substring(7, authHeader.length);
    try {
      payload = await verify(jwtToken, Deno.env.get("JWT_SECRET")!);
    } catch {
      return ctx.json({ error: "Invalid token" }, 401);
    }
  } else {
    return await login(ctx);
  }

  const userId = parseInt(payload.sub as string);

  const services = await db.select().from(serviceSchema).where(
    eq(serviceSchema.name, SERVICE_NAME),
  ).limit(1);
  if (!services.length) {
    return ctx.json({ error: "Service not found" }, 404);
  }
  const serviceId = services[0].id;

  await db.insert(oauthSchema).values({
    userId: userId,
    serviceId: serviceId,
    token: token as string,
    refreshToken: refreshToken as string,
  });

  return ctx.json({
    token,
    refreshToken,
    user,
  });
}

async function register(ctx: Context) {
  const user = ctx.get("user-github");

  if (!user) {
    return ctx.json({ error: "GitHub login failed" }, 400);
  }

  const existingUser = await db.select().from(userSchema).where(
    eq(userSchema.email, user.email as string),
  ).limit(1);

  if (existingUser.length) {
    return ctx.json({ error: "User already exists with this email" }, 400);
  }

  const systemUser = await db.insert(userSchema).values({
    email: user.email as string,
    username: user.name as string,
  }).returning();

  const payload = {
    sub: systemUser[0].id,
    role: "user",
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // Token expires in 24 hours
  };

  const token = await sign(payload, Deno.env.get("JWT_SECRET")!);
  return ctx.json({ token });
}

async function login(ctx: Context) {
  const user = ctx.get("user-github");

  if (!user) {
    return ctx.json({ error: "GitHub login failed" }, 400);
  }

  const systemUser = await db.select().from(userSchema).where(
    eq(userSchema.email, user.email as string),
  ).limit(1);

  if (!systemUser.length) {
    return await register(ctx);
  }

  const payload = {
    sub: systemUser[0].id,
    role: "user",
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // Token expires in 24 hours
  };

  const token = await sign(payload, Deno.env.get("JWT_SECRET")!);
  return ctx.json({ token });
}

export default {
  callback,
};
