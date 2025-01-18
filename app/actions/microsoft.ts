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
import microsoftController from "../controllers/microsoft.ts";

async function OnNewEmail(
  _ctx: Context,
  actionPlayground: typeof actionPlaygroundSchema.$inferSelect,
  _playgroundId: number,
) {
  const cron = await db.insert(cronSchema).values({
    actionPlaygroundId: actionPlayground.id,
    cron: (actionPlayground.settings as { cron: string }).cron,
  }).returning();

  cronOnNewEmail(cron[0]);
}

function cronOnNewEmail(
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
          eq(oauthSchema.serviceId, SERVICES.Microsoft.id!),
        ),
      ).limit(1);

      if (data.length === 0) {
        return;
      }

      const accessToken = (data[0].oauths.tokenExpiresAt < Date.now())
        ? await microsoftController.microsoftRefreshToken(
          data[0].users.id,
          data[0].oauths.refreshToken,
        )
        : data[0].oauths.token;

      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/mailFolders('Inbox')/messages?$filter=isRead eq false`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
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

      if (response.value.length > 0) {
        actionTrigger(cron.actionPlaygroundId, {});
      }
    } catch (error) {
      console.error("Error: ", error);
      return;
    }
  }

  scheduler.registerTask(parseCronExpression(cron.cron), task);
}

export default { OnNewEmail, cronOnNewEmail };
