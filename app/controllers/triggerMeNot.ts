import { Context } from "@hono";
import { db } from "../db/config.ts";
import { and, eq } from "drizzle-orm/expressions";
import { services as serviceSchema } from "../schemas/services.ts";
import { reactions as reactionSchema } from "../schemas/reactions.ts";
import { reactionsPlayground as reactionPlaygroundSchema } from "../schemas/reactionsPlayground.ts";
import { actions as actionSchema } from "../schemas/actions.ts";
import { actionsPlayground as actionPlaygroundSchema } from "../schemas/actionsPlayground.ts";

const SERVICE_NAME = "TriggerMeNot";

const service = (await db.insert(serviceSchema).values({
  name: SERVICE_NAME,
}).onConflictDoNothing().returning())[0];

// Reaction

const reactionOnFetch = (await db.insert(reactionSchema).values({
  serviceId: service.id,
  name: "On Fetch",
  description: "When it fetches",
}).onConflictDoNothing().returning())[0];

async function ReactionAddOnFetch(ctx: Context) {
  // @ts-ignore - The `json` validator is added by the `validator` middleware
  const { playgroundId } = ctx.req.valid("json");

  await db.insert(reactionPlaygroundSchema).values({
    playgroundId,
    reactionId: reactionOnFetch.id,
  });

  return ctx.json({ success: true }, 201);
}

async function ReactionOnFetch(ctx: Context) {
  // @ts-ignore - The `json` validator is added by the `validator` middleware
  const { reactionId } = ctx.req.valid("json");

  const reaction = await db.select().from(reactionSchema).where(
    and(
      eq(reactionSchema.id, reactionId),
      eq(reactionSchema.serviceId, service.id),
    ),
  ).limit(1);

  if (!reaction.length) {
    return ctx.json({ error: "Reaction not found" }, 404);
  }

  // TODO: Trigger action linked to this reaction
  return ctx.json({ success: true });
}

// Action

const actionOnFetch = (await db.insert(actionSchema).values({
  serviceId: service.id,
  name: "Fetch",
  description: "Fetch a URL",
}).onConflictDoNothing().returning())[0];

async function ActionAddFetch(ctx: Context) {
  const { playgroundId: stringPlaygroundId, url, method, headers, body } = ctx
    // @ts-ignore - The `json` validator is added by the `validator` middleware
    .req.valid("json");

  const playgroundId = parseInt(stringPlaygroundId);
  if (isNaN(playgroundId)) {
    return ctx.json({ error: "Invalid playground ID" }, 400);
  }

  await db.insert(actionPlaygroundSchema).values({
    playgroundId,
    actionId: actionOnFetch.id,
    settings: {
      url,
      method,
      headers,
      body,
    },
  });

  return ctx.json({ success: true }, 201);
}

async function ActionFetch(ctx: Context) {
  // @ts-ignore - The `json` validator is added by the `validator` middleware
  const { actionId } = ctx.req.valid("json");

  const actions = await db.select().from(actionPlaygroundSchema).where(
    eq(actionPlaygroundSchema.actionId, actionId),
  ).limit(1);

  if (!actions.length) {
    return ctx.json({ error: "Action not found" }, 404);
  }

  const action = actions[0];

  if (!Object.hasOwn(action, "settings")) {
    return ctx.json({ error: "Action settings not found" }, 404);
  }

  const requiredSettings = ["url", "method", "headers", "body"];
  interface ActionSettings {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string;
  }

  const settings = action.settings as ActionSettings;

  if (!requiredSettings.every((key) => key in settings)) {
    return ctx.json({ error: "Action settings are invalid" }, 400);
  }

  const response = await fetch(settings.url, {
    method: settings.method,
    headers: settings.headers,
    body: settings.body,
  });

  if (!response.ok) {
    return ctx.json({ error: "Failed to fetch URL" }, 400);
  }

  return ctx.json({ success: true });
}

export default {
  ReactionAddOnFetch,
  ReactionOnFetch,
  ActionAddFetch,
  ActionFetch,
};
