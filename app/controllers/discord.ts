import { Context } from "@hono";
import { db } from "../db/config.ts";
import { and, eq } from "drizzle-orm/expressions";
import { SERVICES } from "../db/seed.ts";
import { oauths as oauthSchema } from "../schemas/oauths.ts";
import { oidcs as oidcSchema } from "../schemas/oidcs.ts";
import { users as userSchema } from "../schemas/users.ts";
import { sign } from "@hono/jwt";

if (
  !Deno.env.has("DISCORD_ID") || !Deno.env.has("DISCORD_SECRET") ||
  !Deno.env.has("JWT_SECRET")
) {
  throw new Error("Environment variables for Discord OAuth or JWT not set");
}

async function linkDiscord(code: string, redirect_uri_path: string) {
  // Get the access token and refresh token
  const {
    access_token: token,
    expires_in: tokenExpiresIn,
    refresh_token: refreshToken,
  } = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: Deno.env.get("DISCORD_ID")!,
      client_secret: Deno.env.get("DISCORD_SECRET")!,
      code,
      grant_type: "authorization_code",
      redirect_uri: Deno.env.get("REDIRECT_URI")! + redirect_uri_path,
    }),
  })
    .then((res) => res.json())
    .catch((err) => {
      throw {
        status: 400,
        body: err,
      };
    });

  // Get information about the user
  const {
    id: discordUserId,
    global_name: username,
    email,
  } = await fetch(`https://discord.com/api/users/@me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .catch((err) => {
      throw {
        status: 400,
        body: err,
      };
    });

  return {
    discordUserId,
    username,
    email,
    token,
    tokenExpiresIn,
    refreshToken,
    actualTime: Math.floor(Date.now() / 1000),
  };
}

async function discordRefreshToken(
  userId: number,
  refreshToken: string,
) {
  const {
    access_token: token,
    expires_in: tokenExpiresIn,
    refresh_token: newRefreshToken,
  } = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: Deno.env.get("DISCORD_ID")!,
      client_secret: Deno.env.get("DISCORD_SECRET")!,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  })
    .then((res) => res.json());

  await db.update(oauthSchema).set({
    token,
    tokenExpiresAt: Math.floor(Date.now() / 1000) + tokenExpiresIn,
    refreshToken: newRefreshToken,
    refreshTokenExpiresAt: Math.floor(Date.now() / 1000) +
      (tokenExpiresIn * 24),
  }).where(
    and(
      eq(oauthSchema.userId, userId),
      eq(oauthSchema.serviceId, SERVICES.Discord.id!),
    ),
  );

  return token;
}

async function authenticate(ctx: Context) {
  const { code } = ctx.req.valid("json" as never);

  const {
    discordUserId,
    username,
    email,
    token,
    tokenExpiresIn,
    refreshToken,
    actualTime,
  } = await linkDiscord(code, "/login/discord");

  // Get the user ID / create a new user if not found
  const users = await db.select().from(userSchema).where(
    eq(userSchema.email, email),
  ).limit(1);
  const userId = users.length
    ? users[0].id
    : await db.insert(userSchema).values({
      email,
      username,
      password: null,
    }).returning()
      .then((newUser) => newUser[0].id);

  await db.insert(oidcSchema).values({
    serviceUserId: discordUserId,
    userId,
    serviceId: SERVICES.Discord.id!,
    token,
    tokenExpiresAt: actualTime + tokenExpiresIn,
    refreshToken,
    refreshTokenExpiresAt: actualTime + (365 * 24 * 60 * 60), // 1 year in seconds
  }).onConflictDoUpdate({
    target: [oidcSchema.userId, oidcSchema.serviceId],
    set: {
      token,
      tokenExpiresAt: actualTime + tokenExpiresIn,
      refreshToken,
      refreshTokenExpiresAt: actualTime + (365 * 24 * 60 * 60), // 1 year in seconds
    },
  });

  const payload = {
    sub: userId,
    role: "user",
    exp: actualTime + 60 * 60 * 24, // Token expires in 24 hours
  };

  const jwtToken = await sign(payload, Deno.env.get("JWT_SECRET")!);

  return ctx.json({ message: "Login/Register successful", token: jwtToken });
}

async function isAuthorized(ctx: Context) {
  const userId = ctx.get("jwtPayload").sub;

  const users = await db
    .select()
    .from(oauthSchema)
    .where(
      and(
        eq(oauthSchema.userId, userId),
        eq(oauthSchema.serviceId, SERVICES.Discord.id!),
      ),
    )
    .limit(1);

  return ctx.json({ authorized: users.length ? true : false });
}

async function authorize(ctx: Context) {
  const userId = ctx.get("jwtPayload").sub;
  const { code } = ctx.req.valid("json" as never);

  const {
    discordUserId,
    token,
    tokenExpiresIn,
    refreshToken,
    actualTime,
  } = await linkDiscord(code, "/services/discord");

  await db.insert(oauthSchema).values({
    userId,
    serviceId: SERVICES.Discord.id!,
    serviceUserId: discordUserId,
    token,
    tokenExpiresAt: actualTime + tokenExpiresIn,
    refreshToken,
    refreshTokenExpiresAt: actualTime + (365 * 24 * 60 * 60), // 1 year in seconds
  }).onConflictDoUpdate({
    target: [oidcSchema.userId, oidcSchema.serviceId],
    set: {
      token,
      tokenExpiresAt: actualTime + tokenExpiresIn,
      refreshToken,
      refreshTokenExpiresAt: actualTime + (365 * 24 * 60 * 60), // 1 year in seconds
    },
  });

  return ctx.json({ message: "Connection successful" });
}

export default { authenticate, authorize, isAuthorized, discordRefreshToken };
