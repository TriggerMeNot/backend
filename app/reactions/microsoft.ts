import ReactionTrigger from "../types/ReactionTrigger.ts";
import { db } from "../db/config.ts";
import { and, eq } from "drizzle-orm/expressions";
import { SERVICES } from "../db/seed.ts";
import { oauths as oauthSchema } from "../schemas/oauths.ts";
import { SendEmailOutlookSettings } from "../interfaces/microsoft.ts";

async function sendEmail(reaction: ReactionTrigger) {
  const settings = SendEmailOutlookSettings.parse(reaction.settings);

  const oauths = await db.select().from(oauthSchema).where(
    and(
      eq(oauthSchema.serviceId, SERVICES.Microsoft.id!),
      eq(oauthSchema.userId, reaction.userId),
    ),
  ).limit(1);

  if (!oauths.length) {
    throw new Error("Microsoft OAuth not found");
  }
  const oauth = oauths[0];

  await fetch(
    "https://graph.microsoft.com/v1.0/me/sendMail",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${oauth.token}`,
      },
      body: JSON.stringify({
        message: {
          subject: settings.subject,
          body: {
            contentType: "Text",
            content: settings.body,
          },
          toRecipients: [
            {
              emailAddress: {
                address: settings.to,
              },
            },
          ],
        },
      }),
    },
  );

  return {};
}

export default { sendEmail };
