import { Context } from "@hono";
import { db } from "../db/config.ts";
import { eq } from "drizzle-orm/expressions";
import { services as serviceSchema } from "../schemas/services.ts";
import { actions as actionSchema } from "../schemas/actions.ts";
import { reactions as reactionSchema } from "../schemas/reactions.ts";

function root(ctx: Context) {
  return ctx.text("Hello Hono!");
}

async function about(ctx: Context) {
  const services = [];
  for (const service of await db.select().from(serviceSchema)) {
    services.push({
      name: service.name,
      actions: await db.select({
        id: actionSchema.id,
        name: actionSchema.name,
        description: actionSchema.description,
        params: actionSchema.params,
        settings: actionSchema.settings,
      }).from(actionSchema).where(
        eq(actionSchema.serviceId, service.id),
      ),
      reactions: await db.select({
        id: reactionSchema.id,
        name: reactionSchema.name,
        description: reactionSchema.description,
        settings: reactionSchema.settings,
      }).from(reactionSchema).where(
        eq(reactionSchema.serviceId, service.id),
      ),
    });
  }

  return ctx.json({
    client: {
      host: ctx.req.header("host") || "unknown",
    },
    server: {
      current_time: Math.floor(Date.now() / 1000),
      services,
    },
  });
}

export default {
  root,
  about,
};
