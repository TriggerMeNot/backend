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
  // Check if the service exists
  const services = await db.select().from(serviceSchema).where(
    eq(serviceSchema.name, "GitHub"),
  ).limit(1);

  if (!services.length) {
    throw {
      status: 404,
      body: { error: "Service not found" },
    };
  }

  const serviceId = services[0].id;

  const response = await fetch(
    `https://github.com/login/oauth/access_token`,
    {
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
    },
  );

  const data = await response.json();
  if ("error" in data) {
    throw {
      status: 400,
      body: data,
    };
  }

  const {
    access_token: token,
    expires_in: tokenExpiresIn,
    refresh_token: refreshToken,
    refresh_token_expires_in: refreshTokenExpiresIn,
  } = data;

  const userEmailsResponse = await fetch(`https://api.github.com/user/emails`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const userData = await userEmailsResponse.json();
  if ("error" in userData) {
    throw {
      status: 400,
      body: userData,
    };
  }

  // deno-lint-ignore no-explicit-any
  const email = userData.find((email: any) => email.primary)?.email;

  if (!email) {
    throw {
      status: 400,
      body: { error: "No suitable email found in GitHub account" },
    };
  }

  const githubUsernameResponse = await fetch(`https://api.github.com/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const githubUserData = await githubUsernameResponse.json();
  if ("error" in githubUserData) {
    throw {
      status: 400,
      body: githubUserData,
    };
  }

  const githubUsername = githubUserData.login;

  const actualTime = Math.floor(Date.now() / 1000);

  // Check if the user already exists
  const users = await db.select().from(userSchema).where(
    eq(userSchema.email, email),
  ).limit(1);

  let userId;
  if (!users.length) {
    const newUser = await db.insert(userSchema).values({
      email,
      username: githubUsername,
      password: null, // OAuth users may not have a password
    }).returning();

    if (!newUser.length) {
      throw {
        status: 500,
        body: { message: "Failed to create user" },
      };
    }
    userId = newUser[0].id;
  } else {
    userId = users[0].id;
  }

  return {
    userId,
    serviceId,
    email,
    token,
    tokenExpiresIn,
    refreshToken,
    refreshTokenExpiresIn,
    actualTime,
  };
}

async function authenticate(ctx: Context) {
  const { code } = ctx.req.valid("json" as never);

  const {
    userId,
    serviceId,
    email,
    token,
    tokenExpiresIn,
    refreshToken,
    refreshTokenExpiresIn,
    actualTime,
  } = await linkGithub(code);

  await db.insert(oidcSchema).values({
    loginId: email,
    userId,
    serviceId,
    token,
    tokenExpiresAt: actualTime + tokenExpiresIn,
    refreshToken,
    refreshTokenExpiresAt: actualTime + refreshTokenExpiresIn,
  }).onConflictDoUpdate({
    target: [oidcSchema.userId, oidcSchema.serviceId],
    set: {
      loginId: email,
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
  const { code } = ctx.req.valid("json" as never);

  return ctx.json({ success: true, code });

  // await db.insert(oauthSchema).values({
  //   userId,
  //   serviceId,
  //   token,
  //   tokenExpiresAt: actualTime + tokenExpiresIn,
  //   refreshToken,
  //   refreshTokenExpiresAt: actualTime + refreshTokenExpiresIn,
  // }).onConflictDoUpdate({
  //   target: [oidcSchema.userId, oidcSchema.serviceId],
  //   set: {
  //     token,
  //     tokenExpiresAt: actualTime + tokenExpiresIn,
  //     refreshToken,
  //     refreshTokenExpiresAt: actualTime + refreshTokenExpiresIn,
  //   },
  // });

  // return ctx.json({ message: "Connection successful" });
}

export default { authenticate, authorize };
