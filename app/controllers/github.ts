import { Context } from "@hono";
import { db } from "../db/config.ts";
import { and, eq } from "drizzle-orm/expressions";
import { oauths as oauthSchema } from "../schemas/oauths.ts";
import { services as serviceSchema } from "../schemas/services.ts";

const SERVICE_NAME = "GitHub";

await db.insert(serviceSchema).values({
  name: SERVICE_NAME,
}).onConflictDoNothing();

async function setToken(ctx: Context) {
  // @ts-ignore - The `form` validator is added by the `validator` middleware
  const { token, refreshToken } = ctx.req.valid("form");

  const jwtPayload = ctx.get("jwtPayload");
  const userId = parseInt(jwtPayload.sub);

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
    token: token,
    refreshToken: refreshToken,
  }).onConflictDoUpdate({
    target: oauthSchema.id,
    set: {
      token: token,
      refreshToken: refreshToken,
    },
    setWhere: and(
      eq(oauthSchema.token, token),
      eq(oauthSchema.refreshToken, refreshToken),
    ),
  });
}

export default { setToken };
