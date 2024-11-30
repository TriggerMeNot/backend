import { Context } from "@hono";
import { db } from "../db/config.ts";
import { and, eq } from "drizzle-orm/expressions";
import { oauths as oauthSchema } from "../schemas/oauths.ts";
import { services as serviceSchema } from "../schemas/services.ts";

if (!Deno.env.get("GITHUB_ID") || !Deno.env.get("GITHUB_SECRET")) {
  throw new Error("GitHub OAuth credentials not found");
}

const SERVICE_NAME = "GitHub";

await db.insert(serviceSchema).values({
  name: SERVICE_NAME,
}).onConflictDoNothing();

async function root(ctx: Context) {
  // @ts-ignore - The `json` validator is added by the `validator` middleware
  const { code } = ctx.req.valid("json");

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
    return ctx.json(data, 400);
  }

  const actualTime = new Date().getUTCSeconds();
  const {
    access_token: token,
    expires_in: tokenExpiresIn,
    refresh_token: refreshToken,
    refresh_token_expires_at: refreshTokenExpiresIn,
  } = data;

  const services = await db.select().from(serviceSchema).where(
    eq(serviceSchema.name, SERVICE_NAME),
  ).limit(1);
  if (!services.length) {
    return ctx.json({ error: "Service not found" }, 404);
  }
  const serviceId = services[0].id;

  const jwtPayload = ctx.get("jwtPayload");
  const userId = parseInt(jwtPayload.sub);

  await db.insert(oauthSchema).values({
    userId,
    serviceId,
    token,
    tokenExpiresAt: actualTime + tokenExpiresIn,
    refreshToken,
    refreshTokenExpiresAt: actualTime + refreshTokenExpiresIn,
  }).onConflictDoUpdate({
    target: oauthSchema.id,
    set: {
      token: token,
      refreshToken: refreshToken,
    },
    setWhere: and(
      eq(oauthSchema.userId, userId),
      eq(oauthSchema.serviceId, serviceId),
    ),
  });

  return ctx.json({ message: "Success" }, 200);
}

export default { root };
