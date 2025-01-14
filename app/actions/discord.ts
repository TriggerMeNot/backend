import { Context } from "@hono";
import { db } from "../db/config.ts";
import { and, eq } from "drizzle-orm";
import { actionsPlayground as actionPlaygroundSchema } from "../schemas/actionsPlayground.ts";
import { playgrounds as playgroundSchema } from "../schemas/playgrounds.ts";
import { users as userSchema } from "../schemas/users.ts";
import { oauths as oauthSchema } from "../schemas/oauths.ts";
import { crons as cronSchema } from "../schemas/crons.ts";
import { scheduler } from "./actions.ts";
import { parseCronExpression } from "cron-schedule";
import { SERVICES } from "../db/seed.ts";
import { actionTrigger } from "../utils/trigger.ts";
import type { OnNewMessageSettings } from "../interfaces/discord.ts";
import z from "zod";

if (!Deno.env.has("DISCORD_BOT_TOKEN")) {
  throw new Error("Environment variable for Discord Bot Token not set");
}

async function OnNewMessage(
  _ctx: Context,
  actionPlayground: typeof actionPlaygroundSchema.$inferSelect,
  _playgroundId: number,
) {
  const settings = actionPlayground.settings as z.infer<
    typeof OnNewMessageSettings
  >;

  const cron = await db.insert(cronSchema).values({
    actionPlaygroundId: actionPlayground.id,
    cron: settings.cron,
  }).returning();

  cronOnNewMessage(cron[0]);
}

function cronOnNewMessage(
  cron: typeof cronSchema.$inferSelect,
) {
  async function task() {
    try {
      const data = await db.select().from(actionPlaygroundSchema).where(
        eq(actionPlaygroundSchema.id, cron.actionPlaygroundId),
      ).innerJoin(
        playgroundSchema,
        eq(playgroundSchema.id, actionPlaygroundSchema.playgroundId),
      ).innerJoin(
        userSchema,
        eq(userSchema.id, playgroundSchema.userId),
      ).innerJoin(
        oauthSchema,
        and(
          eq(oauthSchema.userId, userSchema.id),
          eq(oauthSchema.serviceId, SERVICES.Discord.id!),
        ),
      ).limit(1);

      if (data.length === 0) {
        return;
      }

      const settings = data[0].actionsPlayground.settings as z.infer<
        typeof OnNewMessageSettings
      >;

      const response = await fetch(
        `https://discord.com/api/channels/${settings.channel_id}/messages?limit=1`,
        {
          headers: {
            Authorization: `Bot ${Deno.env.get("DISCORD_BOT_TOKEN")}`,
          },
        },
      )
        .then((res) => res.json());

      if (response.length > 0) {
        const messageDate = new Date(response[0].timestamp).getTime();
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

        if (messageDate > fiveMinutesAgo) {
          actionTrigger(cron.actionPlaygroundId, {});
        }
      }
    } catch (error) {
      console.error("Error: ", error);
      return;
    }
  }

  scheduler.registerTask(parseCronExpression(cron.cron), task);
}

export default { OnNewMessage, cronOnNewMessage };
