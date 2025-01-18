import ReactionTrigger from "../types/ReactionTrigger.ts";
import { db } from "../db/config.ts";
import { and, eq } from "drizzle-orm/expressions";
import { SERVICES } from "../db/seed.ts";
import { oauths as oauthSchema } from "../schemas/oauths.ts";
import {
  SendMessageSettings,
  SendTTSMessageSettings,
} from "../interfaces/discord.ts";

async function sendMessage(reaction: ReactionTrigger) {
  const settings = SendMessageSettings.parse(reaction.settings);

  const oauths = await db.select().from(oauthSchema).where(
    and(
      eq(oauthSchema.serviceId, SERVICES.Discord.id!),
      eq(oauthSchema.userId, reaction.userId),
    ),
  ).limit(1);

  if (!oauths.length) {
    throw new Error("Discord OAuth not found");
  }

  return await fetch(
    `https://discord.com/api/channels/${settings.channelId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bot ${Deno.env.get("DISCORD_BOT_TOKEN")}`,
      },
      body: JSON.stringify({
        content: settings.message,
      }),
    },
  )
    .then((res) => {
      if (!res.ok) {
        throw {
          status: res.status,
          body: res.statusText,
        };
      }
      return res.json();
    })
    .catch((err) => {
      throw {
        status: 400,
        body: err,
      };
    });
}

async function sendTTSMessage(reaction: ReactionTrigger) {
  const settings = SendTTSMessageSettings.parse(reaction.settings);

  const oauths = await db.select().from(oauthSchema).where(
    and(
      eq(oauthSchema.serviceId, SERVICES.Discord.id!),
      eq(oauthSchema.userId, reaction.userId),
    ),
  ).limit(1);

  if (!oauths.length) {
    throw new Error("Discord OAuth not found");
  }

  return await fetch(
    `https://discord.com/api/channels/${settings.channelId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bot ${Deno.env.get("DISCORD_BOT_TOKEN")}`,
      },
      body: JSON.stringify({
        content: settings.message,
        tts: true,
      }),
    },
  )
    .then((res) => {
      if (!res.ok) {
        throw {
          status: res.status,
          body: res.statusText,
        };
      }
      return res.json();
    })
    .catch((err) => {
      throw {
        status: 400,
        body: err,
      };
    });
}

export default { sendMessage, sendTTSMessage };
