import ActionTrigger from "../types/ActionTrigger.ts";

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
