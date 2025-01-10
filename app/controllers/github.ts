import { Context } from "@hono";
import { db } from "../db/config.ts";
import { eq } from "drizzle-orm/expressions";
import { oauths as oauthSchema } from "../schemas/oauths.ts";
import { oidcs as oidcSchema } from "../schemas/oidcs.ts";
import { services as serviceSchema } from "../schemas/services.ts";
import { users as userSchema } from "../schemas/users.ts";
import { sign } from "@hono/jwt";

if (
  !Deno.env.get("GITHUB_ID") || !Deno.env.get("GITHUB_SECRET") ||
  !Deno.env.get("JWT_SECRET")
) {
  throw new Error("Environment variables for GitHub OAuth or JWT not set");
}

async function linkGithub(code: string) {
  // Get the service ID
  const services = await db.select().from(serviceSchema).where(
    eq(serviceSchema.name, "GitHub"),
  ).limit(1);
  const serviceId = services[0].id;

  // Get the access token and refresh token
  const {
    access_token: token,
    expires_in: tokenExpiresIn,
    refresh_token: refreshToken,
    refresh_token_expires_in: refreshTokenExpiresIn,
  } = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: Deno.env.get("GITHUB_ID")!,
      client_secret: Deno.env.get("GITHUB_SECRET")!,
      code,
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
    login: username,
    id: githubUserId,
  } = await fetch(`https://api.github.com/user`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .catch((err) => {
      throw {
        status: 400,
        body: err,
      };
    });

  // Get the primary email of the user
  const email = await fetch(`https://api.github.com/user/emails`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => {
      return data.find((e: { primary: boolean }) => e.primary)?.email;
    })
    .catch((err) => {
      throw {
        status: 400,
        body: err,
      };
    });

  return {
    serviceId,
    githubUserId,
    username,
    email,
    token,
    tokenExpiresIn,
    refreshToken,
    refreshTokenExpiresIn,
    actualTime: Math.floor(Date.now() / 1000),
  };
}

async function authenticate(ctx: Context) {
  const { code } = ctx.req.valid("json" as never);

  const {
    serviceId,
    githubUserId,
    username,
    email,
    token,
    tokenExpiresIn,
    refreshToken,
    refreshTokenExpiresIn,
    actualTime,
  } = await linkGithub(code);

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
    serviceUserId: githubUserId,
    userId,
    serviceId,
    token,
    tokenExpiresAt: actualTime + tokenExpiresIn,
    refreshToken,
    refreshTokenExpiresAt: actualTime + refreshTokenExpiresIn,
  }).onConflictDoUpdate({
    target: [oidcSchema.userId, oidcSchema.serviceId],
    set: {
      token,
      tokenExpiresAt: actualTime + tokenExpiresIn,
      refreshToken,
      refreshTokenExpiresAt: actualTime + refreshTokenExpiresIn,
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

async function authorize(ctx: Context) {
  const userId = ctx.get("jwtPayload").sub;
  const { code } = ctx.req.valid("json" as never);

  const {
    serviceId,
    githubUserId,
    token,
    tokenExpiresIn,
    refreshToken,
    refreshTokenExpiresIn,
    actualTime,
  } = await linkGithub(code);

  await db.insert(oauthSchema).values({
    userId,
    serviceId,
    serviceUserId: githubUserId,
    token,
    tokenExpiresAt: actualTime + tokenExpiresIn,
    refreshToken,
    refreshTokenExpiresAt: actualTime + refreshTokenExpiresIn,
  }).onConflictDoUpdate({
    target: [oidcSchema.userId, oidcSchema.serviceId],
    set: {
      token,
      tokenExpiresAt: actualTime + tokenExpiresIn,
      refreshToken,
      refreshTokenExpiresAt: actualTime + refreshTokenExpiresIn,
    },
  });

  return ctx.json({ message: "Connection successful" });
}

function webhook(ctx: Context) {
  return ctx.json({ message: "Webhook received" });
}

export default { authenticate, authorize, webhook };
