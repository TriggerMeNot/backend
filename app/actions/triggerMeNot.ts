import { db } from "../db/config.ts";
import { eq } from "drizzle-orm/expressions";
import { services as serviceSchema } from "../schemas/services.ts";
import { actions as actionSchema } from "../schemas/actions.ts";
import ActionTrigger from "../types/ActionTrigger.ts";

const SERVICE_NAME = "TriggerMeNot";

const service = (await db.select().from(serviceSchema).where(
  eq(serviceSchema.name, SERVICE_NAME),
).limit(1))[0];

await db.insert(actionSchema).values({
  serviceId: service.id,
  name: "Fetch Request",
  description: "Fetch a URL",
}).onConflictDoNothing();

interface FetchSettings {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
}

async function fetchRequest(action: ActionTrigger) {
  const settings = action.settings as FetchSettings;

  await fetch(settings.url, {
    method: settings.method,
    headers: settings.headers,
    body: settings.body,
  });
}

export default {
  fetchRequest,
};
