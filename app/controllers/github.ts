import { Context } from "@hono";
import { db } from "../db/config.ts";
import { and, eq } from "drizzle-orm/expressions";
import { SERVICES } from "../db/seed.ts";
import { oauths as oauthSchema } from "../schemas/oauths.ts";
import { oidcs as oidcSchema } from "../schemas/oidcs.ts";
import { users as userSchema } from "../schemas/users.ts";
import { sign } from "@hono/jwt";
import { actionsTriggers } from "../utils/trigger.ts";

if (
  !Deno.env.has("GITHUB_ID") || !Deno.env.has("GITHUB_SECRET") ||
  !Deno.env.has("GITHUB_APP") || !Deno.env.has("JWT_SECRET")
) {
  throw new Error("Environment variables for GitHub OAuth or JWT not set");
}

function getURI(ctx: Context) {
  return ctx.json({
    authenticate: `https://github.com/login/oauth/authorize` +
      `?client_id=${Deno.env.get("GITHUB_ID")}` +
      `&redirect_uri=${Deno.env.get("REDIRECT_URI")}/login/github`,

    authorize: `https://github.com/apps/${
      Deno.env.get("GITHUB_APP")
    }/installations/new`,
  });
}

async function linkGithub(code: string) {
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
    serviceId: SERVICES.GitHub.id!,
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

async function isAuthorized(ctx: Context) {
  const userId = ctx.get("jwtPayload").sub;

  const users = await db
    .select()
    .from(oauthSchema)
    .where(
      and(
        eq(oauthSchema.userId, userId),
        eq(oauthSchema.serviceId, SERVICES.GitHub.id!),
      ),
    )
    .limit(1);

  return ctx.json({ authorized: users.length ? true : false });
}

async function authorize(ctx: Context) {
  const userId = ctx.get("jwtPayload").sub;
  const { code } = ctx.req.valid("json" as never);

  const {
    githubUserId,
    token,
    tokenExpiresIn,
    refreshToken,
    refreshTokenExpiresIn,
    actualTime,
  } = await linkGithub(code);

  await db.insert(oauthSchema).values({
    userId,
    serviceId: SERVICES.GitHub.id!,
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

async function webhook(ctx: Context) {
  const data = await ctx.req.json();

  if (
    data.pull_request &&
    (data.action === "opened" || data.action === "reopened")
  ) {
    const users = await db
      .select()
      .from(oidcSchema)
      .where(eq(oidcSchema.serviceUserId, data.pull_request.user.id))
      .limit(1);

    if (users.length) {
      actionsTriggers(
        SERVICES.GitHub.actions!["On Pull Request Opened"].id!,
        users[0].userId,
        {},
      );
    }
  }

  return ctx.json({ message: "Webhook received" });
}

export default { getURI, authenticate, authorize, webhook, isAuthorized };
