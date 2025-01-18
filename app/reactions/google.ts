import ReactionTrigger from "../types/ReactionTrigger.ts";
import { db } from "../db/config.ts";
import { and, eq } from "drizzle-orm/expressions";
import { SERVICES } from "../db/seed.ts";
import { oauths as oauthSchema } from "../schemas/oauths.ts";
import { SendEmailGmailSettings } from "../interfaces/google.ts";

async function sendEmail(reaction: ReactionTrigger) {
  const settings = SendEmailGmailSettings.parse(reaction.settings);

  const oauths = await db.select().from(oauthSchema).where(
    and(
      eq(oauthSchema.serviceId, SERVICES.Google.id!),
      eq(oauthSchema.userId, reaction.userId),
    ),
  ).limit(1);

  if (!oauths.length) {
    throw new Error("Google OAuth not found");
  }
  const oauth = oauths[0];

  const emailContent =
    `To: ${settings.to}\r\nSubject: ${settings.subject}\r\n\r\n${settings.body}`;
  const encodedEmail = btoa(emailContent).replace(/\+/g, "-").replace(
    /\//g,
    "_",
  ).replace(/=+$/, "");

  return await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${oauth.token}`,
      },
      body: JSON.stringify({
        raw: encodedEmail,
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

export default { sendEmail };
