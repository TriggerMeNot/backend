import { Context } from "@hono";
import { db } from "../db/config.ts";
import { and, eq } from "drizzle-orm/expressions";
import { SERVICES } from "../db/seed.ts";
import { oauths as oauthSchema } from "../schemas/oauths.ts";
import { oidcs as oidcSchema } from "../schemas/oidcs.ts";
import { users as userSchema } from "../schemas/users.ts";
import { sign } from "@hono/jwt";

if (
  !Deno.env.has("GOOGLE_ID") || !Deno.env.has("GOOGLE_SECRET") ||
  !Deno.env.has("JWT_SECRET")
) {
  throw new Error("Environment variables for Google OAuth or JWT not set");
}

async function linkGoogle(code: string, redirect_uri_path: string) {
  const {
    access_token: token,
    refresh_token: refreshToken,
    expires_in: tokenExpiresIn,
  } = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code: code,
      client_id: Deno.env.get("GOOGLE_ID")!,
      client_secret: Deno.env.get("GOOGLE_SECRET")!,
      redirect_uri: Deno.env.get("REDIRECT_URI")! + redirect_uri_path,
      scope: "",
      grant_type: "authorization_code",
    }),
  })
    .then((res) => res.json());

  const {
    id: googleUserId,
    name: username,
    email,
  } = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )
    .then((res) => res.json());

  return {
    googleUserId,
    username,
    email,
    token,
    refreshToken,
    tokenExpiresIn,
    actualTime: Math.floor(Date.now() / 1000),
  };
}

async function googleRefreshToken(
  userId: number,
  refreshToken: string,
) {
  const {
    access_token: token,
    expires_in: tokenExpiresIn,
    refresh_token: newRefreshToken,
  } = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: Deno.env.get("GOOGLE_ID")!,
      client_secret: Deno.env.get("GOOGLE_SECRET")!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
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
      eq(oauthSchema.serviceId, SERVICES.Google.id!),
    ),
  );

  return token;
}

async function authenticate(ctx: Context) {
  const { code } = await ctx.req.json();

  const {
    googleUserId,
    username,
    email,
    token,
    refreshToken,
    tokenExpiresIn,
    actualTime,
  } = await linkGoogle(code, "/login/google");

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
    serviceUserId: googleUserId,
    userId: userId,
    serviceId: SERVICES.Google.id!,
    token,
    tokenExpiresAt: actualTime + tokenExpiresIn,
    refreshToken,
    refreshTokenExpiresAt: actualTime + (tokenExpiresIn * 24),
  }).onConflictDoUpdate({
    target: [oidcSchema.userId, oidcSchema.serviceId],
    set: {
      token,
      tokenExpiresAt: actualTime + tokenExpiresIn,
      refreshToken,
      refreshTokenExpiresAt: actualTime + (tokenExpiresIn * 24),
    },
  });

  const payload = {
    sub: userId,
    role: "user",
    exp: actualTime + 60 * 60 * 24,
  };

  const jwtToken = await sign(payload, Deno.env.get("JWT_SECRET")!);

  return ctx.json({ message: "Login successful", token: jwtToken });
}

async function isAuthorized(ctx: Context) {
  const userId = ctx.get("jwtPayload").sub;

  const users = await db
    .select()
    .from(oauthSchema)
    .where(
      and(
        eq(oauthSchema.userId, userId),
        eq(oauthSchema.serviceId, SERVICES.Google.id!),
      ),
    )
    .limit(1);

  return ctx.json({ authorized: users.length ? true : false });
}

async function authorize(ctx: Context) {
  const userId = ctx.get("jwtPayload").sub;
  const { code } = ctx.req.valid("json" as never);

  const {
    googleUserId,
    token,
    tokenExpiresIn,
    refreshToken,
    actualTime,
  } = await linkGoogle(code, "/services/google");

  await db.insert(oauthSchema).values({
    userId,
    serviceId: SERVICES.Google.id!,
    serviceUserId: googleUserId,
    token,
    tokenExpiresAt: actualTime + tokenExpiresIn,
    refreshToken,
    refreshTokenExpiresAt: actualTime + (tokenExpiresIn * 24),
  }).onConflictDoUpdate({
    target: [oauthSchema.userId, oauthSchema.serviceId],
    set: {
      token,
      tokenExpiresAt: actualTime + tokenExpiresIn,
      refreshToken,
      refreshTokenExpiresAt: actualTime + (tokenExpiresIn * 24),
    },
  }).returning();

  return ctx.json({ message: "Connection successful" });
}

export default {
  authenticate,
  authorize,
  isAuthorized,
  googleRefreshToken,
};
