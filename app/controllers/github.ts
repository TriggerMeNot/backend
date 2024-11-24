import { Context } from "@hono";
import { db } from "../db/config.ts";
import { oauths as oauthSchema } from "../schemas/oauths.ts";

async function callback(ctx: Context) {
  const token = ctx.get("token") as unknown;
  const refreshToken = ctx.get("refresh-token") as unknown;
  const user = ctx.get("user-github");

  const payload = ctx.get("jwtPayload");
  const userId = parseInt(payload.sub);

  const serviceId = 1;

  await db.insert(oauthSchema).values({
    userId: (userId as number),
    serviceId: (serviceId as number),
    token: (token as string),
    refreshToken: (refreshToken as string),
  });

  return ctx.json({
    token,
    refreshToken,
    user,
  });
}

export default {
  callback,
};
